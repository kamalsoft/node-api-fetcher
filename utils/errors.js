/**
 * @description Base class for custom API errors.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * @description Represents a 404 Not Found error.
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found.') {
    super(404, message)
  }
}

module.exports = { ApiError, NotFoundError }
