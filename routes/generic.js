const express = require('express')
const router = express.Router()
const { readJsonFile } = require('../services/dataService')

/**
 * @route   GET /api/:fileName
 * @desc    Dynamically fetches and serves a JSON file from the Data directory.
 * @access  Public
 * @param   {string} fileName - The name of the JSON file to retrieve (without the .json extension).
 * @returns {object} 200 - The JSON content of the requested file.
 * @returns {object} 404 - If the requested file is not found.
 */
router.get('/:fileName', async (req, res, next) => {
  try {
    const jsonData = await readJsonFile(`${req.params.fileName}.json`)
    res.status(200).json(jsonData)
  } catch (error) {
    next(error)
  }
})

module.exports = router
