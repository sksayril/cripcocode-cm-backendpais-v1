const { body, param, query, validationResult } = require('express-validator');
const Ledger = require('../models/Ledger');
const IncomeExpense = require('../models/IncomeExpense');
const Transaction = require('../models/Transaction');

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

// Income/Expense validation rules
const incomeExpenseValidation = {
  create: [
    body('date')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date > now) {
          throw new Error('Date cannot be in the future');
        }
        return true;
      }),
    
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    
    body('category')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category is required and must be 1-100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description is required and must be 1-500 characters'),
    
    body('account')
      .isMongoId()
      .withMessage('Account must be a valid MongoDB ObjectId')
      .custom(async (value, { req }) => {
        const account = await Ledger.findOne({
          _id: value,
          company: req.user.company,
          isActive: true,
          isDeleted: false
        });
        if (!account) {
          throw new Error('Account not found or not accessible');
        }
        return true;
      }),
    
    body('subcategory')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Subcategory must be max 100 characters'),
    
    body('reference')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Reference must be max 100 characters'),
    
    body('paymentMethod')
      .optional()
      .isIn(['cash', 'bank_transfer', 'credit_card', 'check', 'other'])
      .withMessage('Invalid payment method'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((value) => {
        if (value && value.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        return true;
      }),
    
    body('isRecurring')
      .optional()
      .isBoolean()
      .withMessage('isRecurring must be a boolean'),
    
    body('recurringPattern')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
      .withMessage('Invalid recurring pattern'),
    
    body('recurringEndDate')
      .optional()
      .isISO8601()
      .withMessage('Recurring end date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (value && req.body.date) {
          const endDate = new Date(value);
          const startDate = new Date(req.body.date);
          if (endDate <= startDate) {
            throw new Error('Recurring end date must be after start date');
          }
        }
        return true;
      }),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid entry ID format'),
    
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    
    body('amount')
      .optional()
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    
    body('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category must be 1-100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be 1-500 characters'),
    
    body('account')
      .optional()
      .isMongoId()
      .withMessage('Account must be a valid MongoDB ObjectId')
      .custom(async (value, { req }) => {
        const account = await Ledger.findOne({
          _id: value,
          company: req.user.company,
          isActive: true,
          isDeleted: false
        });
        if (!account) {
          throw new Error('Account not found or not accessible');
        }
        return true;
      }),
    
    body('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
    
    handleValidationErrors
  ]
};

// Ledger validation rules
const ledgerValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required and must be 1-100 characters'),
    
    body('code')
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Code is required and must be 1-20 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Code must contain only uppercase letters, numbers, hyphens, and underscores')
      .custom(async (value, { req }) => {
        const existingCode = await Ledger.findOne({
          code: value,
          company: req.user.company,
          isDeleted: false
        });
        if (existingCode) {
          throw new Error('Account code already exists');
        }
        return true;
      }),
    
    body('type')
      .isIn(['asset', 'liability', 'equity', 'revenue', 'expense'])
      .withMessage('Type must be asset, liability, equity, revenue, or expense'),
    
    body('subType')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('SubType must be max 50 characters'),
    
    body('openingBalance')
      .optional()
      .isNumeric()
      .withMessage('Opening balance must be a number'),
    
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters')
      .isUppercase()
      .withMessage('Currency must be uppercase'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    
    body('parentAccount')
      .optional()
      .isMongoId()
      .withMessage('Parent account must be a valid MongoDB ObjectId')
      .custom(async (value, { req }) => {
        if (value) {
          const parentAccount = await Ledger.findOne({
            _id: value,
            company: req.user.company,
            isActive: true,
            isDeleted: false
          });
          if (!parentAccount) {
            throw new Error('Parent account not found');
          }
        }
        return true;
      }),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid account ID format'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be 1-100 characters'),
    
    body('code')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Code must be 1-20 characters')
      .matches(/^[A-Z0-9_-]+$/)
      .withMessage('Code must contain only uppercase letters, numbers, hyphens, and underscores')
      .custom(async (value, { req }) => {
        if (value) {
          const existingCode = await Ledger.findOne({
            code: value,
            company: req.user.company,
            isDeleted: false,
            _id: { $ne: req.params.id }
          });
          if (existingCode) {
            throw new Error('Account code already exists');
          }
        }
        return true;
      }),
    
    body('type')
      .optional()
      .isIn(['asset', 'liability', 'equity', 'revenue', 'expense'])
      .withMessage('Type must be asset, liability, equity, revenue, or expense'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    
    handleValidationErrors
  ]
};

// Transaction validation rules
const transactionValidation = {
  create: [
    body('fromAccount')
      .isMongoId()
      .withMessage('From account must be a valid MongoDB ObjectId')
      .custom(async (value, { req }) => {
        const account = await Ledger.findOne({
          _id: value,
          company: req.user.company,
          isActive: true,
          isDeleted: false
        });
        if (!account) {
          throw new Error('From account not found or not accessible');
        }
        return true;
      }),
    
    body('toAccount')
      .isMongoId()
      .withMessage('To account must be a valid MongoDB ObjectId')
      .custom(async (value, { req }) => {
        const account = await Ledger.findOne({
          _id: value,
          company: req.user.company,
          isActive: true,
          isDeleted: false
        });
        if (!account) {
          throw new Error('To account not found or not accessible');
        }
        return true;
      })
      .custom((value, { req }) => {
        if (value === req.body.fromAccount) {
          throw new Error('From account and to account cannot be the same');
        }
        return true;
      }),
    
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description is required and must be 1-500 characters'),
    
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    
    body('transactionType')
      .optional()
      .isIn(['transfer', 'payment', 'receipt', 'adjustment', 'opening_balance'])
      .withMessage('Invalid transaction type'),
    
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters')
      .isUppercase()
      .withMessage('Currency must be uppercase'),
    
    body('exchangeRate')
      .optional()
      .isNumeric()
      .withMessage('Exchange rate must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Exchange rate must be greater than 0'),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid transaction ID format'),
    
    body('fromAccount')
      .optional()
      .isMongoId()
      .withMessage('From account must be a valid MongoDB ObjectId'),
    
    body('toAccount')
      .optional()
      .isMongoId()
      .withMessage('To account must be a valid MongoDB ObjectId'),
    
    body('amount')
      .optional()
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    
    body('status')
      .optional()
      .isIn(['pending', 'completed', 'cancelled', 'reversed'])
      .withMessage('Invalid status'),
    
    handleValidationErrors
  ]
};

// Report validation rules
const reportValidation = {
  profitLoss: [
    query('from')
      .isISO8601()
      .withMessage('From date is required and must be a valid ISO 8601 date'),
    
    query('to')
      .isISO8601()
      .withMessage('To date is required and must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (value && req.query.from) {
          const toDate = new Date(value);
          const fromDate = new Date(req.query.from);
          if (toDate <= fromDate) {
            throw new Error('To date must be after from date');
          }
        }
        return true;
      }),
    
    handleValidationErrors
  ],

  balanceSheet: [
    query('asOf')
      .optional()
      .isISO8601()
      .withMessage('As of date must be a valid ISO 8601 date'),
    
    handleValidationErrors
  ],

  cashFlow: [
    query('from')
      .isISO8601()
      .withMessage('From date is required and must be a valid ISO 8601 date'),
    
    query('to')
      .isISO8601()
      .withMessage('To date is required and must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (value && req.query.from) {
          const toDate = new Date(value);
          const fromDate = new Date(req.query.from);
          if (toDate <= fromDate) {
            throw new Error('To date must be after from date');
          }
        }
        return true;
      }),
    
    handleValidationErrors
  ],

  accountStatement: [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID format'),
    
    query('from')
      .isISO8601()
      .withMessage('From date is required and must be a valid ISO 8601 date'),
    
    query('to')
      .isISO8601()
      .withMessage('To date is required and must be a valid ISO 8601 date'),
    
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
  ],

  dateRange: [
    query('from')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid ISO 8601 date'),
    
    query('to')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid ISO 8601 date'),
    
    handleValidationErrors
  ]
};

module.exports = {
  incomeExpenseValidation,
  ledgerValidation,
  transactionValidation,
  reportValidation,
  commonValidation,
  handleValidationErrors
};
