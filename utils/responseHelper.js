// Standardized response helper functions
class ResponseHelper {
  // Success responses
  static success(res, data = null, message = 'Operation successful', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static updated(res, data, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }

  static deleted(res, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200);
  }

  // Error responses
  static error(res, message = 'Operation failed', statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static conflict(res, message = 'Resource conflict', errors = null) {
    return this.error(res, message, 409, errors);
  }

  static internalError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }

  // Pagination response
  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      data,
      pagination
    };

    return res.status(200).json(response);
  }

  // Validation error response
  static validationError(res, errors, message = 'Validation failed') {
    return this.badRequest(res, message, errors);
  }

  // Duplicate field error response
  static duplicateError(res, field, value, message = null) {
    const errorMessage = message || `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    const errors = [{
      field,
      message: errorMessage,
      value
    }];

    return this.conflict(res, errorMessage, errors);
  }

  // Authentication error response
  static authError(res, message = 'Authentication failed') {
    return this.unauthorized(res, message);
  }

  // Authorization error response
  static permissionError(res, message = 'Insufficient permissions') {
    return this.forbidden(res, message);
  }

  // Resource not found error response
  static resourceNotFound(res, resourceType = 'Resource', id = null) {
    const message = id 
      ? `${resourceType} with ID ${id} not found`
      : `${resourceType} not found`;
    
    return this.notFound(res, message);
  }

  // Database operation error response
  static databaseError(res, message = 'Database operation failed') {
    return this.internalError(res, message);
  }

  // Token error responses
  static tokenExpired(res, message = 'Token has expired') {
    return this.unauthorized(res, message);
  }

  static invalidToken(res, message = 'Invalid token') {
    return this.unauthorized(res, message);
  }

  // Rate limiting error response
  static tooManyRequests(res, message = 'Too many requests') {
    return this.error(res, message, 429);
  }

  // Method not allowed error response
  static methodNotAllowed(res, message = 'Method not allowed') {
    return this.error(res, message, 405);
  }

  // Request timeout error response
  static timeout(res, message = 'Request timeout') {
    return this.error(res, message, 408);
  }

  // File upload error responses
  static fileTooLarge(res, message = 'File size too large') {
    return this.badRequest(res, message);
  }

  static invalidFileType(res, message = 'Invalid file type') {
    return this.badRequest(res, message);
  }

  // Search and filter responses
  static searchResults(res, results, total, filters = null, message = 'Search completed') {
    const data = {
      results,
      total,
      count: results.length
    };

    if (filters) {
      data.filters = filters;
    }

    return this.success(res, data, message);
  }

  // Bulk operation responses
  static bulkOperation(res, results, message = 'Bulk operation completed') {
    const data = {
      totalProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };

    return this.success(res, data, message);
  }

  // Export response
  static exportData(res, data, filename, contentType = 'application/json') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.status(200).send(data);
  }
}

module.exports = ResponseHelper;
