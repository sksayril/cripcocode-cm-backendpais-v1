const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const incomeExpenseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  reference: {
    type: String,
    trim: true,
    maxlength: 100
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
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
  rejectionReason: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  recurringEndDate: {
    type: Date
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
incomeExpenseSchema.index({ company: 1, type: 1, date: -1 });
incomeExpenseSchema.index({ company: 1, category: 1, date: -1 });
incomeExpenseSchema.index({ company: 1, status: 1, date: -1 });
incomeExpenseSchema.index({ createdBy: 1, date: -1 });

// Virtual for formatted amount
incomeExpenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Virtual for status display
incomeExpenseSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for type display
incomeExpenseSchema.virtual('typeDisplay').get(function() {
  return this.type === 'income' ? 'Income' : 'Expense';
});

// Pre-save middleware
incomeExpenseSchema.pre('save', function(next) {
  // Set updatedBy if not already set
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Set approvedAt when status changes to approved
  if (this.isModified('status') && this.status === 'approved') {
    this.approvedAt = new Date();
  }
  
  next();
});

// Static methods
incomeExpenseSchema.statics.getTotalByType = async function(companyId, type, startDate, endDate) {
  const query = {
    company: companyId,
    type: type,
    isDeleted: false
  };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

incomeExpenseSchema.statics.getEntriesByDateRange = async function(companyId, startDate, endDate, page = 1, limit = 10) {
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
      { path: 'account', select: 'name type' },
      { path: 'createdBy', select: 'username fullname' },
      { path: 'approvedBy', select: 'username fullname' }
    ]
  };
  
  return await this.paginate(query, options);
};

incomeExpenseSchema.statics.getCategoryStats = async function(companyId, type, startDate, endDate) {
  const query = {
    company: companyId,
    type: type,
    isDeleted: false
  };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

// Instance methods
incomeExpenseSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

incomeExpenseSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.rejectionReason = reason;
  return this.save();
};

incomeExpenseSchema.methods.softDelete = function(adminId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = adminId;
  return this.save();
};

// Add pagination plugin
incomeExpenseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('IncomeExpense', incomeExpenseSchema);
