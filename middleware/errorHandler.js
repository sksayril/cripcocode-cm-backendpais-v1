// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails = null;

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errorDetails = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorDetails = {
      field: err.path,
      message: 'The provided ID is not valid',
      value: err.value
    };
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      statusCode = 400;
      message = 'Duplicate field value';
      const field = Object.keys(err.keyValue)[0];
      errorDetails = {
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        value: err.keyValue[field]
      };
    } else {
      statusCode = 500;
      message = 'Database operation failed';
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Access forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'BadRequestError') {
    statusCode = 400;
    message = err.message || 'Bad request';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || 'Request failed';
  } else if (err.message) {
    message = err.message;
  }

  // Create error response
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add error details if available
  if (errorDetails) {
    errorResponse.errors = errorDetails;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  asyncHandler
};
