/**
 * @file Authentication middleware.
 */

const { ApiError } = require('../utils/errors');

// It's crucial to load environment variables.
// Make sure you have `require('dotenv').config();` at the top of your main index.js file.
const validApiKeys = new Set(
    (process.env.VALID_API_KEYS || '')
        .split(',')
        .filter(key => key));

// Feature toggle for API key validation. Defaults to true if not specified.
const isApiKeyValidationEnabled = process.env.API_KEY_VALIDATION_ENABLED !== 'false';

/**
 * Middleware to protect routes with an API key.
 * It checks for 'x-api-key' in the request headers.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const requireApiKey = (req, res, next) => {
    // If validation is disabled via the feature toggle, skip the check.
    if (!isApiKeyValidationEnabled) {
        console.log('API key validation is disabled.');
        return next();
    }

    const apiKey = req.get('x-api-key');

    if (!apiKey || !validApiKeys.has(apiKey)) {
        console.warn('Forbidden: Invalid or missing API key.');
        return next(new ApiError(403, 'Forbidden: You do not have permission to access this resource.'));
    }

    next();
};

module.exports = { requireApiKey };