const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /roads/status?bbox=minLng,minLat,maxLng,maxLat
 * Returns GeoJSON FeatureCollection of road segments with current statuses
 */
router.get('/status', async (req, res) => {
  try {
    const { bbox } = req.query;
    let query = db('road_segments')
      .select(
        'id',
        'name',
        'district_id',
        'status',
        'risk_score',
        'last_status_change',
        db.raw('ST_AsGeoJSON(geom) as geojson')
      );

    if (bbox) {
      const parts = bbox.split(',').map(Number);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        query = query.whereRaw(
          'ST_Intersects(geom, ST_MakeEnvelope(?, ?, ?, ?, 4326))',
          [minLng, minLat, maxLng, maxLat]
        );
      }
    }

    const segments = await query;

    const featureCollection = {
      type: 'FeatureCollection',
      features: segments.map(seg => {
        let geometry = null;
        try {
          geometry = JSON.parse(seg.geojson);
        } catch (e) {
          geometry = null;
        }

        return {
          type: 'Feature',
          id: seg.id,
          geometry,
          properties: {
            id: seg.id,
            name: seg.name,
            district_id: seg.district_id,
            status: seg.status, // 'open' | 'risky' | 'blocked'
            risk_score: seg.risk_score,
            last_status_change: seg.last_status_change
          }
        };
      })
    };

    return res.status(200).json({
      success: true,
      data: featureCollection
    });
  } catch (error) {
    console.error('Error fetching road statuses:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch road statuses' });
  }
});

module.exports = router;
