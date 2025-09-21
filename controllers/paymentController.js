const asyncHandler = require('../utils/asyncHandler');
const ResponseHelper = require('../utils/responseHelper');
const PaymentService = require('../services/paymentService');

/**
 * Create Razorpay order
 * POST /api/payment/create-order
 */
const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency, receipt, notes, customer } = req.body;

  // Validate required fields
  if (!amount) {
    return ResponseHelper.error(res, 'Amount is required', 400);
  }

  // Validate amount (minimum ₹1)
  if (amount < 100) {
    return ResponseHelper.error(res, 'Amount must be at least ₹1 (100 paise)', 400);
  }

  try {
    const result = await PaymentService.createOrder({
      amount,
      currency,
      receipt,
      notes,
      customer
    });

    ResponseHelper.success(res, result, 'Order created successfully');
  } catch (error) {
    console.error('Create order error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Verify payment and save transaction
 * POST /api/payment/verify
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount,
    currency,
    method,
    bank,
    wallet,
    vpa,
    customer,
    description,
    notes
  } = req.body;

  // Validate required fields
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !amount) {
    return ResponseHelper.error(res, 'Missing required payment verification fields', 400);
  }

  try {
    const result = await PaymentService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      currency,
      method,
      bank,
      wallet,
      vpa,
      customer,
      description,
      notes
    });

    ResponseHelper.success(res, result, 'Payment verified and transaction saved successfully');
  } catch (error) {
    console.error('Payment verification error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Get all transactions with pagination and filtering
 * GET /api/payment/transactions
 */
const getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const result = await PaymentService.getTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    ResponseHelper.success(res, result, 'Transactions retrieved successfully');
  } catch (error) {
    console.error('Get transactions error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Get transaction statistics
 * GET /api/payment/statistics
 */
const getTransactionStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await PaymentService.getTransactionStatistics({
      startDate,
      endDate
    });

    ResponseHelper.success(res, result, 'Transaction statistics retrieved successfully');
  } catch (error) {
    console.error('Get statistics error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Get transaction by ID
 * GET /api/payment/transactions/:id
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return ResponseHelper.error(res, 'Transaction ID is required', 400);
  }

  try {
    const result = await PaymentService.getTransactionById(id);
    ResponseHelper.success(res, result, 'Transaction retrieved successfully');
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    ResponseHelper.error(res, error.message, 404);
  }
});

/**
 * Create refund for a transaction
 * POST /api/payment/transactions/:id/refund
 */
const createRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;

  if (!id) {
    return ResponseHelper.error(res, 'Transaction ID is required', 400);
  }

  if (!amount) {
    return ResponseHelper.error(res, 'Refund amount is required', 400);
  }

  if (amount <= 0) {
    return ResponseHelper.error(res, 'Refund amount must be greater than 0', 400);
  }

  try {
    const result = await PaymentService.createRefund(id, { amount, notes });
    ResponseHelper.success(res, result, 'Refund created successfully');
  } catch (error) {
    console.error('Create refund error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Calculate gateway charges for an amount
 * POST /api/payment/calculate-charges
 */
const calculateCharges = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return ResponseHelper.error(res, 'Amount is required', 400);
  }

  if (amount < 100) {
    return ResponseHelper.error(res, 'Amount must be at least ₹1 (100 paise)', 400);
  }

  try {
    const charges = PaymentService.calculateGatewayCharges(amount);
    ResponseHelper.success(res, { charges }, 'Charges calculated successfully');
  } catch (error) {
    console.error('Calculate charges error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Get payment dashboard data
 * GET /api/payment/dashboard
 */
const getPaymentDashboard = asyncHandler(async (req, res) => {
  try {
    // Get recent transactions (last 10)
    const recentTransactions = await PaymentService.getTransactions({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Get statistics
    const statistics = await PaymentService.getTransactionStatistics();

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await PaymentService.getTransactionStatistics({
      startDate: today,
      endDate: tomorrow
    });

    // Get this month's transactions
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthStats = await PaymentService.getTransactionStatistics({
      startDate: monthStart,
      endDate: monthEnd
    });

    const dashboard = {
      recentTransactions: recentTransactions.transactions,
      overallStatistics: statistics.statistics,
      todayStatistics: todayStats.statistics,
      monthStatistics: monthStats.statistics,
      summary: {
        totalRevenue: statistics.statistics.totalAmount,
        totalGatewayCharges: statistics.statistics.totalGatewayCharges,
        netSettled: statistics.statistics.netSettled,
        successRate: statistics.statistics.successRate,
        averageTransactionValue: statistics.statistics.averageTransactionValue
      }
    };

    ResponseHelper.success(res, dashboard, 'Payment dashboard data retrieved successfully');
  } catch (error) {
    console.error('Get dashboard error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

/**
 * Export transactions to CSV
 * GET /api/payment/export
 */
const exportTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;

  try {
    const result = await PaymentService.getTransactions({
      page: 1,
      limit: 10000, // Large limit for export
      status,
      startDate,
      endDate,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Convert to CSV format
    const transactions = result.transactions;
    
    if (transactions.length === 0) {
      return ResponseHelper.error(res, 'No transactions found for export', 404);
    }

    // CSV headers
    const headers = [
      'Order ID',
      'Payment ID',
      'Amount (₹)',
      'Currency',
      'Gateway Charges (₹)',
      'Net Amount (₹)',
      'Status',
      'Method',
      'Bank',
      'Customer Name',
      'Customer Email',
      'Customer Contact',
      'Description',
      'Created At',
      'Captured At'
    ];

    // Convert transactions to CSV rows
    const csvRows = transactions.map(transaction => [
      transaction.orderId,
      transaction.paymentId,
      transaction.amount,
      transaction.currency,
      transaction.gatewayCharges,
      transaction.netAmount,
      transaction.status,
      transaction.method || '',
      transaction.bank || '',
      transaction.customer?.name || '',
      transaction.customer?.email || '',
      transaction.customer?.contact || '',
      transaction.description || '',
      transaction.createdAt.toISOString(),
      transaction.capturedAt ? transaction.capturedAt.toISOString() : ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Export transactions error:', error);
    ResponseHelper.error(res, error.message, 400);
  }
});

module.exports = {
  createOrder,
  verifyPayment,
  getTransactions,
  getTransactionStatistics,
  getTransactionById,
  createRefund,
  calculateCharges,
  getPaymentDashboard,
  exportTransactions
};
