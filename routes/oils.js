const express = require('express')
const router = express.Router()
const { readJsonFile } = require('../services/dataService')

/**
 * @route   GET /api/oils/viscosity-mapping
 * @desc    Get the viscosity to recommended oils mapping.
 * @access  Public
 * @returns {object} 200 - The JSON object containing the viscosity mapping.
 */
router.get('/oils/viscosity-mapping', async (req, res, next) => {
  try {
    const jsonData = await readJsonFile('oils/gulf_oil_viscosity_mapping.json')
    res.status(200).json(jsonData)
  } catch (error) {
    next(error)
  }
})

module.exports = router
