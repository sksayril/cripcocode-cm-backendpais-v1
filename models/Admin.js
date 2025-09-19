const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Personal Information
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
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
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  
  // Company Assignment
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company assignment is required']
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['superAdmin', 'CompanyAdmin', 'manager', 'sales', 'support'],
    default: 'manager'
  },
  
  // Department and Area
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  adminArea: {
    type: String,
    required: [true, 'Admin area is required'],
    trim: true,
    maxlength: [100, 'Admin area cannot exceed 100 characters']
  },
  
  // Permissions (Company-specific)
  permissions: {
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageAdmins: {
      type: Boolean,
      default: false
    },
    canManageCompany: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: true
    },
    canManageProjects: {
      type: Boolean,
      default: false
    },
    canManageBilling: {
      type: Boolean,
      default: false
    }
  },
  
  // Security
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Login Information
  lastLogin: {
    type: Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date
  },
  
  // Created by (Super admin or Company admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ phone: 1 });
adminSchema.index({ company: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ createdBy: 1 });

// Virtual for admin status
adminSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.lockUntil && this.lockUntil > Date.now()) return 'locked';
  return 'active';
});

// Virtual for isLocked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'superAdmin':
        this.permissions = {
          canManageUsers: true,
          canManageAdmins: true,
          canManageCompany: true,
          canViewReports: true,
          canManageProjects: true,
          canManageBilling: true
        };
        break;
      case 'CompanyAdmin':
        this.permissions = {
          canManageUsers: true,
          canManageAdmins: true,
          canManageCompany: true,
          canViewReports: true,
          canManageProjects: true,
          canManageBilling: true
        };
        break;
      case 'manager':
        this.permissions = {
          canManageUsers: true,
          canManageAdmins: false,
          canManageCompany: false,
          canViewReports: true,
          canManageProjects: true,
          canManageBilling: false
        };
        break;
      case 'sales':
        this.permissions = {
          canManageUsers: false,
          canManageAdmins: false,
          canManageCompany: false,
          canViewReports: true,
          canManageProjects: false,
          canManageBilling: false
        };
        break;
      case 'support':
        this.permissions = {
          canManageUsers: false,
          canManageAdmins: false,
          canManageCompany: false,
          canViewReports: true,
          canManageProjects: false,
          canManageBilling: false
        };
        break;
    }
  }
  next();
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return await this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find by email or username
adminSchema.statics.findByEmailOrUsername = function(emailOrUsername) {
  return this.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername }
    ]
  });
};

module.exports = mongoose.model('Admin', adminSchema);
