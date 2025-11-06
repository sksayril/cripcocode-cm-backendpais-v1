const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    unique: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    index: true
  },
  subType: {
    type: String,
    trim: true,
    maxlength: 50
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 3
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isSystemAccount: {
    type: Boolean,
    default: false
  },
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
ledgerSchema.index({ company: 1, type: 1, isActive: 1 });
ledgerSchema.index({ company: 1, code: 1 });
ledgerSchema.index({ company: 1, name: 1 });

// Virtual for formatted balance
ledgerSchema.virtual('formattedBalance').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD'
  }).format(this.currentBalance);
});

// Virtual for type display
ledgerSchema.virtual('typeDisplay').get(function() {
  const typeMap = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expense'
  };
  return typeMap[this.type] || this.type;
});

// Virtual for account hierarchy
ledgerSchema.virtual('children', {
  ref: 'Ledger',
  localField: '_id',
  foreignField: 'parentAccount'
});

// Pre-save middleware
ledgerSchema.pre('save', function(next) {
  // Set updatedBy if not already set
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Initialize current balance with opening balance if not set
  if (this.isNew && this.currentBalance === 0) {
    this.currentBalance = this.openingBalance;
  }
  
  next();
});

// Static methods
ledgerSchema.statics.getByType = async function(companyId, type, includeInactive = false) {
  const query = {
    company: companyId,
    type: type,
    isDeleted: false
  };
  
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return await this.find(query)
    .populate('parentAccount', 'name code')
    .populate('createdBy', 'username fullname')
    .sort({ code: 1 });
};

ledgerSchema.statics.getAccountHierarchy = async function(companyId) {
  const accounts = await this.find({
    company: companyId,
    isDeleted: false,
    isActive: true
  }).populate('parentAccount', 'name code');
  
  // Build hierarchy
  const hierarchy = {};
  const rootAccounts = [];
  
  accounts.forEach(account => {
    if (!account.parentAccount) {
      rootAccounts.push(account);
    } else {
      if (!hierarchy[account.parentAccount._id]) {
        hierarchy[account.parentAccount._id] = [];
      }
      hierarchy[account.parentAccount._id].push(account);
    }
  });
  
  return { rootAccounts, hierarchy };
};

ledgerSchema.statics.getBalanceSheetAccounts = async function(companyId) {
  const assets = await this.getByType(companyId, 'asset');
  const liabilities = await this.getByType(companyId, 'liability');
  const equity = await this.getByType(companyId, 'equity');
  
  return { assets, liabilities, equity };
};

ledgerSchema.statics.getProfitLossAccounts = async function(companyId) {
  const revenue = await this.getByType(companyId, 'revenue');
  const expenses = await this.getByType(companyId, 'expense');
  
  return { revenue, expenses };
};

ledgerSchema.statics.updateBalance = async function(accountId, amount, operation = 'add') {
  const account = await this.findById(accountId);
  if (!account) {
    throw new Error('Account not found');
  }
  
  if (operation === 'add') {
    account.currentBalance += amount;
  } else if (operation === 'subtract') {
    account.currentBalance -= amount;
  }
  
  return await account.save();
};

// Instance methods
ledgerSchema.methods.updateBalance = function(amount, operation = 'add') {
  if (operation === 'add') {
    this.currentBalance += amount;
  } else if (operation === 'subtract') {
    this.currentBalance -= amount;
  }
  return this.save();
};

ledgerSchema.methods.softDelete = function(adminId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = adminId;
  return this.save();
};

ledgerSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

ledgerSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Add pagination plugin
ledgerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ledger', ledgerSchema);
