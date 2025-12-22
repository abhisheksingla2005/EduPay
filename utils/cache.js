// Redis Cache Helper
// Uses the shared Redis client from config/redis.js

const { getClient, isReady } = require('../config/redis');

/**
 * Get JSON value from cache
 */
async function getJSON(app, key) {
  const client = getClient();
  if (!client) {
    return null;
  }
  try {
    const raw = await client.get(key);
    if (raw) {
      console.log(`[Cache] GET ${key} - HIT`);
      return JSON.parse(raw);
    }
    console.log(`[Cache] GET ${key} - MISS`);
    return null;
  } catch (e) {
    console.error('[Cache] GET error:', e.message);
    return null;
  }
}

/**
 * Set JSON value in cache with TTL
 */
async function setJSON(app, key, value, ttlSeconds = 300) {
  const client = getClient();
  if (!client) {
    console.log('[Cache] SET skipped - no Redis connection');
    return false;
  }
  try {
    const str = JSON.stringify(value);
    await client.set(key, str, { EX: ttlSeconds });
    
    // Verify it was stored
    const verify = await client.get(key);
    if (verify) {
      console.log(`[Cache] SET ${key} - OK (TTL: ${ttlSeconds}s)`);
      return true;
    } else {
      console.error(`[Cache] SET ${key} - FAILED (verification failed)`);
      return false;
    }
  } catch (e) {
    console.error('[Cache] SET error:', e.message);
    return false;
  }
}

/**
 * Delete a key from cache
 */
async function del(app, key) {
  const client = getClient();
  if (!client) return false;
  try {
    await client.del(key);
    console.log(`[Cache] DEL ${key} - OK`);
    return true;
  } catch (e) {
    console.error('[Cache] DEL error:', e.message);
    return false;
  }
}

/**
 * Get all keys matching a pattern
 */
async function keys(pattern) {
  const client = getClient();
  if (!client) return [];
  try {
    return await client.keys(pattern);
  } catch (e) {
    console.error('[Cache] KEYS error:', e.message);
    return [];
  }
}

/**
 * Get TTL of a key
 */
async function ttl(key) {
  const client = getClient();
  if (!client) return -2;
  try {
    return await client.ttl(key);
  } catch (e) {
    console.error('[Cache] TTL error:', e.message);
    return -2;
  }
}

/**
 * Get raw value from cache
 */
async function get(key) {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch (e) {
    console.error('[Cache] GET error:', e.message);
    return null;
  }
}

module.exports = { getJSON, setJSON, del, keys, ttl, get, isReady };
