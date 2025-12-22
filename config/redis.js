const { createClient } = require('redis');

// Global Redis client and state
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection
 * @returns {Promise<object|null>} Redis client or null if connection fails
 */
async function initRedis() {
  const url = process.env.REDIS_URL;
  
  if (!url) {
    console.log('[Redis] REDIS_URL not set - caching disabled');
    return null;
  }

  try {
    redisClient = createClient({ url });

    redisClient.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
      isConnected = false;
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Connected and ready!');
      isConnected = true;
    });

    redisClient.on('end', () => {
      console.log('[Redis] Connection closed');
      isConnected = false;
    });

    await redisClient.connect();
    
    // Verify connection works
    const pong = await redisClient.ping();
    console.log('[Redis] PING response:', pong);
    
    return redisClient;
  } catch (err) {
    console.error('[Redis] Failed to connect:', err.message);
    redisClient = null;
    isConnected = false;
    return null;
  }
}

/**
 * Get the active Redis client
 */
function getClient() {
  return isConnected ? redisClient : null;
}

/**
 * Check if Redis is ready
 */
function isReady() {
  return isConnected && redisClient !== null;
}

module.exports = { initRedis, getClient, isReady };
