const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Admin validation rules
const adminValidation = {
  create: [
    body('fullname')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Fullname must be between 2 and 100 characters'),
    
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 characters, alphanumeric and underscore only'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('role')
      .isIn(['superAdmin', 'manager', 'sales'])
      .withMessage('Role must be superAdmin, manager, or sales'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    
    body('phone')
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Phone number must contain only digits, spaces, hyphens, and parentheses'),
    
    body('department')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Department must be between 2 and 100 characters'),
    
    body('adminArea')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Admin area must be between 2 and 100 characters'),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid admin ID format'),
    
    body('fullname')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Fullname must be between 2 and 100 characters'),
    
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 characters, alphanumeric and underscore only'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('role')
      .optional()
      .isIn(['superAdmin', 'manager', 'sales'])
      .withMessage('Role must be superAdmin, manager, or sales'),
    
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Phone number must contain only digits, spaces, hyphens, and parentheses'),
    
    body('department')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Department must be between 2 and 100 characters'),
    
    body('adminArea')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Admin area must be between 2 and 100 characters'),
    
    handleValidationErrors
  ],

  updatePassword: [
    param('id')
      .isMongoId()
      .withMessage('Invalid admin ID format'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
    
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid admin ID format'),
    
    handleValidationErrors
  ],

  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('role')
      .optional()
      .isIn(['superAdmin', 'manager', 'sales'])
      .withMessage('Invalid role filter'),
    
    query('isActive')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isActive must be true or false'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),
    
    handleValidationErrors
  ],

  delete: [
    param('id')
      .isMongoId()
      .withMessage('Invalid admin ID format'),
    
    handleValidationErrors
  ]
};

// Auth validation rules
const authValidation = {
  signup: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 characters, alphanumeric and underscore only'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('phone')
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Phone number must contain only digits, spaces, hyphens, and parentheses'),
    
    body('role')
      .isIn(['superAdmin', 'admin'])
      .withMessage('Role must be superAdmin or admin'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    handleValidationErrors
  ],

  logout: [
    body('token')
      .optional()
      .notEmpty()
      .withMessage('Token cannot be empty if provided'),
    
    handleValidationErrors
  ]
};

// Common validation rules
const commonValidation = {
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format'),
    
    handleValidationErrors
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
  ]
};

// SuperAdmin validation middleware
const validateSuperAdmin = (req, res, next) => {
  // Check if user is authenticated and has SuperAdmin role
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }

  if (req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. SuperAdmin role required'
    });
  }

  next();
};

// Admin validation middleware
const validateAdmin = (req, res, next) => {
  // Check if user is authenticated and has Admin role
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && req.user.role !== 'companyAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or CompanyAdmin role required'
    });
  }

  next();
};

module.exports = {
  adminValidation,
  authValidation,
  commonValidation,
  handleValidationErrors,
  validateSuperAdmin,
  validateAdmin
};
