const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Razorpay order details
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Payment amounts
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  
  // Gateway charges calculation
  gatewayCharges: {
    type: Number,
    required: true,
    min: 0
  },
  
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Transaction status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'captured', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Razorpay response data
  razorpayOrderId: {
    type: String,
    required: true
  },
  
  razorpayPaymentId: {
    type: String,
    required: true
  },
  
  razorpaySignature: {
    type: String,
    required: true
  },
  
  // Additional payment details
  method: {
    type: String,
    default: 'card'
  },
  
  bank: {
    type: String,
    default: null
  },
  
  wallet: {
    type: String,
    default: null
  },
  
  vpa: {
    type: String,
    default: null
  },
  
  // Refund information
  refunds: [{
    refundId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['processed', 'pending', 'failed'],
      default: 'pending'
    },
    notes: String,
    refundedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Customer information
  customer: {
    name: String,
    email: String,
    contact: String
  },
  
  // Order description
  description: {
    type: String,
    default: 'CRM Payment'
  },
  
  // Notes
  notes: {
    type: String,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Payment captured timestamp
  capturedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total refunded amount
transactionSchema.virtual('totalRefunded').get(function() {
  return this.refunds.reduce((total, refund) => {
    return total + (refund.status === 'processed' ? refund.amount : 0);
  }, 0);
});

// Virtual for refundable amount
transactionSchema.virtual('refundableAmount').get(function() {
  return this.netAmount - this.totalRefunded;
});

// Indexes for better performance
// Note: orderId and paymentId indexes are automatically created by unique: true
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ amount: 1 });

// Pre-save middleware to update updatedAt
transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get transaction statistics
transactionSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
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
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalTransactions: 0,
    totalAmount: 0,
    totalGatewayCharges: 0,
    totalNetAmount: 0,
    totalRefunded: 0,
    capturedTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0
  };
};

// Static method to get transactions by date range
transactionSchema.statics.getTransactionsByDateRange = function(startDate, endDate, page = 1, limit = 10) {
  const query = {};
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
