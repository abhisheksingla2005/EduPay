// Browser Cache using LocalStorage
// Provides caching with TTL (time-to-live) support

const BrowserCache = {
  // Save data to cache with optional TTL (in seconds)
  save: function(key, data, ttlSeconds = 60) {
    const item = {
      data: data,
      expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (e) {
      console.warn('[BrowserCache] Failed to save:', e.message);
      return false;
    }
  },

  // Get data from cache (returns null if expired or not found)
  get: function(key) {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (e) {
      console.warn('[BrowserCache] Failed to get:', e.message);
      return null;
    }
  },

  // Remove specific key from cache
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Clear all cached data with a specific prefix
  clearByPrefix: function(prefix) {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Clear all cache
  clearAll: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Make available globally
window.BrowserCache = BrowserCache;
