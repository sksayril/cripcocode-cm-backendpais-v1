const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const accountingReportsController = require('../controllers/accountingReportsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
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

// Apply authentication and authorization middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Income & Expense Management Routes
// Add Income
router.post('/income',
  [
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Category is required and must be 1-100 characters'),
    body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be 1-500 characters'),
    body('account').isMongoId().withMessage('Account must be a valid MongoDB ObjectId'),
    body('subcategory').optional().trim().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
    body('reference').optional().trim().isLength({ max: 100 }).withMessage('Reference must be max 100 characters'),
    body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'credit_card', 'check', 'other']).withMessage('Invalid payment method'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
    body('recurringPattern').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid recurring pattern'),
    body('recurringEndDate').optional().isISO8601().withMessage('Recurring end date must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  accountingController.addIncome
);

// Add Expense
router.post('/expense',
  [
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Category is required and must be 1-100 characters'),
    body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be 1-500 characters'),
    body('account').isMongoId().withMessage('Account must be a valid MongoDB ObjectId'),
    body('subcategory').optional().trim().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
    body('reference').optional().trim().isLength({ max: 100 }).withMessage('Reference must be max 100 characters'),
    body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'credit_card', 'check', 'other']).withMessage('Invalid payment method'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
    body('recurringPattern').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid recurring pattern'),
    body('recurringEndDate').optional().isISO8601().withMessage('Recurring end date must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  accountingController.addExpense
);

// Get All Entries with filters
router.get('/entries',
  [
    query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    query('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be max 100 characters'),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Invalid status'),
    query('from').optional().isISO8601().withMessage('From date must be a valid ISO 8601 date'),
    query('to').optional().isISO8601().withMessage('To date must be a valid ISO 8601 date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['date', 'amount', 'category', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    handleValidationErrors
  ],
  accountingController.getAllEntries
);

// Get Entry by ID
router.get('/entries/:id',
  [
    param('id').isMongoId().withMessage('Invalid entry ID format'),
    handleValidationErrors
  ],
  accountingController.getEntryById
);

// Update Entry
router.put('/entries/:id',
  [
    param('id').isMongoId().withMessage('Invalid entry ID format'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('category').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Category must be 1-100 characters'),
    body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
    body('account').optional().isMongoId().withMessage('Account must be a valid MongoDB ObjectId'),
    body('subcategory').optional().trim().isLength({ max: 100 }).withMessage('Subcategory must be max 100 characters'),
    body('reference').optional().trim().isLength({ max: 100 }).withMessage('Reference must be max 100 characters'),
    body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'credit_card', 'check', 'other']).withMessage('Invalid payment method'),
    body('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Invalid status'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    handleValidationErrors
  ],
  accountingController.updateEntry
);

// Delete Entry
router.delete('/entries/:id',
  [
    param('id').isMongoId().withMessage('Invalid entry ID format'),
    handleValidationErrors
  ],
  accountingController.deleteEntry
);

// Approve Entry
router.post('/entries/:id/approve',
  [
    param('id').isMongoId().withMessage('Invalid entry ID format'),
    handleValidationErrors
  ],
  accountingController.approveEntry
);

// Reject Entry
router.post('/entries/:id/reject',
  [
    param('id').isMongoId().withMessage('Invalid entry ID format'),
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Rejection reason is required and must be 1-500 characters'),
    handleValidationErrors
  ],
  accountingController.rejectEntry
);

// Ledger Account Management Routes
// Create Ledger Account
router.post('/ledger',
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be 1-100 characters'),
    body('code').trim().isLength({ min: 1, max: 20 }).withMessage('Code is required and must be 1-20 characters'),
    body('type').isIn(['asset', 'liability', 'equity', 'revenue', 'expense']).withMessage('Type must be asset, liability, equity, revenue, or expense'),
    body('subType').optional().trim().isLength({ max: 50 }).withMessage('SubType must be max 50 characters'),
    body('openingBalance').optional().isNumeric().withMessage('Opening balance must be a number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('parentAccount').optional().isMongoId().withMessage('Parent account must be a valid MongoDB ObjectId'),
    handleValidationErrors
  ],
  accountingController.createLedgerAccount
);

// Get All Ledger Accounts
router.get('/ledger',
  [
    query('type').optional().isIn(['asset', 'liability', 'equity', 'revenue', 'expense']).withMessage('Type must be asset, liability, equity, revenue, or expense'),
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['code', 'name', 'type', 'currentBalance', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    handleValidationErrors
  ],
  accountingController.getAllLedgerAccounts
);

// Get Ledger Account by ID
router.get('/ledger/:id',
  [
    param('id').isMongoId().withMessage('Invalid account ID format'),
    handleValidationErrors
  ],
  accountingController.getLedgerAccountById
);

// Update Ledger Account
router.put('/ledger/:id',
  [
    param('id').isMongoId().withMessage('Invalid account ID format'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('code').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Code must be 1-20 characters'),
    body('type').optional().isIn(['asset', 'liability', 'equity', 'revenue', 'expense']).withMessage('Type must be asset, liability, equity, revenue, or expense'),
    body('subType').optional().trim().isLength({ max: 50 }).withMessage('SubType must be max 50 characters'),
    body('openingBalance').optional().isNumeric().withMessage('Opening balance must be a number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('parentAccount').optional().isMongoId().withMessage('Parent account must be a valid MongoDB ObjectId'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidationErrors
  ],
  accountingController.updateLedgerAccount
);

// Delete Ledger Account
router.delete('/ledger/:id',
  [
    param('id').isMongoId().withMessage('Invalid account ID format'),
    handleValidationErrors
  ],
  accountingController.deleteLedgerAccount
);

// Transaction Management Routes
// Create Transaction
router.post('/transaction',
  [
    body('fromAccount').isMongoId().withMessage('From account must be a valid MongoDB ObjectId'),
    body('toAccount').isMongoId().withMessage('To account must be a valid MongoDB ObjectId'),
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be 1-500 characters'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('reference').optional().trim().isLength({ max: 100 }).withMessage('Reference must be max 100 characters'),
    body('transactionType').optional().isIn(['transfer', 'payment', 'receipt', 'adjustment', 'opening_balance']).withMessage('Invalid transaction type'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('exchangeRate').optional().isNumeric().withMessage('Exchange rate must be a number'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    handleValidationErrors
  ],
  accountingController.createTransaction
);

// Get All Transactions
router.get('/transaction',
  [
    query('fromAccount').optional().isMongoId().withMessage('From account must be a valid MongoDB ObjectId'),
    query('toAccount').optional().isMongoId().withMessage('To account must be a valid MongoDB ObjectId'),
    query('status').optional().isIn(['pending', 'completed', 'cancelled', 'reversed']).withMessage('Invalid status'),
    query('transactionType').optional().isIn(['transfer', 'payment', 'receipt', 'adjustment', 'opening_balance']).withMessage('Invalid transaction type'),
    query('from').optional().isISO8601().withMessage('From date must be a valid ISO 8601 date'),
    query('to').optional().isISO8601().withMessage('To date must be a valid ISO 8601 date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['date', 'amount', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    handleValidationErrors
  ],
  accountingController.getAllTransactions
);

// Get Transaction by ID
router.get('/transaction/:id',
  [
    param('id').isMongoId().withMessage('Invalid transaction ID format'),
    handleValidationErrors
  ],
  accountingController.getTransactionById
);

// Update Transaction
router.put('/transaction/:id',
  [
    param('id').isMongoId().withMessage('Invalid transaction ID format'),
    body('fromAccount').optional().isMongoId().withMessage('From account must be a valid MongoDB ObjectId'),
    body('toAccount').optional().isMongoId().withMessage('To account must be a valid MongoDB ObjectId'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('reference').optional().trim().isLength({ max: 100 }).withMessage('Reference must be max 100 characters'),
    body('transactionType').optional().isIn(['transfer', 'payment', 'receipt', 'adjustment', 'opening_balance']).withMessage('Invalid transaction type'),
    body('status').optional().isIn(['pending', 'completed', 'cancelled', 'reversed']).withMessage('Invalid status'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('exchangeRate').optional().isNumeric().withMessage('Exchange rate must be a number'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    handleValidationErrors
  ],
  accountingController.updateTransaction
);

// Delete Transaction
router.delete('/transaction/:id',
  [
    param('id').isMongoId().withMessage('Invalid transaction ID format'),
    handleValidationErrors
  ],
  accountingController.deleteTransaction
);

// Reverse Transaction
router.post('/transaction/:id/reverse',
  [
    param('id').isMongoId().withMessage('Invalid transaction ID format'),
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Reversal reason is required and must be 1-500 characters'),
    handleValidationErrors
  ],
  accountingController.reverseTransaction
);

// Reports & Analytics Routes
// Profit & Loss Report
router.get('/report/profit-loss',
  [
    query('from').isISO8601().withMessage('From date is required and must be a valid ISO 8601 date'),
    query('to').isISO8601().withMessage('To date is required and must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  accountingReportsController.getProfitLossReport
);

// Balance Sheet Report
router.get('/report/balance-sheet',
  [
    query('asOf').optional().isISO8601().withMessage('As of date must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  accountingReportsController.getBalanceSheetReport
);

// Cash Flow Report
router.get('/report/cash-flow',
  [
    query('from').isISO8601().withMessage('From date is required and must be a valid ISO 8601 date'),
    query('to').isISO8601().withMessage('To date is required and must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  accountingReportsController.getCashFlowReport
);

// Trial Balance Report
router.get('/report/trial-balance',
  [
    query('asOf').optional().isISO8601().withMessage('As of date must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  accountingReportsController.getTrialBalanceReport
);

// Account Statement
router.get('/report/account-statement/:accountId',
  [
    param('accountId').isMongoId().withMessage('Invalid account ID format'),
    query('from').isISO8601().withMessage('From date is required and must be a valid ISO 8601 date'),
    query('to').isISO8601().withMessage('To date is required and must be a valid ISO 8601 date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  accountingReportsController.getAccountStatement
);

// Financial Summary Dashboard
router.get('/report/summary',
  [
    query('period').optional().isInt({ min: 1, max: 365 }).withMessage('Period must be between 1 and 365 days'),
    handleValidationErrors
  ],
  accountingReportsController.getFinancialSummary
);

module.exports = router;
