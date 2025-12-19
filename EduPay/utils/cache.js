// Lightweight cache helper wrapping Redis JSON storage
// Falls back gracefully when redis is not available.

function getClient(app) {
  return app?.locals?.redis || null;
}

async function getJSON(app, key) {
  const client = getClient(app);
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[Cache:getJSON] failed', e.message);
    return null;
  }
}

async function setJSON(app, key, value, ttlSeconds = 60) {
  const client = getClient(app);
  if (!client) return false;
  try {
    const str = JSON.stringify(value);
    if (ttlSeconds) {
      await client.set(key, str, { EX: ttlSeconds });
    } else {
      await client.set(key, str);
    }
    return true;
  } catch (e) {
    console.warn('[Cache:setJSON] failed', e.message);
    return false;
  }
}

async function del(app, key) {
  const client = getClient(app);
  if (!client) return false;
  try { await client.del(key); return true; } catch(e){ console.warn('[Cache:del] failed', e.message); return false; }
}

module.exports = { getJSON, setJSON, del };
