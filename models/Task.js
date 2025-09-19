const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Project & Client Information
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project assignment is required']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client assignment is required']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company assignment is required']
  },

  // Task Classification
  type: {
    type: String,
    required: [true, 'Task type is required'],
    enum: ['development', 'design', 'marketing', 'content', 'testing', 'deployment', 'maintenance', 'research', 'documentation', 'other']
  },
  category: {
    type: String,
    required: [true, 'Task category is required'],
    trim: true
  },
  priority: {
    type: String,
    required: [true, 'Task priority is required'],
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  complexity: {
    type: String,
    enum: ['simple', 'moderate', 'complex', 'very-complex'],
    default: 'moderate'
  },

  // Assignment & Team
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Task must be assigned to an employee']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedByModel',
    required: [true, 'Task assignment source is required']
  },
  assignedByModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  teamMembers: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
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
    }
  }],

  // Timeline & Deadlines
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours are required'],
    min: [0.5, 'Estimated hours must be at least 0.5']
  },
  actualHours: {
    type: Number,
    default: 0,
    min: [0, 'Actual hours cannot be negative']
  },

  // Progress & Status
  status: {
    type: String,
    required: [true, 'Task status is required'],
    enum: ['pending', 'in-progress', 'review', 'testing', 'completed', 'on-hold', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  completionDate: Date,

  // Dependencies & Relationships
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related-to'],
      default: 'blocks'
    }
  }],
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  subTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],

  // Deliverables & Requirements
  deliverables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    fileType: String,
    isRequired: {
      type: Boolean,
      default: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedDate: Date
  }],
  requirements: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    isMet: {
      type: Boolean,
      default: false
    }
  }],

  // Time Tracking
  timeEntries: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: Number, // in minutes
    description: String,
    isBillable: {
      type: Boolean,
      default: true
    }
  }],

  // Quality & Review
  qualityScore: {
    type: Number,
    min: [0, 'Quality score cannot be negative'],
    max: [10, 'Quality score cannot exceed 10'],
    default: 0
  },
  reviewComments: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    comment: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Communication & Updates
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  updates: [{
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    updateDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Budget & Cost
  budget: {
    allocated: {
      type: Number,
      default: 0,
      min: [0, 'Allocated budget cannot be negative']
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Tags & Labels
  tags: [String],
  labels: [String],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true
  },
  createdByModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ company: 1, dueDate: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ 'dependencies.task': 1 });
taskSchema.index({ parentTask: 1 });

// Virtuals
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  return this.dueDate < new Date();
});

taskSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

taskSchema.virtual('timeSpent').get(function() {
  return this.timeEntries.reduce((total, entry) => {
    if (entry.duration) return total + entry.duration;
    if (entry.startTime && entry.endTime) {
      const duration = (entry.endTime - entry.startTime) / (1000 * 60); // Convert to minutes
      return total + duration;
    }
    return total;
  }, 0);
});

taskSchema.virtual('efficiency').get(function() {
  if (this.estimatedHours === 0) return 0;
  const actualHours = this.actualHours || (this.timeSpent / 60); // Convert minutes to hours
  return Math.round((this.estimatedHours / actualHours) * 100);
});

taskSchema.virtual('priorityScore').get(function() {
  const priorityScores = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
  const complexityScores = { 'simple': 1, 'moderate': 2, 'complex': 3, 'very-complex': 4 };
  
  let score = priorityScores[this.priority] || 2;
  score += complexityScores[this.complexity] || 2;
  
  // Add overdue penalty
  if (this.isOverdue) score += 2;
  
  return score;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Update progress based on sub-tasks if this is a parent task
  if (this.subTasks && this.subTasks.length > 0) {
    // This will be calculated when sub-tasks are updated
  }
  
  // Update completion date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completionDate) {
    this.completionDate = new Date();
  }
  
  next();
});

// Instance methods
taskSchema.methods.updateProgress = function() {
  if (this.subTasks && this.subTasks.length > 0) {
    // Calculate progress based on sub-tasks
    const totalSubTasks = this.subTasks.length;
    const completedSubTasks = this.subTasks.filter(task => task.status === 'completed').length;
    this.progress = Math.round((completedSubTasks / totalSubTasks) * 100);
  }
  
  return this.save();
};

taskSchema.methods.addTimeEntry = function(employeeId, startTime, endTime, description, isBillable = true) {
  const duration = endTime ? Math.round((endTime - startTime) / (1000 * 60)) : 0; // Convert to minutes
  
  this.timeEntries.push({
    employee: employeeId,
    startTime,
    endTime,
    duration,
    description,
    isBillable
  });
  
  // Update actual hours
  this.actualHours = Math.round((this.timeSpent / 60) * 100) / 100; // Convert to hours with 2 decimal places
  
  return this.save();
};

taskSchema.methods.assignToEmployee = function(employeeId, assignedBy) {
  this.assignedTo = employeeId;
  this.assignedBy = assignedBy;
  this.assignedDate = new Date();
  this.status = 'pending';
  
  return this.save();
};

taskSchema.methods.addComment = function(employeeId, content, isInternal = false) {
  this.comments.push({
    author: employeeId,
    content,
    isInternal,
    timestamp: new Date()
  });
  
  return this.save();
};

// Static methods
taskSchema.statics.findByPriority = function(companyId, priority) {
  return this.find({ company: companyId, priority, status: { $ne: 'completed' } });
};

taskSchema.statics.findOverdue = function(companyId) {
  return this.find({
    company: companyId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });
};

taskSchema.statics.findByEmployee = function(employeeId, status = null) {
  const query = { assignedTo: employeeId };
  if (status) query.status = status;
  return this.find(query);
};

taskSchema.statics.findByProject = function(projectId, status = null) {
  const query = { project: projectId };
  if (status) query.status = status;
  return this.find(query);
};

// Add pagination plugin
taskSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Task', taskSchema);
