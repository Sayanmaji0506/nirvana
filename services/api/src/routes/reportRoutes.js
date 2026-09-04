const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const storageService = require('../services/imageStorage');
const { emitNewReport, emitRoadStatusUpdate, emitEmergencyReroute } = require('../socket/socketHandler');
const routingService = require('../services/graphhopper.js');

/**
 * GET /reports?status=pending|verified
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = db('reports')
      .leftJoin('users', 'reports.user_id', 'users.id')
      .leftJoin('road_segments', 'reports.road_segment_id', 'road_segments.id')
      .select(
        'reports.*',
        'users.name as reporter_name',
        'users.role as reporter_role',
        'road_segments.name as road_segment_name'
      )
      .orderBy('reports.created_at', 'desc');

    if (status) {
      query = query.where('reports.status', status);
    }

    const reports = await query;
    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

/**
 * POST /reports (multipart)
 * Handles text, image, and voice notes
 */
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { type, category, description, lat, lng, user_id, road_segment_id } = req.body;
      const reportType = type || category || 'other';

      if (!description && !req.files?.image && !req.files?.audio) {
        return res.status(400).json({
          success: false,
          error: 'At least one input (text description, image, or audio note) is required'
        });
      }

      const latitude = parseFloat(lat) || 25.8730;
      const longitude = parseFloat(lng) || 91.8860;

      // Handle file uploads (ImageKit / local fallback)
      let imageUrl = null;
      let audioUrl = null;

      if (req.files && req.files.image && req.files.image[0]) {
        imageUrl = await storageService.saveFile(req.files.image[0], 'nirvana_images');
      }
      if (req.files && req.files.audio && req.files.audio[0]) {
        audioUrl = await storageService.saveFile(req.files.audio[0], 'nirvana_voice');
      }

      // Find nearest road segment if not specified
      let segmentId = road_segment_id ? parseInt(road_segment_id) : null;
      if (!segmentId) {
        const nearest = await db.raw(`
          SELECT id, name, ST_Distance(geom, ST_SetSRID(ST_Point(?, ?), 4326)) as dist
          FROM road_segments
          ORDER BY dist ASC
          LIMIT 1;
        `, [longitude, latitude]);

        if (nearest.rows && nearest.rows.length > 0) {
          segmentId = nearest.rows[0].id;
        }
      }

      // Determine reporter weight
      let reporterWeight = 1;
      let reporterUserId = user_id ? parseInt(user_id) : null;
      if (reporterUserId) {
        const u = await db('users').where({ id: reporterUserId }).first();
        if (u) {
          if (u.role === 'official') reporterWeight = 3;
          else if (u.role === 'driver') reporterWeight = 2;
        }
      }

      const [newReport] = await db('reports').insert({
        user_id: reporterUserId,
        road_segment_id: segmentId,
        type: reportType,
        description: description || `Reported ${reportType} via mobile app`,
        image_url: imageUrl,
        audio_url: audioUrl,
        lat: latitude,
        lng: longitude,
        status: 'pending',
        upvotes: 1,
        downvotes: 0,
        reporter_weight: reporterWeight
      }).returning('*');

      // Real-time broadcast
      emitNewReport(newReport);

      return res.status(201).json({
        success: true,
        message: 'Hazard report submitted and queued for community verification',
        data: newReport
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      return res.status(500).json({ success: false, error: 'Failed to submit report' });
    }
  }
);

/**
 * POST /reports/:id/vote
 * Community upvote/downvote with tiered reporter weights
 */
router.post('/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { direction, user_id } = req.body; // 'up' or 'down'

  try {
    const report = await db('reports').where({ id }).first();
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    let weight = 1;
    if (user_id) {
      const u = await db('users').where({ id: user_id }).first();
      if (u) {
        if (u.role === 'official') weight = 3;
        else if (u.role === 'driver') weight = 2;
      }
    }

    const updates = {};
    if (direction === 'down') {
      updates.downvotes = report.downvotes + weight;
    } else {
      updates.upvotes = report.upvotes + weight;
    }

    // Check verification threshold: net upvotes >= 5 triggers automatic verification
    const netVotes = (updates.upvotes !== undefined ? updates.upvotes : report.upvotes) -
                     (updates.downvotes !== undefined ? updates.downvotes : report.downvotes);

    let statusUpdated = false;
    if (netVotes >= 5 && report.status === 'pending') {
      updates.status = 'verified';
      statusUpdated = true;

      // Update associated road segment to blocked or risky
      if (report.road_segment_id) {
        const newSegStatus = (report.type === 'landslide' || report.type === 'blockage') ? 'blocked' : 'risky';
        const newRisk = newSegStatus === 'blocked' ? 90 : 60;
        await db('road_segments').where({ id: report.road_segment_id }).update({
          status: newSegStatus,
          risk_score: newRisk,
          last_status_change: new Date()
        });

        const segment = await db('road_segments').where({ id: report.road_segment_id }).first();
        emitRoadStatusUpdate(segment);

        // If blocked, trigger emergency reroute alert!
        if (newSegStatus === 'blocked') {
          const alternate = routingService.solveCorridorRoute(
            { lat: 26.1150, lng: 91.8210 },
            { lat: 25.5720, lng: 91.8830 },
            [segment]
          );

          emitEmergencyReroute({
            type: 'ROAD_BLOCKAGE',
            segmentId: segment.id,
            segmentName: segment.name,
            reason: report.description,
            message: `⚠️ EMERGENCY: ${segment.name} is BLOCKED due to ${report.type}! Dynamic reroute suggested.`,
            alternateRoute: alternate
          });
        }
      }
    }

    const [updatedReport] = await db('reports').where({ id }).update(updates).returning('*');

    return res.status(200).json({
      success: true,
      data: updatedReport,
      autoVerified: statusUpdated
    });
  } catch (error) {
    console.error('Error voting on report:', error);
    return res.status(500).json({ success: false, error: 'Failed to record vote' });
  }
});

/**
 * PATCH /reports/:id/verify
 * Official-only direct verification
 */
router.patch('/:id/verify', authenticate, requireRole(['official']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'verified' | 'rejected'

  try {
    const report = await db('reports').where({ id }).first();
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const newStatus = status === 'rejected' ? 'rejected' : 'verified';
    const [updatedReport] = await db('reports').where({ id }).update({ status: newStatus }).returning('*');

    if (newStatus === 'verified' && report.road_segment_id) {
      const segStatus = (report.type === 'landslide' || report.type === 'blockage') ? 'blocked' : 'risky';
      await db('road_segments').where({ id: report.road_segment_id }).update({
        status: segStatus,
        risk_score: segStatus === 'blocked' ? 95 : 65,
        last_status_change: new Date()
      });

      const segment = await db('road_segments').where({ id: report.road_segment_id }).first();
      emitRoadStatusUpdate(segment);

      if (segStatus === 'blocked') {
        const alternate = routingService.solveCorridorRoute(
          { lat: 26.1150, lng: 91.8210 },
          { lat: 25.5720, lng: 91.8830 },
          [segment]
        );

        emitEmergencyReroute({
          type: 'OFFICIAL_BLOCKAGE_CONFIRMED',
          segmentId: segment.id,
          segmentName: segment.name,
          reason: report.description,
          message: `🚨 OFFICIAL DISRUPTION CONFIRMED: ${segment.name} is BLOCKED! Alternate route offered.`,
          alternateRoute: alternate
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${newStatus} by official authorization`,
      data: updatedReport
    });
  } catch (error) {
    console.error('Error verifying report:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify report' });
  }
});

module.exports = router;
