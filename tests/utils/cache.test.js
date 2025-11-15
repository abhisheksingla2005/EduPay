const { getJSON, setJSON, del } = require('../../utils/cache');

// Mock app with a minimal Redis-like client
function makeAppWithRedis() {
  const store = new Map();
  return {
    locals: {
      redis: {
        async get(key) { return store.get(key) || null; },
        async set(key, val, opts) { // accept options like { EX: seconds }
          store.set(key, val);
          return 'OK';
        },
        async del(key) { store.delete(key); return 1; },
      }
    }
  };
}

const appNoRedis = { locals: {} };

describe('utils/cache', () => {
  test('set/get/del with redis client', async () => {
    const app = makeAppWithRedis();
    const key = 'k1';
    await setJSON(app, key, { a: 1 }, 1);
    const got = await getJSON(app, key);
    expect(got).toEqual({ a: 1 });
    await del(app, key);
    const after = await getJSON(app, key);
    expect(after).toBeNull();
  });

  test('graceful no-redis fallback', async () => {
    const key = 'k2';
    const set = await setJSON(appNoRedis, key, { a: 2 }, 1);
    expect(set).toBe(false);
    const got = await getJSON(appNoRedis, key);
    expect(got).toBeNull();
    const removed = await del(appNoRedis, key);
    expect(removed).toBe(false);
  });
});
