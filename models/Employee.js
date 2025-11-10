const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const employeeSchema = new mongoose.Schema({
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
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
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
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Store original plain text password (for retrieval purposes)
  // WARNING: This is a security risk - only use if absolutely necessary
  plainPassword: {
    type: String,
    select: false // Don't include in queries by default
  },

  // Company & Department Information
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company assignment is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['development', 'digital-marketing', 'graphics-design', 'hr', 'accounting', 'sales', 'support', 'management', 'design', 'engineering', 'it', 'marketing', 'operations', 'finance', 'legal', 'research', 'other']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['employee', 'junior', 'senior', 'lead', 'manager', 'director', 'designer', 'developer', 'analyst', 'specialist', 'coordinator', 'assistant', 'consultant', 'other']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },

  // Skills & Expertise
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0
    }
  }],

  // Project & Task Management
  assignedProjects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    responsibilities: [String]
  }],

  currentTasks: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    dueDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'review', 'completed', 'on-hold'],
      default: 'pending'
    }
  }],

  // Work Schedule & Availability
  workSchedule: {
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '18:00'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    workingDays: {
      type: [String],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  },

  // Performance & Statistics
  performance: {
    completedTasks: {
      type: Number,
      default: 0
    },
    totalProjects: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    lastReviewDate: Date
  },

  // Account Status & Security
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
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Personal Information
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },

  // Employment Details
  employeeId: {
    type: String,
    unique: true,
    required: false // Made optional since it's auto-generated
  },
  joiningDate: {
    type: Date,
    required: true
  },
  contractType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  salary: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    frequency: {
      type: String,
      enum: ['monthly', 'weekly', 'hourly'],
      default: 'monthly'
    }
  },

  // Permissions & Access Control
  permissions: {
    canCreateProjects: {
      type: Boolean,
      default: false
    },
    canAssignTasks: {
      type: Boolean,
      default: false
    },
    canViewAllProjects: {
      type: Boolean,
      default: false
    },
    canManageTeam: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: false
    },
    canManageClients: {
      type: Boolean,
      false: false
    }
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
employeeSchema.index({ email: 1, company: 1 });
employeeSchema.index({ company: 1, department: 1 });
employeeSchema.index({ employeeId: 1, company: 1 });
employeeSchema.index({ 'assignedProjects.project': 1 });
employeeSchema.index({ 'currentTasks.task': 1 });

// Virtuals
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const addr = this.address;
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.country || ''} ${addr.zipCode || ''}`.trim();
});

employeeSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

employeeSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.isLocked) return 'locked';
  return 'active';
});

employeeSchema.virtual('experienceLevel').get(function() {
  if (!this.skills || !Array.isArray(this.skills)) return 'junior';
  const totalExperience = this.skills.reduce((sum, skill) => sum + (skill.yearsOfExperience || 0), 0);
  if (totalExperience >= 8) return 'expert';
  if (totalExperience >= 5) return 'senior';
  if (totalExperience >= 2) return 'intermediate';
  return 'junior';
});

// Pre-save middleware
employeeSchema.pre('save', async function(next) {
  try {
    // Hash password if modified
    if (this.isModified('password')) {
      // Store plain text password before hashing (if not already hashed)
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isAlreadyHashed = this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$'));
      
      if (!isAlreadyHashed) {
        // Store plain text password before hashing
        this.plainPassword = this.password;
        // Hash password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);
      }
    }

    // Generate employee ID if not exists
    if (!this.employeeId) {
      try {
        // Simple employee ID generation
        const count = await this.constructor.countDocuments();
        this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
      } catch (error) {
        // Fallback to timestamp-based ID
        console.log('Employee count failed, using timestamp fallback');
        this.employeeId = `EMP${Date.now().toString().slice(-6)}`;
      }
    }

    // Set permissions based on role
    if (this.isModified('role') || this.isModified('department')) {
      this.setPermissions();
    }

    next();
  } catch (error) {
    console.error('Pre-save error:', error);
    next(error);
  }
});

// Instance methods
employeeSchema.methods.setPermissions = function() {
  const permissions = {
    canCreateProjects: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canManageTeam: false,
    canViewReports: false,
    canManageClients: false
  };

  // Role-based permissions
  if (['manager', 'director'].includes(this.role)) {
    permissions.canCreateProjects = true;
    permissions.canAssignTasks = true;
    permissions.canViewAllProjects = true;
    permissions.canManageTeam = true;
    permissions.canViewReports = true;
  }

  if (['lead', 'senior'].includes(this.role)) {
    permissions.canAssignTasks = true;
    permissions.canViewAllProjects = true;
    permissions.canViewReports = true;
  }

  // Department-specific permissions
  if (this.department === 'management') {
    permissions.canManageClients = true;
  }

  this.permissions = permissions;
};

employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.methods.incrementLoginAttempts = function() {
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

employeeSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static methods
employeeSchema.statics.findByDepartment = function(companyId, department) {
  return this.find({ company: companyId, department, isActive: true });
};

employeeSchema.statics.findBySkills = function(companyId, requiredSkills) {
  return this.find({
    company: companyId,
    isActive: true,
    skills: {
      $elemMatch: {
        name: { $in: requiredSkills },
        level: { $in: ['intermediate', 'advanced', 'expert'] }
      }
    }
  });
};

employeeSchema.statics.findAvailableEmployees = function(companyId, projectId) {
  return this.find({
    company: companyId,
    isActive: true,
    $or: [
      { 'assignedProjects.project': { $ne: projectId } },
      { 'assignedProjects.project': { $exists: false } }
    ]
  });
};

// Add pagination plugin
employeeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Employee', employeeSchema);
