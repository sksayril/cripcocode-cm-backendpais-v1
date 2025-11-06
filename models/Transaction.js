const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true,
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  reference: {
    type: String,
    trim: true,
    maxlength: 100
  },
  transactionType: {
    type: String,
    enum: ['transfer', 'payment', 'receipt', 'adjustment', 'opening_balance'],
    default: 'transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'reversed'],
    default: 'completed'
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 3
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reversedAt: {
    type: Date
  },
  reversalReason: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
transactionSchema.index({ company: 1, date: -1 });
transactionSchema.index({ company: 1, status: 1, date: -1 });
transactionSchema.index({ fromAccount: 1, date: -1 });
transactionSchema.index({ toAccount: 1, date: -1 });
transactionSchema.index({ createdBy: 1, date: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD'
  }).format(this.amount);
});

// Virtual for status display
transactionSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    reversed: 'Reversed'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for transaction type display
transactionSchema.virtual('transactionTypeDisplay').get(function() {
  const typeMap = {
    transfer: 'Transfer',
    payment: 'Payment',
    receipt: 'Receipt',
    adjustment: 'Adjustment',
    opening_balance: 'Opening Balance'
  };
  return typeMap[this.transactionType] || this.transactionType;
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Set updatedBy if not already set
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Set approvedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed') {
    this.approvedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update account balances
transactionSchema.post('save', async function() {
  if (this.status === 'completed' && !this.isDeleted) {
    const Ledger = mongoose.model('Ledger');
    
    try {
      // Update from account (debit)
      await Ledger.updateBalance(this.fromAccount, this.amount, 'subtract');
      
      // Update to account (credit)
      await Ledger.updateBalance(this.toAccount, this.amount, 'add');
    } catch (error) {
      console.error('Error updating account balances:', error);
    }
  }
});

// Static methods
transactionSchema.statics.getByDateRange = async function(companyId, startDate, endDate, page = 1, limit = 10) {
  const query = {
    company: companyId,
    isDeleted: false,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1 },
    populate: [
      { path: 'fromAccount', select: 'name code type' },
      { path: 'toAccount', select: 'name code type' },
      { path: 'createdBy', select: 'username fullname' },
      { path: 'approvedBy', select: 'username fullname' }
    ]
  };
  
  return await this.paginate(query, options);
};

transactionSchema.statics.getByAccount = async function(companyId, accountId, page = 1, limit = 10) {
  const query = {
    company: companyId,
    isDeleted: false,
    $or: [
      { fromAccount: accountId },
      { toAccount: accountId }
    ]
  };
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { date: -1 },
    populate: [
      { path: 'fromAccount', select: 'name code type' },
      { path: 'toAccount', select: 'name code type' },
      { path: 'createdBy', select: 'username fullname' }
    ]
  };
  
  return await this.paginate(query, options);
};

transactionSchema.statics.getTransactionSummary = async function(companyId, startDate, endDate) {
  const query = {
    company: companyId,
    isDeleted: false,
    status: 'completed',
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : {
    totalTransactions: 0,
    totalAmount: 0,
    averageAmount: 0
  };
};

// Instance methods
transactionSchema.methods.complete = function(adminId) {
  this.status = 'completed';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

transactionSchema.methods.cancel = function(adminId, reason) {
  this.status = 'cancelled';
  this.updatedBy = adminId;
  return this.save();
};

transactionSchema.methods.reverse = function(adminId, reason) {
  this.status = 'reversed';
  this.reversedBy = adminId;
  this.reversedAt = new Date();
  this.reversalReason = reason;
  return this.save();
};

transactionSchema.methods.softDelete = function(adminId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = adminId;
  return this.save();
};

// Add pagination plugin
transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);