const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const projectSchema = new mongoose.Schema({
  // Basic Project Information
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Project title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Project Type & Category
  projectType: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['digital-marketing', 'development'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    trim: true
  },

  // Digital Marketing specific fields
  digitalMarketing: {
    serviceType: {
      type: String,
      enum: [
        'SEO',
        'PPC',
        'Social Media Marketing',
        'Content Marketing',
        'Email Marketing',
        'Influencer Marketing',
        'Affiliate Marketing',
        'Analytics & Reporting',
        'Brand Strategy',
        'Other'
      ]
    },
    platforms: [{
      type: String,
      enum: [
        'Google',
        'Facebook',
        'Instagram',
        'LinkedIn',
        'Twitter',
        'YouTube',
        'TikTok',
        'Pinterest',
        'Other'
      ]
    }],
    targetAudience: String,
    campaignDuration: String,
    budget: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    }
  },

  // Development specific fields
  development: {
    technology: {
      frontend: [String],
      backend: [String],
      database: [String],
      mobile: [String],
      other: [String]
    },
    platform: {
      type: String,
      enum: ['Web', 'Mobile', 'Desktop', 'Hybrid', 'iOS & Android', 'Other']
    },
    complexity: {
      type: String,
      enum: ['Simple', 'Medium', 'High', 'Complex', 'Enterprise']
    },
    estimatedHours: {
      min: Number,
      max: Number
    }
  },

  // Client & Company Information
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
    index: true
  },

  // Project Management
  status: {
    type: String,
    enum: [
      'planning',
      'active',
      'on-hold',
      'completed',
      'cancelled',
      'archived'
    ],
    default: 'planning',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Timeline & Milestones
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  estimatedDuration: {
    type: Number, // in days
    required: [true, 'Estimated duration is required']
  },
  actualDuration: Number, // in days

  // Project Splitting & Phases
  phases: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'on-hold'],
      default: 'pending'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    deliverables: [{
      name: String,
      description: String,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'review'],
        default: 'pending'
      },
      dueDate: Date,
      completedDate: Date,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      }
    }],
    tasks: [{
      title: String,
      description: String,
      status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'completed'],
        default: 'todo'
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      estimatedHours: Number,
      actualHours: Number,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      },
      dueDate: Date,
      completedDate: Date,
      dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }]
    }],
    budget: {
      allocated: Number,
      spent: Number,
      currency: { type: String, default: 'USD' }
    }
  }],

  // Financial Information
  budget: {
    total: {
      type: Number,
      required: [true, 'Total budget is required']
    },
    allocated: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  billing: {
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'milestone', 'retainer'],
      default: 'fixed'
    },
    rate: Number, // hourly rate if applicable
    paymentTerms: String,
    invoices: [{
      invoiceNumber: String,
      amount: Number,
      status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue'],
        default: 'draft'
      },
      dueDate: Date,
      paidDate: Date
    }]
  },

  // Team & Resources
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Project manager is required']
  },
  team: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    role: String,
    assignedDate: Date,
    removedDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  externalResources: [{
    name: String,
    type: String, // vendor, contractor, etc.
    contact: String,
    cost: Number,
    description: String
  }],

  // Communication & Documentation
  communication: {
    channels: [{
      type: String,
      enum: ['email', 'slack', 'teams', 'phone', 'meeting', 'zoom', 'other']
    }],
    frequency: String, // daily, weekly, bi-weekly, monthly
    stakeholders: [{
      name: String,
      role: String,
      email: String,
      phone: String
    }]
  },
  documents: [{
    name: String,
    type: String, // proposal, contract, srs, design, etc.
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    version: String
  }],

  // Risk & Issues Management
  risks: [{
    description: String,
    probability: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    mitigation: String,
    status: {
      type: String,
      enum: ['identified', 'mitigated', 'closed']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  issues: [{
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed']
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolution: String
  }],

  // Quality & Testing
  qualityMetrics: {
    codeCoverage: Number,
    testPassRate: Number,
    bugDensity: Number,
    performanceScore: Number
  },
  testing: {
    unitTesting: Boolean,
    integrationTesting: Boolean,
    userAcceptanceTesting: Boolean,
    performanceTesting: Boolean,
    securityTesting: Boolean
  },

  // Deployment & Maintenance
  deployment: {
    environment: {
      type: String,
      enum: ['development', 'staging', 'production']
    },
    deploymentDate: Date,
    version: String,
    notes: String
  },
  maintenance: {
    type: {
      type: String,
      enum: ['none', 'basic', 'standard', 'premium']
    },
    startDate: Date,
    endDate: Date,
    monthlyCost: Number
  },

  // Analytics & Performance
  metrics: {
    userEngagement: Number,
    conversionRate: Number,
    pageLoadTime: Number,
    bounceRate: Number,
    customMetrics: [{
      name: String,
      value: Number,
      unit: String
    }]
  },

  // Metadata
  tags: [String],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
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

// Indexes for better query performance
projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ company: 1, status: 1 });
projectSchema.index({ projectType: 1, status: 1 });
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ 'team.member': 1 });
projectSchema.index({ tags: 1 });

// Virtuals
projectSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && new Date() > this.endDate;
});

projectSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

projectSchema.virtual('budgetUtilization').get(function() {
  if (this.budget.total === 0) return 0;
  return (this.budget.spent / this.budget.total) * 100;
});

projectSchema.virtual('phaseProgress').get(function() {
  if (!this.phases || this.phases.length === 0) return 0;
  const totalProgress = this.phases.reduce((sum, phase) => sum + phase.progress, 0);
  return Math.round(totalProgress / this.phases.length);
});

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Calculate remaining budget
  if (this.budget.total && this.budget.spent) {
    this.budget.remaining = this.budget.total - this.budget.spent;
  }

  // Calculate overall progress based on phases
  if (this.phases && this.phases.length > 0) {
    const totalProgress = this.phases.reduce((sum, phase) => sum + phase.progress, 0);
    this.progress = Math.round(totalProgress / this.phases.length);
  }

  // Set updatedBy
  if (this.isModified()) {
    this.updatedBy = this.createdBy; // This will be updated in controller
  }

  next();
});

// Instance methods
projectSchema.methods.addPhase = function(phaseData) {
  this.phases.push(phaseData);
  return this.save();
};

projectSchema.methods.updatePhaseProgress = function(phaseId, progress) {
  const phase = this.phases.id(phaseId);
  if (phase) {
    phase.progress = progress;
    return this.save();
  }
  throw new Error('Phase not found');
};

projectSchema.methods.addTeamMember = function(memberData) {
  this.team.push(memberData);
  return this.save();
};

projectSchema.methods.removeTeamMember = function(memberId) {
  const member = this.team.id(memberId);
  if (member) {
    member.isActive = false;
    member.removedDate = new Date();
    return this.save();
  }
  throw new Error('Team member not found');
};

projectSchema.methods.addIssue = function(issueData) {
  this.issues.push(issueData);
  return this.save();
};

projectSchema.methods.addRisk = function(riskData) {
  this.risks.push(riskData);
  return this.save();
};

// Static methods
projectSchema.statics.findByClient = function(clientId) {
  return this.find({ client: clientId }).populate('phases.deliverables.assignedTo team.member');
};

projectSchema.statics.findByCompany = function(companyId) {
  return this.find({ company: companyId }).populate('client projectManager');
};

projectSchema.statics.findByType = function(projectType) {
  return this.find({ projectType, status: { $ne: 'archived' } });
};

projectSchema.statics.findActiveProjects = function() {
  return this.find({ status: 'active' }).populate('client projectManager');
};

projectSchema.statics.findOverdueProjects = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    endDate: { $lt: now }
  }).populate('client projectManager');
};

// Add pagination plugin
projectSchema.plugin(mongoosePaginate);

// Export the model
module.exports = mongoose.model('Project', projectSchema);
