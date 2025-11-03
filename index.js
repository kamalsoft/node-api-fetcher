// 1. Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const express = require('express')
const cors = require('cors')
const morgan = require('morgan');
const { ApiError } = require('./utils/errors')
const apiRoutes = require('./routes')
const logger = require('./services/loggerService');

// 2. Initialize the Express app
const app = express()
app.use(cors()) // Enable All CORS Requests
const PORT = 3000 // Define the port our server will run on

// Add request logging middleware (morgan)
// This will log all HTTP requests to the winston logger
app.use(morgan('combined', { stream: logger.stream }));

// 3. API Endpoints
// All API routes are now handled by the router
app.use('/api', apiRoutes)

// 4. Centralized Error-Handling Middleware
// This middleware catches any errors passed by next(error).
app.use((err, req, res, next) => {
  // Log the error using our new structured logger
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

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
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  // The endpoint list is now logged via morgan/winston, so we can simplify this.
});

// 6. Global Unhandled Error Logging
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ message: 'Unhandled Rejection at:', reason: reason, promise });
  // Optionally, exit the process. It's often safer to restart.
});

process.on('uncaughtException', (error) => {
  logger.error({ message: 'Uncaught Exception thrown:', error });
  process.exit(1); // It's critical to exit on an uncaught exception
});
