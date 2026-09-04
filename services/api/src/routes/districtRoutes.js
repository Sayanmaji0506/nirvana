const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /districts
 * Returns district boundaries as GeoJSON FeatureCollection
 */
router.get('/', async (req, res) => {
  try {
    const districts = await db('districts')
      .select('id', 'name', db.raw('ST_AsGeoJSON(geom) as geojson'));

    const featureCollection = {
      type: 'FeatureCollection',
      features: districts.map(d => ({
        type: 'Feature',
        id: d.id,
        geometry: JSON.parse(d.geojson),
        properties: {
          id: d.id,
          name: d.name
        }
      }))
    };

    return res.status(200).json({
      success: true,
      data: featureCollection
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch districts' });
  }
});

module.exports = router;
