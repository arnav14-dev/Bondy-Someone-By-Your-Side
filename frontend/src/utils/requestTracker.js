// Global request tracker to prevent duplicate requests across all components
const globalRequestTracker = new Map();
const requestCache = new Map();

export const isRequestInProgress = (key) => {
  return globalRequestTracker.has(key);
};

export const markRequestInProgress = (key) => {
  globalRequestTracker.set(key, true);
};

export const markRequestComplete = (key) => {
  globalRequestTracker.delete(key);
};

export const getCachedResponse = (key) => {
  return requestCache.get(key);
};

export const setCachedResponse = (key, value) => {
  requestCache.set(key, value);
};

export const clearCache = () => {
  requestCache.clear();
  globalRequestTracker.clear();
};
