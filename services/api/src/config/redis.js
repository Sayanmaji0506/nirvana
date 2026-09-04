const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => {
  console.warn('[REDIS WARNING] Connection error (running in fallback memory mode):', err.message);
});

redisClient.on('connect', () => {
  console.log('[REDIS] Connected to Redis cache successfully');
});

// Connect lazily / non-blocking
redisClient.connect().catch(() => {
  console.log('[REDIS] Offline fallback enabled for local dev.');
});

module.exports = redisClient;
