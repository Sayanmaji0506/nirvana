const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const routingService = require('../services/graphhopper.js');

/**
 * POST /routes/plan
 * Plan route with live road status and risk weighting
 * Role check: Drivers and Officials only (Reporters restricted)
 */
router.post('/plan', async (req, res) => {
  const { origin, destination, vehicle_type, user_id } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({
      success: false,
      error: 'Missing required origin or destination points'
    });
  }

  try {
    // If user_id provided, check if reporter is trying to plan route
    if (user_id) {
      const user = await db('users').where({ id: user_id }).first();
      if (user && user.role === 'reporter') {
        return res.status(403).json({
          success: false,
          error: 'Reporter accounts are restricted to map observation and hazard reporting only. Route planning requires Driver status.'
        });
      }
    }

    const routePlan = await routingService.planRoute(origin, destination, vehicle_type || 'truck');

    // Save active route record if user_id present
    let savedRoute = null;
    if (user_id) {
      const [r] = await db('routes').insert({
        user_id,
        origin: JSON.stringify(origin),
        destination: JSON.stringify(destination),
        waypoints: JSON.stringify(routePlan.coordinates),
        status: 'active'
      }).returning('*');
      savedRoute = r;
    }

    return res.status(200).json({
      success: true,
      data: {
        routeId: savedRoute ? savedRoute.id : routePlan.routeId,
        ...routePlan
      }
    });
  } catch (error) {
    console.error('Error planning route:', error);
    return res.status(500).json({ success: false, error: 'Failed to plan route' });
  }
});

/**
 * GET /routes/:id/reroute-check
 * Re-evaluate an active route against current road statuses
 * Implements Scenario A (Route Clear) and Scenario B (Emergency / Reroute)
 */
router.get('/:id/reroute-check', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await routingService.checkRouteStatus(id);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error checking reroute status:', error);
    return res.status(500).json({ success: false, error: 'Failed to evaluate reroute status' });
  }
});

module.exports = router;
