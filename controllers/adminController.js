const User = require('../models/User');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [users, requests, donations] = await Promise.all([
    User.find().select('-password').lean(),
    Request.find().populate('student', 'name').lean(),
    Donation.find().populate('donor', 'name').populate('request', 'title').lean(),
  ]);
  res.render('admin/dashboard', { title: 'Admin Dashboard', users, requests, donations });
});

exports.getCacheView = asyncHandler(async (req, res) => {
  const redis = req.app.locals.redis;
  
  if (!redis) {
    return res.render('admin/cache', { 
      title: 'Redis Cache', 
      redisEnabled: false, 
      keys: [], 
      message: 'Redis is not enabled. Set REDIS_URL to enable caching.' 
    });
  }

  try {
    // Get all keys matching our cache patterns
    const patterns = ['student:dashboard:*', 'donor:dashboard:*'];
    let allKeys = [];
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      allKeys = allKeys.concat(keys);
    }

    // Fetch values and TTL for each key
    const cacheData = await Promise.all(
      allKeys.map(async (key) => {
        const value = await redis.get(key);
        const ttl = await redis.ttl(key);
        let parsedValue = value;
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          // Keep as string if not JSON
        }
        return { key, value: parsedValue, ttl };
      })
    );

    res.render('admin/cache', { 
      title: 'Redis Cache', 
      redisEnabled: true, 
      keys: cacheData,
      totalKeys: cacheData.length 
    });
  } catch (err) {
    console.error('Redis error:', err);
    res.render('admin/cache', { 
      title: 'Redis Cache', 
      redisEnabled: true, 
      keys: [], 
      error: 'Failed to fetch cache data: ' + err.message 
    });
  }
});
