const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

// Import controllers
const {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getStatistics
} = require('../controllers/financeController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');
const { validateSuperAdmin } = require('../middleware/validation');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const createEntryValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD)')
];

const updateEntryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID'),
  
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"'),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD)')
];

const getEntriesValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'completed'])
    .withMessage('Status must be one of: pending, approved, rejected, completed'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];

const getEntryByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID')
];

const deleteEntryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID')
];

const getStatisticsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either "income" or "expense"')
];

// Routes

/**
 * @route   GET /api/admin/finance/entries
 * @desc    Get all finance entries with filtering and pagination
 * @access  SuperAdmin only
 */
router.get(
  '/entries',
  authenticateToken,
  validateSuperAdmin,
  getEntriesValidation,
  handleValidationErrors,
  getEntries
);

/**
 * @route   GET /api/admin/finance/entries/:id
 * @desc    Get finance entry by ID
 * @access  SuperAdmin only
 */
router.get(
  '/entries/:id',
  authenticateToken,
  validateSuperAdmin,
  getEntryByIdValidation,
  handleValidationErrors,
  getEntryById
);

/**
 * @route   POST /api/admin/finance/entries
 * @desc    Create new finance entry
 * @access  SuperAdmin only
 */
router.post(
  '/entries',
  authenticateToken,
  validateSuperAdmin,
  createEntryValidation,
  handleValidationErrors,
  createEntry
);

/**
 * @route   POST /api/admin/finance/entries/:id
 * @desc    Update existing finance entry (POST method)
 * @access  SuperAdmin only
 */
router.post(
  '/entries/:id',
  authenticateToken,
  validateSuperAdmin,
  updateEntryValidation,
  handleValidationErrors,
  updateEntry
);

/**
 * @route   PUT /api/admin/finance/entries/:id
 * @desc    Update finance entry
 * @access  SuperAdmin only
 */
router.put(
  '/entries/:id',
  authenticateToken,
  validateSuperAdmin,
  updateEntryValidation,
  handleValidationErrors,
  updateEntry
);

/**
 * @route   DELETE /api/admin/finance/entries/:id
 * @desc    Delete finance entry (soft delete)
 * @access  SuperAdmin only
 */
router.delete(
  '/entries/:id',
  authenticateToken,
  validateSuperAdmin,
  deleteEntryValidation,
  handleValidationErrors,
  deleteEntry
);

/**
 * @route   GET /api/admin/finance/statistics
 * @desc    Get finance statistics and analytics
 * @access  SuperAdmin only
 */
router.get(
  '/statistics',
  authenticateToken,
  validateSuperAdmin,
  getStatisticsValidation,
  handleValidationErrors,
  getStatistics
);

module.exports = router;
