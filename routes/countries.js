const express = require('express')
const router = express.Router()
const { readJsonFile } = require('../services/dataService')

/**
 * @route   GET /api/countries
 * @desc    Get a list of all countries
 * @access  Public
 * @returns {object[]} 200 - An array of country objects.
 */
router.get('/countries', async (req, res, next) => {
  try {
    const jsonData = await readJsonFile('meta/countries.json')
    res.status(200).json(jsonData)
  } catch (error) {
    next(error) // Pass errors to the error-handling middleware
  }
})

/**
 * @route   GET /api/region/:region
 * @desc    Get a list of countries filtered by region
 * @access  Public
 * @param   {string} region - The region to filter by (e.g., 'europe').
 * @returns {object[]} 200 - An array of country objects belonging to the specified region.
 * @returns {object[]} 200 - An empty array if the region has no countries.
 */
router.get('/region/:region', async (req, res, next) => {
  try {
    const jsonData = await readJsonFile('meta/countries.json')
    const region = req.params.region
    const filteredData = jsonData.filter((country) => country.region === region)
    res.status(200).json(filteredData)
  } catch (error) {
    next(error)
  }
})

module.exports = router
