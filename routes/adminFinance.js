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
const { validateAdmin } = require('../middleware/validation');

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
  
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of: INR, USD, EUR, GBP'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('incomeSource')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Income source cannot exceed 200 characters'),
  
  body('expenseType')
    .optional()
    .isIn(['operational', 'marketing', 'infrastructure', 'personnel', 'other'])
    .withMessage('Expense type must be one of: operational, marketing, infrastructure, personnel, other'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other'])
    .withMessage('Payment method must be one of: cash, bank_transfer, card, upi, cheque, other'),
  
  body('paymentReference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Payment reference cannot exceed 100 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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
  
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of: INR, USD, EUR, GBP'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('incomeSource')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Income source cannot exceed 200 characters'),
  
  body('expenseType')
    .optional()
    .isIn(['operational', 'marketing', 'infrastructure', 'personnel', 'other'])
    .withMessage('Expense type must be one of: operational, marketing, infrastructure, personnel, other'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other'])
    .withMessage('Payment method must be one of: cash, bank_transfer, card, upi, cheque, other'),
  
  body('paymentReference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Payment reference cannot exceed 100 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD)'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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
 * @access  Admin only
 */
router.get(
  '/entries',
  authenticateToken,
  validateAdmin,
  getEntriesValidation,
  handleValidationErrors,
  getEntries
);

/**
 * @route   GET /api/admin/finance/entries/:id
 * @desc    Get finance entry by ID
 * @access  Admin only
 */
router.get(
  '/entries/:id',
  authenticateToken,
  validateAdmin,
  getEntryByIdValidation,
  handleValidationErrors,
  getEntryById
);

/**
 * @route   POST /api/admin/finance/entries
 * @desc    Create new finance entry
 * @access  Admin only
 */
router.post(
  '/entries',
  authenticateToken,
  validateAdmin,
  createEntryValidation,
  handleValidationErrors,
  createEntry
);

/**
 * @route   PUT /api/admin/finance/entries/:id
 * @desc    Update finance entry
 * @access  Admin only
 */
router.put(
  '/entries/:id',
  authenticateToken,
  validateAdmin,
  updateEntryValidation,
  handleValidationErrors,
  updateEntry
);

/**
 * @route   POST /api/admin/finance/entries/:id
 * @desc    Update existing finance entry (POST method)
 * @access  Admin only
 */
router.post(
  '/entries/:id',
  authenticateToken,
  validateAdmin,
  updateEntryValidation,
  handleValidationErrors,
  updateEntry
);

/**
 * @route   DELETE /api/admin/finance/entries/:id
 * @desc    Delete finance entry (soft delete)
 * @access  Admin only
 */
router.delete(
  '/entries/:id',
  authenticateToken,
  validateAdmin,
  deleteEntryValidation,
  handleValidationErrors,
  deleteEntry
);

/**
 * @route   GET /api/admin/finance/statistics
 * @desc    Get finance statistics and analytics
 * @access  Admin only
 */
router.get(
  '/statistics',
  authenticateToken,
  validateAdmin,
  getStatisticsValidation,
  handleValidationErrors,
  getStatistics
);

module.exports = router;
