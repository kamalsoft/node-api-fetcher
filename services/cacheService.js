/**
 * @file Manages a simple in-memory cache.
 */

const oilDataCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // Cache expires after 15 minutes

/**
 * Gets data from the oil cache for a specific region.
 * @param {string} region - The region key.
 * @returns {any|undefined} The cached data or undefined if not found.
 */
const getFromCache = (region) => {
    const cachedEntry = oilDataCache.get(region);

    if (!cachedEntry) {
        return undefined;
    }

    const isExpired = (Date.now() - cachedEntry.timestamp) > CACHE_TTL_MS;

    if (isExpired) {
        oilDataCache.delete(region);
        console.log(`Cache for '${region}' has expired and was cleared.`);
        return undefined;
    }

    return cachedEntry.data;
};

/**
 * Sets data in the oil cache for a specific region.
 * @param {string} region - The region key.
 * @param {any} data - The data to cache.
 */
const setInCache = (region, data) => {
    const cacheEntry = {
        data: data,
        timestamp: Date.now(),
    };
    oilDataCache.set(region, cacheEntry);
};

/**
 * Clears the cache for a specific region.
 * @param {string} region - The region key to clear.
 * @returns {boolean} True if the region was in the cache and has been removed, false otherwise.
 */
const clearCacheForRegion = (region) => oilDataCache.delete(region);

/**
 * Clears the entire oil data cache.
 */
const clearAllCache = () => {
    oilDataCache.clear();
    console.log('All cache cleared.');
};

module.exports = { getFromCache, setInCache, clearCacheForRegion, clearAllCache };