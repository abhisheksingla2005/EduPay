const { createClient } = require('redis');

// Provide a no-op fallback client if Redis is unavailable so the app keeps running
const nullClient = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 0,
  connect: async () => {},
  on: () => {},
};

function buildClient() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  return createClient({
    url,
    // Limit reconnection attempts to avoid noisy endless error spam
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 2) return false; // stop after 3 attempts
        return Math.min(50 * retries, 500);
      },
    },
  });
}

let redis = buildClient();
let ready = false;
let loggedFirstError = false;

redis.on('error', (err) => {
  if (!loggedFirstError) {
    console.warn('[Redis] Connection error:', err.message);
    loggedFirstError = true;
  }
});
redis.on('connect', () => console.log('[Redis] Connecting...'));
redis.on('ready', () => { ready = true; console.log('[Redis] Ready'); });
redis.on('end', () => { ready = false; console.warn('[Redis] Connection closed'); });

async function initRedis() {
  try {
    if (!ready) await redis.connect();
    return redis;
  } catch (e) {
    console.warn('[Redis] Failed to initialize, using in-memory null client:', e.message);
    redis = nullClient;
    return redis;
  }
}

module.exports = { redis, initRedis };
