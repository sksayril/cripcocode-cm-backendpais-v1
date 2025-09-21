const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../env');
const Transaction = require('../models/Transaction');

class PaymentService {
  constructor() {
    // Validate Razorpay credentials
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️  Razorpay credentials not found. Payment functionality will be limited.');
      this.razorpay = null;
      return;
    }

    // Initialize Razorpay instance
    try {
      this.razorpay = new Razorpay({
        key_id: config.RAZORPAY_KEY_ID,
        key_secret: config.RAZORPAY_KEY_SECRET
      });
      console.log('✅ Razorpay initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Razorpay:', error.message);
      this.razorpay = null;
    }
  }

  /**
   * Calculate gateway charges based on amount
   * @param {number} amount - Payment amount in paise
   * @returns {object} - Calculated charges breakdown
   */
  calculateGatewayCharges(amount) {
    // Convert paise to rupees for calculation
    const amountInRupees = amount / 100;
    
    // 2% transaction fee
    const transactionFee = amountInRupees * 0.02;
    
    // 18% GST on transaction fee
    const gstOnFee = transactionFee * 0.18;
    
    // Total gateway charges
    const totalGatewayCharges = transactionFee + gstOnFee;
    
    // Net amount after charges
    const netAmount = amountInRupees - totalGatewayCharges;
    
    return {
      transactionFee: Math.round(transactionFee * 100) / 100,
      gstOnFee: Math.round(gstOnFee * 100) / 100,
      totalGatewayCharges: Math.round(totalGatewayCharges * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      amountInRupees: Math.round(amountInRupees * 100) / 100
    };
  }

  /**
   * Create Razorpay order
   * @param {object} orderData - Order creation data
   * @returns {Promise<object>} - Razorpay order response
   */
  async createOrder(orderData) {
    try {
      // Check if Razorpay is initialized
      if (!this.razorpay) {
        throw new Error('Razorpay is not initialized. Please check your environment variables.');
      }

      const {
        amount,
        currency = 'INR',
        receipt,
        notes = {},
        customer = {}
      } = orderData;

      // Validate amount
      if (!amount || amount < 100) { // Minimum ₹1
        throw new Error('Amount must be at least ₹1 (100 paise)');
      }

      // Calculate charges
      const charges = this.calculateGatewayCharges(amount);

      const orderOptions = {
        amount: amount, // Amount in paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          gatewayCharges: charges.totalGatewayCharges,
          netAmount: charges.netAmount
        },
        payment_capture: 1 // Auto-capture payment
      };

      // Add customer details if provided
      if (customer.name || customer.email || customer.contact) {
        orderOptions.notes = {
          ...orderOptions.notes,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_contact: customer.contact
        };
      }

      const order = await this.razorpay.orders.create(orderOptions);

      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at,
          notes: order.notes
        },
        charges: charges
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   * @param {string} razorpayOrderId - Razorpay order ID
   * @param {string} razorpayPaymentId - Razorpay payment ID
   * @param {string} razorpaySignature - Razorpay signature
   * @returns {boolean} - Signature verification result
   */
  verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpaySignature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Verify payment and save transaction
   * @param {object} paymentData - Payment verification data
   * @returns {Promise<object>} - Transaction result
   */
  async verifyPayment(paymentData) {
    try {
      const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount,
        currency = 'INR',
        method = 'card',
        bank = null,
        wallet = null,
        vpa = null,
        customer = {},
        description = 'CRM Payment',
        notes = null
      } = paymentData;

      // Verify payment signature
      const isSignatureValid = this.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isSignatureValid) {
        throw new Error('Invalid payment signature');
      }

      // Calculate charges
      const charges = this.calculateGatewayCharges(amount);

      // Check if transaction already exists
      const existingTransaction = await Transaction.findOne({
        $or: [
          { orderId: razorpayOrderId },
          { paymentId: razorpayPaymentId }
        ]
      });

      if (existingTransaction) {
        throw new Error('Transaction already exists');
      }

      // Create transaction record
      const transaction = new Transaction({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        amount: amount / 100, // Convert paise to rupees
        currency: currency,
        gatewayCharges: charges.totalGatewayCharges,
        netAmount: charges.netAmount,
        status: 'captured',
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
        method: method,
        bank: bank,
        wallet: wallet,
        vpa: vpa,
        customer: customer,
        description: description,
        notes: notes,
        capturedAt: new Date()
      });

      await transaction.save();

      return {
        success: true,
        transaction: {
          id: transaction._id,
          orderId: transaction.orderId,
          paymentId: transaction.paymentId,
          amount: transaction.amount,
          currency: transaction.currency,
          gatewayCharges: transaction.gatewayCharges,
          netAmount: transaction.netAmount,
          status: transaction.status,
          method: transaction.method,
          bank: transaction.bank,
          wallet: transaction.wallet,
          vpa: transaction.vpa,
          customer: transaction.customer,
          description: transaction.description,
          notes: transaction.notes,
          createdAt: transaction.createdAt,
          capturedAt: transaction.capturedAt
        },
        charges: charges
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Get all transactions with pagination and filtering
   * @param {object} options - Query options
   * @returns {Promise<object>} - Transactions with pagination
   */
  async getTransactions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        startDate = null,
        endDate = null,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const transactions = await Transaction.find(query)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v -razorpaySignature');

      // Get total count
      const totalTransactions = await Transaction.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(totalTransactions / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        success: true,
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNextPage,
          hasPrevPage,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get transaction statistics
   * @param {object} options - Filter options
   * @returns {Promise<object>} - Transaction statistics
   */
  async getTransactionStatistics(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;

      // Build aggregation pipeline
      const pipeline = [];

      // Add date filter if provided
      if (startDate && endDate) {
        pipeline.push({
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        });
      }

      // Add grouping stage
      pipeline.push({
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalGatewayCharges: { $sum: '$gatewayCharges' },
          totalNetAmount: { $sum: '$netAmount' },
          totalRefunded: { $sum: '$totalRefunded' },
          capturedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'captured'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          refundedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
          }
        }
      });

      const result = await Transaction.aggregate(pipeline);
      const stats = result[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        totalGatewayCharges: 0,
        totalNetAmount: 0,
        totalRefunded: 0,
        capturedTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        refundedTransactions: 0
      };

      // Calculate additional metrics
      const successRate = stats.totalTransactions > 0 
        ? ((stats.capturedTransactions / stats.totalTransactions) * 100).toFixed(2)
        : 0;

      const averageTransactionValue = stats.capturedTransactions > 0
        ? (stats.totalAmount / stats.capturedTransactions).toFixed(2)
        : 0;

      return {
        success: true,
        statistics: {
          ...stats,
          successRate: parseFloat(successRate),
          averageTransactionValue: parseFloat(averageTransactionValue),
          netSettled: stats.totalNetAmount - stats.totalRefunded
        }
      };
    } catch (error) {
      console.error('Error fetching transaction statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<object>} - Transaction details
   */
  async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId)
        .select('-__v -razorpaySignature');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  /**
   * Create refund for a transaction
   * @param {string} transactionId - Transaction ID
   * @param {object} refundData - Refund data
   * @returns {Promise<object>} - Refund result
   */
  async createRefund(transactionId, refundData) {
    try {
      // Check if Razorpay is initialized
      if (!this.razorpay) {
        throw new Error('Razorpay is not initialized. Please check your environment variables.');
      }

      const { amount, notes = null } = refundData;

      // Get transaction
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Check if refund amount is valid
      if (amount > transaction.refundableAmount) {
        throw new Error('Refund amount exceeds refundable amount');
      }

      // Create Razorpay refund
      const refund = await this.razorpay.payments.refund(transaction.razorpayPaymentId, {
        amount: amount * 100, // Convert to paise
        notes: {
          reason: notes || 'Customer requested refund'
        }
      });

      // Update transaction with refund details
      transaction.refunds.push({
        refundId: refund.id,
        amount: amount,
        status: 'processed',
        notes: notes,
        refundedAt: new Date()
      });

      // Update transaction status
      if (amount === transaction.netAmount) {
        transaction.status = 'refunded';
      } else {
        transaction.status = 'partially_refunded';
      }

      await transaction.save();

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: amount,
          status: 'processed',
          notes: notes,
          refundedAt: new Date()
        },
        transaction: {
          id: transaction._id,
          status: transaction.status,
          totalRefunded: transaction.totalRefunded,
          refundableAmount: transaction.refundableAmount
        }
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
