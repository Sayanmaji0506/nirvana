/**
 * NIRVANA Core Database Schema Migration
 * PostGIS enabled: districts (POLYGON), road_segments (LINESTRING)
 */
exports.up = async function(knex) {
  // Ensure PostGIS extension is available
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // 1. users
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('phone', 20).notNullable().unique();
    table.enu('role', ['driver', 'reporter', 'official']).defaultTo('driver').notNullable();
    table.enu('kyc_status', ['unverified', 'pending', 'verified']).defaultTo('unverified').notNullable();
    table.enu('kyc_type', ['license', 'aadhaar', 'digilocker']).defaultTo('license');
    table.string('license_number', 50).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 2. otp_codes
  await knex.schema.createTable('otp_codes', (table) => {
    table.increments('id').primary();
    table.string('phone', 20).notNullable();
    table.string('code', 10).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('verified_at').nullable();
  });

  // 3. districts
  await knex.schema.createTable('districts', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.specificType('geom', 'geometry(POLYGON, 4326)').nullable();
  });

  // 4. road_segments
  await knex.schema.createTable('road_segments', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.integer('district_id').references('id').inTable('districts').onDelete('SET NULL');
    table.specificType('geom', 'geometry(LINESTRING, 4326)').notNullable();
    table.enu('status', ['open', 'risky', 'blocked']).defaultTo('open').notNullable();
    table.integer('risk_score').defaultTo(10).notNullable(); // 0 - 100
    table.timestamp('last_status_change').defaultTo(knex.fn.now());
  });

  // Spatial indexes
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST (geom);');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_road_segments_geom ON road_segments USING GIST (geom);');

  // 5. reports
  await knex.schema.createTable('reports', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.integer('road_segment_id').references('id').inTable('road_segments').onDelete('SET NULL');
    table.enu('type', ['blockage', 'landslide', 'flood', 'other']).notNullable();
    table.text('description').notNullable();
    table.string('audio_url', 500).nullable();
    table.string('image_url', 500).nullable();
    table.double('lat').notNullable();
    table.double('lng').notNullable();
    table.enu('status', ['pending', 'verified', 'rejected']).defaultTo('pending').notNullable();
    table.integer('upvotes').defaultTo(0).notNullable();
    table.integer('downvotes').defaultTo(0).notNullable();
    table.integer('reporter_weight').defaultTo(1).notNullable(); // official=3, driver=2, citizen=1
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('synced_at').defaultTo(knex.fn.now());
  });

  // 6. routes
  await knex.schema.createTable('routes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('origin').notNullable(); // { lat, lng, name }
    table.jsonb('destination').notNullable(); // { lat, lng, name }
    table.jsonb('waypoints').nullable(); // coordinates array
    table.enu('status', ['active', 'completed', 'cancelled']).defaultTo('active').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 7. risk_factors
  await knex.schema.createTable('risk_factors', (table) => {
    table.increments('id').primary();
    table.integer('road_segment_id').references('id').inTable('road_segments').onDelete('CASCADE');
    table.date('date').defaultTo(knex.fn.now());
    table.double('rainfall_mm').defaultTo(0.0);
    table.boolean('hazard_zone_flag').defaultTo(false);
    table.integer('open_report_count').defaultTo(0);
    table.double('rule_based_score').defaultTo(0.1);
    table.double('ml_score').nullable();
    table.timestamp('computed_at').defaultTo(knex.fn.now());
  });

  // 8. weather_cache
  await knex.schema.createTable('weather_cache', (table) => {
    table.increments('id').primary();
    table.integer('district_id').references('id').inTable('districts').onDelete('CASCADE');
    table.timestamp('fetched_at').defaultTo(knex.fn.now());
    table.jsonb('payload').notNullable();
  });

  // 9. notifications
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 50).notNullable();
    table.jsonb('payload').notNullable();
    table.timestamp('read_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 10. gateway_messages
  await knex.schema.createTable('gateway_messages', (table) => {
    table.increments('id').primary();
    table.string('phone', 20).notNullable();
    table.text('raw_text').notNullable();
    table.string('parsed_command', 100).nullable();
    table.text('response_text').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('gateway_messages');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('weather_cache');
  await knex.schema.dropTableIfExists('risk_factors');
  await knex.schema.dropTableIfExists('routes');
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('road_segments');
  await knex.schema.dropTableIfExists('districts');
  await knex.schema.dropTableIfExists('otp_codes');
  await knex.schema.dropTableIfExists('users');
};
