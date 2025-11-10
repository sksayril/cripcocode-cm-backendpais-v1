const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const clientSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Store original plain text password (for retrieval purposes)
  // WARNING: This is a security risk - only use if absolutely necessary
  plainPassword: {
    type: String,
    select: false // Don't include in queries by default
  },

  // Role
  role: {
    type: String,
    default: "client",
    enum: ["client", "premium-client", "enterprise-client"],
    required: false
  },

  // Company Assignment
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false, // Made optional to support self-signup
    index: true
  },

  // Business Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    enum: [
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Retail',
      'Manufacturing',
      'Real Estate',
      'Marketing',
      'Consulting',
      'Other'
    ]
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    trim: true,
    enum: ['Startup', 'SME', 'Enterprise', 'Non-Profit', 'Government', 'Other']
  },

  // Contact Information
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },

  // Account Status & Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },

  // Authentication & Security
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Project Statistics
  totalProjects: {
    type: Number,
    default: 0
  },
  activeProjects: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },

  // Preferences & Settings
  communicationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    phone: { type: Boolean, default: true },
    preferredTime: { type: String, default: '9:00 AM - 6:00 PM' }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'en'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // Made optional to support self-signup
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // Made optional to support self-signup
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
// Note: email index is automatically created by unique: true
clientSchema.index({ company: 1, status: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ status: 1, isActive: 1 });
clientSchema.index({ createdBy: 1 });
clientSchema.index({ assignedBy: 1 });

// Virtuals
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

clientSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  return parts.join(', ');
});

clientSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

clientSchema.virtual('computedStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.isLocked) return 'locked';
  if (this.status === 'pending') return 'pending';
  return 'active';
});

// Pre-save middleware
clientSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  try {
    // Store plain text password before hashing (if not already hashed)
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isAlreadyHashed = this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$'));
    
    if (!isAlreadyHashed) {
      // Store plain text password before hashing
      this.plainPassword = this.password;
      // Hash password with cost of 12
      this.password = await bcrypt.hash(this.password, 12);
    }
    
    this.passwordChangedAt = Date.now() - 1000; // Set to 1 second ago
    next();
  } catch (error) {
    next(error);
  }
});

clientSchema.pre('save', function(next) {
  // Update project statistics if they're modified
  if (this.isModified('totalProjects') || this.isModified('activeProjects') || this.isModified('completedProjects')) {
    this.totalProjects = (this.totalProjects || 0);
    this.activeProjects = (this.activeProjects || 0);
    this.completedProjects = (this.completedProjects || 0);
  }
  next();
});

// Instance methods
clientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

clientSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

clientSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

clientSchema.methods.updateProjectStats = function() {
  // This method will be called to update project statistics
  // Implementation will be in the service layer
  return this.save();
};

// Static methods
clientSchema.statics.findByCompany = function(companyId) {
  return this.find({ company: companyId, isActive: true });
};

clientSchema.statics.findActiveClients = function() {
  return this.find({ isActive: true, status: 'active' });
};

clientSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Export the model
// Add pagination plugin
clientSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Client', clientSchema);
