const express = require('express');
const router = express.Router();
const { clearCacheForRegion, clearAllCache } = require('../services/cacheService');

/**
 * @route   POST /api/cache/clear
 * @desc    Clears the cache. Can clear for a specific region or all regions.
 * @access  Protected
 * @header  x-api-key - The secret API key required to access this endpoint.
 * @body    {string} [region] - Optional. The region to clear the cache for. If omitted, all cache is cleared.
 * @returns {object} 200 - A success message.
 * @example
 * // Clear cache for 'europe'
 * POST /api/cache/clear
 * Body: { "region": "europe" }
 *
 * // Clear all cache
 * POST /api/cache/clear
 * Body: {}
 */
router.post('/cache/clear', (req, res) => {
    const { region } = req.body;

    if (region) {
        clearCacheForRegion(region);
        res.status(200).json({ message: `Cache for region '${region}' has been cleared.` });
    } else {
        clearAllCache();
        res.status(200).json({ message: 'All cache has been cleared.' });
    }
});

module.exports = router;