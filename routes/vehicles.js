const express = require('express')
const router = express.Router()
const {
  readJsonFile,
  enrichWithOils,
  filterVehicleData,
} = require('../services/dataService')

/**
 * A generic handler for fetching and processing vehicle data.
 * It handles filtering and oil enrichment based on request parameters.
 */
const getVehicleData = async (req, res, next) => {
  try {
    const { region, country } = req.params;

    // Determine filename based on whether a country is specified.
    const fileName = country
      ? `${region.toLowerCase()}/vechile_${country.toLowerCase()}.json`
      : `${region.toLowerCase()}/vechile_${region.toLowerCase()}.json`;

    console.log("Reading data from:", fileName);

    const vehicleData = await readJsonFile(fileName);
    // Deep clone the data to ensure we don't modify the original/cached data.
    let results = JSON.parse(JSON.stringify(vehicleData.vehicle_brands || {}));

    // 1. Filter the data first.
    results = filterVehicleData(results, req.query);

    // 2. If requested, enrich the *filtered* data with oils.
    if (req.query.include_oils === 'true') {
      results = await enrichWithOils(results, region, country);
    }

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * A generic handler for fetching a list of brands for a region or country.
 */
const getBrandsList = async (req, res, next) => {
  try {
    const { region, country } = req.params;
    const fileName = country
      ? `${region.toLowerCase()}/vechile_${country.toLowerCase()}.json`
      : `${region.toLowerCase()}/vechile_${region.toLowerCase()}.json`;

    const vehicleData = await readJsonFile(fileName);
    const vehicleTypes = vehicleData.vehicle_brands || {};
    const brands = Object.values(vehicleTypes).flat().map(b => b.brand);

    res.status(200).json({ region: country || region, brands: [...new Set(brands)] });
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
/**
 * @route   GET /api/vehicles/:region/brands
 * @desc    Get a list of all vehicle brands for a specific region.
 * @access  Public
 * @param   {string} region - The region to fetch brands for (e.g., 'europe').
 * @returns {object} 200 - An object containing the region and a list of unique brands.
 */
router.get('/vehicles/:region/brands', getBrandsList);

/**
 * @route   GET /api/vehicles/:region/country/:country/brands
 * @desc    Get a list of vehicle brands for a specific country.
 * @access  Public
 */
router.get('/vehicles/:region/country/:country/brands', getBrandsList);

module.exports = router
