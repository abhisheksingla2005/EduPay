function saveCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getCache(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function clearCache(key) {
  localStorage.removeItem(key);
}
