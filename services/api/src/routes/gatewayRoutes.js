const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { emitNewReport, emitEmergencyReroute } = require('../socket/socketHandler');

/**
 * POST /webhooks/gateway
 * Simulated USSD/SMS fallback gateway handler (§8)
 * Compatible with Twilio/Exotel webhook payloads or standard JSON
 */
router.post('/', async (req, res) => {
  // Support both JSON payload and form-urlencoded (standard for Twilio/Exotel)
  const phone = req.body.phone || req.body.From || '+919876543299';
  const rawText = (req.body.raw_text || req.body.Body || req.body.text || '').trim();

  if (!rawText) {
    return res.status(400).json({
      success: false,
      error: 'Empty SMS/USSD text payload'
    });
  }

  const upper = rawText.toUpperCase();
  let responseText = '';
  let parsedCommand = 'UNKNOWN';
  let createdReport = null;

  try {
    // 1. Command: HELP / USSD Menu
    if (upper === '*566#' || upper.startsWith('HELP')) {
      parsedCommand = 'HELP';
      responseText = 'NIRVANA NER Alert Gateway:\n1. BLOCKED <Road> KM<n>\n2. STATUS <Road>\n3. SAFE SPOTS\nReply with command or call 112.';
    }
    // 2. Command: BLOCKED / LANDSLIDE Report
    else if (upper.startsWith('BLOCKED') || upper.startsWith('LANDSLIDE')) {
      parsedCommand = 'REPORT_BLOCKAGE';

      // Example: "BLOCKED NH6 KM42 Landslide after Umling"
      const type = upper.startsWith('LANDSLIDE') ? 'landslide' : 'blockage';
      const description = `[SMS/USSD Report from ${phone}]: ${rawText}`;

      // Try to match segment name
      let segment = null;
      const segments = await db('road_segments').select('id', 'name');
      for (const seg of segments) {
        const segTokens = seg.name.toUpperCase().split(/[\s-]+/);
        if (segTokens.some(t => t.length > 2 && upper.includes(t))) {
          segment = seg;
          break;
        }
      }

      const segmentId = segment ? segment.id : null;
      const lat = 25.8730; // Default Ri-Bhoi landslide hotspot coordinates
      const lng = 91.8860;

      const [rep] = await db('reports').insert({
        road_segment_id: segmentId,
        type,
        description,
        lat,
        lng,
        status: 'pending',
        upvotes: 2,
        reporter_weight: 1
      }).returning('*');

      createdReport = rep;
      emitNewReport(rep);

      // If segment found, notify drivers
      if (segment) {
        emitEmergencyReroute({
          type: 'SMS_GATEWAY_ALERT',
          segmentId: segment.id,
          segmentName: segment.name,
          message: `SMS ALERT from ${phone}: ${segment.name} reported BLOCKED!`,
          rawText
        });
      }

      responseText = `NIRVANA: Report #${rep.id} received for ${segment ? segment.name : 'corridor'}. Emergency broadcast sent. Stay safe.`;
    }
    // 3. Command: STATUS
    else if (upper.startsWith('STATUS')) {
      parsedCommand = 'STATUS_QUERY';
      const roadQuery = upper.replace('STATUS', '').trim();

      const matched = await db('road_segments')
        .whereILike('name', `%${roadQuery}%`)
        .first();

      if (matched) {
        responseText = `NIRVANA STATUS: ${matched.name} is currently ${matched.status.toUpperCase()} (Risk Index: ${matched.risk_score}/100).`;
      } else {
        responseText = `NIRVANA STATUS: NH-6 Guwahati-Shillong corridor has 1 BLOCKED sector (Shangbangla). East Ri-Bhoi bypass active.`;
      }
    }
    // 4. Fallback response
    else {
      parsedCommand = 'GENERAL';
      responseText = `NIRVANA Gateway received: "${rawText}". Use "BLOCKED <road>" or dial *566# for menu.`;
    }

    // Record transaction in gateway_messages table
    await db('gateway_messages').insert({
      phone,
      raw_text: rawText,
      parsed_command: parsedCommand,
      response_text: responseText
    });

    return res.status(200).json({
      success: true,
      phone,
      raw_text: rawText,
      parsed_command: parsedCommand,
      response_text: responseText,
      report: createdReport
    });
  } catch (error) {
    console.error('Error handling gateway message:', error);
    return res.status(500).json({ success: false, error: 'Failed to process gateway webhook' });
  }
});

module.exports = router;
