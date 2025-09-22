const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Company Basic Information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  // Company Details
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Company email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Company phone is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State name cannot exceed 100 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters']
    }
  },
  
  // Company Settings
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  
  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    default: 'small'
  },
  
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  
  // Company Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Subscription & Billing
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  
  subscriptionExpiry: {
    type: Date
  },
  
  // Company Statistics
  stats: {
    totalAdmins: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    totalProjects: {
      type: Number,
      default: 0
    }
  },
  
  // Created by super admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// Note: email index is automatically created by unique: true
companySchema.index({ name: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ createdBy: 1 });

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.country, addr.zipCode];
  return parts.filter(part => part && part.trim()).join(', ');
});

// Virtual for company status
companySchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.subscriptionExpiry && new Date() > this.subscriptionExpiry) return 'expired';
  return 'active';
});

// Pre-save middleware to update stats
companySchema.pre('save', async function(next) {
  if (this.isModified('isActive') && !this.isActive) {
    // If company is deactivated, deactivate all associated admins and users
    const Admin = mongoose.model('Admin');
    const User = mongoose.model('User');
    
    await Admin.updateMany(
      { company: this._id },
      { isActive: false }
    );
    
    await User.updateMany(
      { company: this._id },
      { isActive: false }
    );
  }
  next();
});

// Static method to get company statistics
companySchema.statics.getCompanyStats = async function(companyId) {
  const Admin = mongoose.model('Admin');
  const User = mongoose.model('User');
  
  const [adminCount, userCount] = await Promise.all([
    Admin.countDocuments({ company: companyId, isActive: true }),
    User.countDocuments({ company: companyId, isActive: true })
  ]);
  
  return {
    totalAdmins: adminCount,
    totalUsers: userCount
  };
};

// Instance method to update company statistics
companySchema.methods.updateStats = async function() {
  const stats = await this.constructor.getCompanyStats(this._id);
  this.stats = stats;
  return this.save();
};

module.exports = mongoose.model('Company', companySchema);
