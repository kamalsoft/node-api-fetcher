const express = require('express')
const router = express.Router()
const { requireApiKey } = require('../middleware/authMiddleware');

const countriesRouter = require('./countries')
const vehiclesRouter = require('./vehicles')
const oilsRouter = require('./oils')
const genericRouter = require('./generic')
const cacheRouter = require('./cache');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify the API is running.
 * @access  Public
 * @returns {string} 200 - A confirmation message that the API is running.
 */
router.get('/health', (req, res) => {
  res.status(200).send('API is running. Please specify a valid endpoint.')
})

// Add middleware to parse JSON bodies
router.use(express.json());

router.use(requireApiKey); // Apply API key authentication to all subsequent routes
router.use(countriesRouter)
router.use(vehiclesRouter)
router.use(oilsRouter)
router.use(cacheRouter);
router.use(genericRouter)

module.exports = router
