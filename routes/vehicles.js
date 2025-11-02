const express = require('express')
const router = express.Router()
const {
  readJsonFile,
  enrichWithOils,
  filterVehicleData,
} = require('../services/dataService')

// A generic handler to reduce code duplication for vehicle routes.
const getVehicleData = async (req, res, next) => {
  try {
    const { region, country } = req.params;

    // Determine filename based on whether a country is specified.
    const fileName = country
      ? `${region}/vechile_${country}.json`
      : `${region}/vechile_${region}.json`;

    console.log("Reading data from:", fileName);

    const vehicleData = await readJsonFile(fileName);
    let results = vehicleData.vehicle_brands;

    if (req.query.include_oils === 'true') {
      results = await enrichWithOils(results, region, country);
    }

    const filteredResults = filterVehicleData(results, req.query);
    res.status(200).json(filteredResults);
  } catch (error) {
    next(error);
  }
};
/**
 * @route   GET /api/vehicles/:region
 * @desc    Get vehicle data for a specific region, with optional filtering.
 * @access  Public
 * @param   {string} region - The region to fetch vehicle data for (e.g., 'europe').
 * @query   {string} [type] - Optional. Filter by vehicle type (e.g., 'Car', 'Bike').
 * @query   {string} [brand] - Optional. Filter by vehicle brand (e.g., 'BMW').
 * @query   {string} [fuel_type] - Optional. Filter by fuel type (e.g., 'Diesel').
 * @query   {boolean} [include_oils] - Optional. If 'true', enriches the response with recommended oil data.
 * @returns {object} 200 - An object containing vehicle data, filtered and enriched as per query parameters.
 * @returns {object} 404 - If the data file for the specified region is not found.
 * @example
 * // Get all vehicles for Europe
 * /api/vehicles/europe
 * // Get only BMW cars in Europe with oil recommendations
 * /api/vehicles/europe?type=Car&brand=BMW&include_oils=true
 */
router.get('/vehicles/:region', getVehicleData);

/**
 * @route   GET /api/vehicles/:region/country/:country
 * @desc    Get vehicle data for a specific country within a region.
 */
router.get('/vehicles/:region/country/:country', getVehicleData);

module.exports = router
