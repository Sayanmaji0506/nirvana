const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db');

const RISK_ENGINE_URL = process.env.RISK_ENGINE_URL || 'http://127.0.0.1:8000';

/**
 * GET /risk/segment/:id
 * Current risk score + contributing factors
 */
router.get('/segment/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const segment = await db('road_segments').where({ id }).first();
    if (!segment) {
      return res.status(404).json({ success: false, error: 'Road segment not found' });
    }

    const openReports = await db('reports')
      .where({ road_segment_id: id, status: 'pending' })
      .count('id as count');
    const openReportCount = parseInt(openReports[0].count) || 0;

    // Fetch from FastAPI microservice
    try {
      const resp = await axios.get(`${RISK_ENGINE_URL}/api/v1/segment/${id}/risk`, { timeout: 2000 });
      return res.status(200).json({
        success: true,
        data: {
          segment,
          openReportCount,
          ...resp.data
        }
      });
    } catch (e) {
      // Fallback rule-based computation
      return res.status(200).json({
        success: true,
        isFallback: true,
        data: {
          segment,
          risk_score: segment.risk_score / 100,
          status: segment.status,
          openReportCount,
          factors: {
            rainfall_mm: 25.0,
            hazard_zone_flag: true,
            terrain_elevation: 'mountain_pass'
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching segment risk:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch segment risk' });
  }
});

/**
 * POST /risk/evaluate (and compatibility for /api/v1/routes/evaluate)
 */
router.post('/evaluate', async (req, res) => {
  const { origin, destination, vehicleType, rainfall_mm, open_report_count } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: origin and destination are mandatory'
    });
  }

  try {
    const aiResponse = await axios.post(
      `${RISK_ENGINE_URL}/api/v1/predict`,
      {
        origin: typeof origin === 'object' ? origin.name || 'Origin' : origin,
        destination: typeof destination === 'object' ? destination.name || 'Destination' : destination,
        vehicle_type: vehicleType || 'truck',
        rainfall_mm: rainfall_mm || 35.0,
        hazard_zone_flag: true,
        open_report_count: open_report_count || 1
      },
      { timeout: 3000 }
    );

    return res.status(200).json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.warn('[RISK ENGINE] Microservice unreachable or timed out; returning fallback assessment');
    return res.status(200).json({
      success: true,
      isFallback: true,
      data: {
        risk_score: 0.45,
        risk_level: 'Moderate Risk',
        status: 'Risky',
        warnings: [
          'Pre-monsoon showers reported across Ri-Bhoi district',
          'Exercise extra caution along hill sections between Umling and Nongpoh'
        ]
      }
    });
  }
});

module.exports = router;
