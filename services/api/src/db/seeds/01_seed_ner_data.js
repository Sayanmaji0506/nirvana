/**
 * NIRVANA Seed Data for Northeast India (NER)
 * Realistic coordinates covering Guwahati (Assam) <-> Shillong (Meghalaya) corridor
 */
exports.seed = async function(knex) {
  // Clear existing data in reverse FK order
  await knex('gateway_messages').del();
  await knex('notifications').del();
  await knex('weather_cache').del();
  await knex('risk_factors').del();
  await knex('routes').del();
  await knex('reports').del();
  await knex('road_segments').del();
  await knex('districts').del();
  await knex('otp_codes').del();
  await knex('users').del();

  // 1. Seed Users (driver, reporter, official)
  const users = await knex('users').insert([
    {
      name: 'Ratul Sharma',
      phone: '+919876543210',
      role: 'driver',
      kyc_status: 'verified',
      kyc_type: 'license',
      license_number: 'AS-01-2021-0045892'
    },
    {
      name: 'Priyanka Deka',
      phone: '+919876543211',
      role: 'reporter',
      kyc_status: 'verified',
      kyc_type: 'aadhaar'
    },
    {
      name: 'Inspector B. Sangma',
      phone: '+919876543212',
      role: 'official',
      kyc_status: 'verified',
      kyc_type: 'digilocker'
    }
  ]).returning('*');

  const driverUser = users[0];
  const reporterUser = users[1];
  const officialUser = users[2];

  // 2. Seed Districts with PostGIS Polygons (Kamrup Metro, Ri-Bhoi, East Khasi Hills)
  const districtsRaw = await knex.raw(`
    INSERT INTO districts (name, geom) VALUES
    ('Kamrup Metropolitan', ST_GeomFromText('POLYGON((91.55 26.05, 91.95 26.05, 91.95 26.25, 91.55 26.25, 91.55 26.05))', 4326)),
    ('Ri-Bhoi', ST_GeomFromText('POLYGON((91.70 25.75, 92.10 25.75, 92.10 26.05, 91.70 26.05, 91.70 25.75))', 4326)),
    ('East Khasi Hills', ST_GeomFromText('POLYGON((91.60 25.30, 92.15 25.30, 92.15 25.75, 91.60 25.75, 91.60 25.30))', 4326))
    RETURNING id, name;
  `);
  const districts = districtsRaw.rows;
  const kamrupId = districts.find(d => d.name === 'Kamrup Metropolitan').id;
  const ribhoiId = districts.find(d => d.name === 'Ri-Bhoi').id;
  const khasiId = districts.find(d => d.name === 'East Khasi Hills').id;

  // 3. Seed ~18 Road Segments along Guwahati - Nongpoh - Umiam - Shillong (NH-6 / GS Road)
  const segmentsData = [
    // Kamrup Metro (Guwahati urban to outskirts)
    { name: 'GS Road - Khanapara Flyover', district_id: kamrupId, line: 'LINESTRING(91.8210 26.1150, 91.8280 26.1080)', status: 'open', risk: 15 },
    { name: 'NH-27 - Beltola to Jorabat Junction', district_id: kamrupId, line: 'LINESTRING(91.8280 26.1080, 91.8650 26.0920)', status: 'open', risk: 20 },
    { name: 'Jorabat Incline Segment A', district_id: kamrupId, line: 'LINESTRING(91.8650 26.0920, 91.8790 26.0780)', status: 'risky', risk: 45 },
    { name: 'Guwahati-Byrnihat Border Stretch', district_id: kamrupId, line: 'LINESTRING(91.8790 26.0780, 91.8890 26.0520)', status: 'open', risk: 10 },
    { name: 'Guwahati Bypass - Jalukbari to Boragaon', district_id: kamrupId, line: 'LINESTRING(91.6620 26.1430, 91.7050 26.1320)', status: 'open', risk: 12 },
    { name: 'Guwahati Bypass - Boragaon to Lokhra', district_id: kamrupId, line: 'LINESTRING(91.7050 26.1320, 91.7450 26.1180)', status: 'open', risk: 15 },

    // Ri-Bhoi District (NH-6 Hill Highway)
    { name: 'NH-6 - Byrnihat Industrial Sector', district_id: ribhoiId, line: 'LINESTRING(91.8890 26.0520, 91.8950 26.0210)', status: 'open', risk: 18 },
    { name: 'NH-6 - Umling Mountain Curve', district_id: ribhoiId, line: 'LINESTRING(91.8950 26.0210, 91.8820 25.9650)', status: 'risky', risk: 55 },
    { name: 'NH-6 - Nongpoh Town Pass', district_id: ribhoiId, line: 'LINESTRING(91.8820 25.9650, 91.8810 25.9010)', status: 'open', risk: 25 },
    { name: 'NH-6 - Shangbangla Landslide Zone', district_id: ribhoiId, line: 'LINESTRING(91.8810 25.9010, 91.8910 25.8450)', status: 'blocked', risk: 85 },
    { name: 'Shangbangla Bypass Diversion', district_id: ribhoiId, line: 'LINESTRING(91.8810 25.9010, 91.9050 25.8750, 91.8910 25.8450)', status: 'risky', risk: 48 },
    { name: 'NH-6 - Umsning Bypass Section', district_id: ribhoiId, line: 'LINESTRING(91.8910 25.8450, 91.9050 25.7520)', status: 'open', risk: 20 },

    // East Khasi Hills (Umiam Lake to Shillong)
    { name: 'NH-6 - Umiam Lake Overlook Ridge', district_id: khasiId, line: 'LINESTRING(91.9050 25.7520, 91.9020 25.6680)', status: 'open', risk: 30 },
    { name: 'Old GS Road - Umiam Dam Road', district_id: khasiId, line: 'LINESTRING(91.9020 25.6680, 91.8950 25.6420)', status: 'open', risk: 22 },
    { name: 'Mawlai Incline Corridor', district_id: khasiId, line: 'LINESTRING(91.8950 25.6420, 91.8850 25.5920)', status: 'risky', risk: 40 },
    { name: 'Shillong Inner - Mawlai to Polo Ground', district_id: khasiId, line: 'LINESTRING(91.8850 25.5920, 91.8980 25.5810)', status: 'open', risk: 15 },
    { name: 'Shillong Central - Police Bazar Junction', district_id: khasiId, line: 'LINESTRING(91.8980 25.5810, 91.8830 25.5720)', status: 'open', risk: 20 },
    { name: 'Shillong-Cherrapunji Highway Link (NH-206)', district_id: khasiId, line: 'LINESTRING(91.8830 25.5720, 91.8710 25.5310)', status: 'open', risk: 35 }
  ];

  for (const seg of segmentsData) {
    await knex.raw(`
      INSERT INTO road_segments (name, district_id, geom, status, risk_score)
      VALUES (?, ?, ST_GeomFromText(?, 4326), ?, ?);
    `, [seg.name, seg.district_id, seg.line, seg.status, seg.risk]);
  }

  // Retrieve inserted segments
  const segments = await knex('road_segments').select('id', 'name', 'status');
  const blockedSegment = segments.find(s => s.status === 'blocked');
  const riskySegment = segments.find(s => s.status === 'risky');

  // 4. Seed Reports
  await knex('reports').insert([
    {
      user_id: reporterUser.id,
      road_segment_id: blockedSegment ? blockedSegment.id : null,
      type: 'landslide',
      description: 'Major rockfall and mudslide blocking both lanes at Shangbangla curve after torrential morning rain.',
      lat: 25.8730,
      lng: 91.8860,
      status: 'verified',
      upvotes: 6,
      downvotes: 0,
      reporter_weight: 2
    },
    {
      user_id: driverUser.id,
      road_segment_id: riskySegment ? riskySegment.id : null,
      type: 'flood',
      description: 'Water logging and loose gravel on Umling Mountain Curve. Heavy trucks slipping.',
      lat: 25.9920,
      lng: 91.8890,
      status: 'pending',
      upvotes: 3,
      downvotes: 1,
      reporter_weight: 1
    },
    {
      user_id: officialUser.id,
      type: 'blockage',
      description: 'Scheduled clearing operation near Jorabat junction. Expect 20-min rolling delays.',
      lat: 26.0850,
      lng: 91.8720,
      status: 'verified',
      upvotes: 10,
      downvotes: 0,
      reporter_weight: 3
    }
  ]);

  // 5. Seed Risk Factors for segments
  if (blockedSegment) {
    await knex('risk_factors').insert({
      road_segment_id: blockedSegment.id,
      rainfall_mm: 78.5,
      hazard_zone_flag: true,
      open_report_count: 2,
      rule_based_score: 0.85
    });
  }
  if (riskySegment) {
    await knex('risk_factors').insert({
      road_segment_id: riskySegment.id,
      rainfall_mm: 34.0,
      hazard_zone_flag: true,
      open_report_count: 1,
      rule_based_score: 0.55
    });
  }

  // 6. Seed Weather Cache
  await knex('weather_cache').insert([
    {
      district_id: kamrupId,
      payload: JSON.stringify({
        temp_c: 29.4,
        condition: 'Scattered Thunderstorms',
        rainfall_24h_mm: 22.0,
        humidity: 84,
        source: 'OpenWeatherMap'
      })
    },
    {
      district_id: ribhoiId,
      payload: JSON.stringify({
        temp_c: 24.1,
        condition: 'Heavy Rain / Monsoon Influx',
        rainfall_24h_mm: 68.5,
        humidity: 95,
        source: 'OpenWeatherMap'
      })
    },
    {
      district_id: khasiId,
      payload: JSON.stringify({
        temp_c: 20.8,
        condition: 'Dense Fog & Light Showers',
        rainfall_24h_mm: 31.0,
        humidity: 92,
        source: 'OpenWeatherMap'
      })
    }
  ]);

  console.log('[NIRVANA SEED] Database successfully populated with NER districts, road segments, users, and reports.');
};
