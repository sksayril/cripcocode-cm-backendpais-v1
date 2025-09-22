const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const financeEntrySchema = new mongoose.Schema({
  // Entry Type
  type: {
    type: String,
    required: [true, 'Entry type is required'],
    enum: ['income', 'expense'],
    index: true
  },

  // Financial Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },

  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },

  // Description and Details
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },

  // Income specific fields
  incomeSource: {
    type: String,
    trim: true,
    maxlength: [200, 'Income source cannot exceed 200 characters']
  },

  // Expense specific fields
  expenseType: {
    type: String,
    enum: ['operational', 'marketing', 'infrastructure', 'personnel', 'other'],
    default: 'operational'
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other'],
    default: 'bank_transfer'
  },

  paymentReference: {
    type: String,
    trim: true,
    maxlength: [100, 'Payment reference cannot exceed 100 characters']
  },

  // Date and Time
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'approved'
  },

  // Approval Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },

  approvedAt: {
    type: Date,
    required: false
  },

  // Rejection Information
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tags for better organization
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Metadata
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Added by is required']
  },

  // Company association (for multi-tenant support)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false // Optional for system-wide entries
  },

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
financeEntrySchema.index({ type: 1, date: -1 });
financeEntrySchema.index({ date: -1 });
financeEntrySchema.index({ category: 1 });
financeEntrySchema.index({ status: 1 });
financeEntrySchema.index({ addedBy: 1 });
financeEntrySchema.index({ company: 1 });
financeEntrySchema.index({ isDeleted: 1 });

// Virtual for formatted amount
financeEntrySchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual for entry status
financeEntrySchema.virtual('entryStatus').get(function() {
  if (this.isDeleted) return 'deleted';
  return this.status;
});

// Pre-save middleware
financeEntrySchema.pre('save', function(next) {
  // Set income source for income entries
  if (this.type === 'income' && !this.incomeSource) {
    this.incomeSource = 'General Income';
  }

  // Set approval info for approved entries
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }

  next();
});

// Instance methods
financeEntrySchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

financeEntrySchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.rejectionReason = reason;
  return this.save();
};

financeEntrySchema.methods.softDelete = function(adminId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = adminId;
  return this.save();
};

// Static methods
financeEntrySchema.statics.getTotalByType = function(type, startDate, endDate) {
  const query = { type, isDeleted: false };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

financeEntrySchema.statics.getEntriesByDateRange = function(startDate, endDate, page = 1, limit = 20) {
  const query = {
    isDeleted: false,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  return this.paginate(query, {
    page,
    limit,
    sort: { date: -1 },
    populate: [
      { path: 'addedBy', select: 'username email' },
      { path: 'approvedBy', select: 'username email' },
      { path: 'company', select: 'name' }
    ]
  });
};

// Add pagination plugin
financeEntrySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('FinanceEntry', financeEntrySchema);
