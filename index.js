// 1. Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const express = require('express')
const cors = require('cors')
const { ApiError } = require('./utils/errors')
const apiRoutes = require('./routes')

// 2. Initialize the Express app
const app = express()
app.use(cors()) // Enable All CORS Requests
const PORT = 3000 // Define the port our server will run on

// 3. API Endpoints
// All API routes are now handled by the router
app.use('/api', apiRoutes)

// 4. Centralized Error-Handling Middleware
// This middleware catches any errors passed by next(error).
app.use((err, req, res, next) => {
  console.error(err.stack) // Log the full error stack for debugging

  // Handle custom ApiErrors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  // For all other errors, send a generic 500 server error
  // Avoid leaking implementation details in production
  res.status(500).json({ message: 'Internal Server Error' })
})

// 5. Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log('\nAvailable Endpoints:');
  console.log('--------------------------------------------------------------------------');

  // Health Check
  console.log(`[GET]    /api/health\n         - Health check for the API.`);

  // Generic Endpoints
  console.log(`\n[GET]    /api/countries\n         - Get a list of all countries.`);
  console.log(`\n[GET]    /api/region/:region\n         - Example: /api/region/europe\n         - Get country data for a specific region.`);

  // Vehicle Endpoints
  console.log(`\n[GET]    /api/vehicles/:region\n         - Example: /api/vehicles/europe`);
  console.log(`         - Query Params: type, brand, fuel_type, include_oils=true`);
  console.log(`         - Example: /api/vehicles/europe?type=Car&brand=BMW&include_oils=true`);

  console.log(`\n[GET]    /api/vehicles/:region/country/:country`);
  console.log(`         - Example: /api/vehicles/europe/country/italy`);
  console.log(`         - Get vehicle data for a specific country.`);

  // Oil Endpoints
  console.log(`\n[GET]    /api/oils/:region`);
  console.log(`         - Example: /api/oils/europe`);
  console.log(`         - Get all oil products for a region.`);

  // Cache Management (Protected)
  console.log(`\n[POST]   /api/cache/clear`);
  console.log(`         - (Protected) Clears the cache. Requires "x-api-key" header.`);
  console.log('--------------------------------------------------------------------------');
})
