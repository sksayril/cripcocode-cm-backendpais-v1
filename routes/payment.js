const express = require('express');
const {
  createOrder,
  verifyPayment,
  getTransactions,
  getTransactionStatistics,
  getTransactionById,
  createRefund,
  calculateCharges,
  getPaymentDashboard,
  exportTransactions
} = require('../controllers/paymentController');

// Import authentication middleware
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// SuperAdmin role check middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. SuperAdmin role required.'
    });
  }
  next();
};

// Apply SuperAdmin role check to all payment routes
router.use(requireSuperAdmin);

// Payment Routes

/**
 * @route   POST /api/payment/create-order
 * @desc    Create Razorpay order
 * @access  SuperAdmin
 */
router.post('/create-order', createOrder);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify payment and save transaction
 * @access  SuperAdmin
 */
router.post('/verify', verifyPayment);

/**
 * @route   GET /api/payment/transactions
 * @desc    Get all transactions with pagination and filtering
 * @access  SuperAdmin
 */
router.get('/transactions', getTransactions);

/**
 * @route   GET /api/payment/statistics
 * @desc    Get transaction statistics
 * @access  SuperAdmin
 */
router.get('/statistics', getTransactionStatistics);

/**
 * @route   GET /api/payment/dashboard
 * @desc    Get payment dashboard data
 * @access  SuperAdmin
 */
router.get('/dashboard', getPaymentDashboard);

/**
 * @route   GET /api/payment/export
 * @desc    Export transactions to CSV
 * @access  SuperAdmin
 */
router.get('/export', exportTransactions);

/**
 * @route   POST /api/payment/calculate-charges
 * @desc    Calculate gateway charges for an amount
 * @access  SuperAdmin
 */
router.post('/calculate-charges', calculateCharges);

/**
 * @route   GET /api/payment/transactions/:id
 * @desc    Get transaction by ID
 * @access  SuperAdmin
 */
router.get('/transactions/:id', getTransactionById);

/**
 * @route   POST /api/payment/transactions/:id/refund
 * @desc    Create refund for a transaction
 * @access  SuperAdmin
 */
router.post('/transactions/:id/refund', createRefund);

module.exports = router;
