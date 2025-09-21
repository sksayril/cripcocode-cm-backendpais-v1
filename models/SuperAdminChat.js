const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const superAdminChatSchema = new mongoose.Schema({
  // Sender information (SuperAdmin only)
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    model: {
      type: String,
      enum: ['Admin'],
      default: 'Admin'
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['superAdmin'],
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    }
  },
  
  // Recipient information (Any user type)
  recipient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      enum: ['Admin', 'Employee', 'Client', 'CompanyAdmin', 'superAdmin'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    }
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000 // Super admin can send longer messages
  },
  
  // Message type
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'link', 'system', 'announcement', 'command'],
    default: 'text'
  },
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'archived'],
    default: 'sent'
  },
  
  // Priority levels for super admin messages
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'critical'],
    default: 'normal'
  },
  
  // Category for better organization
  category: {
    type: String,
    enum: ['general', 'system', 'announcement', 'support', 'billing', 'technical', 'security', 'policy', 'maintenance', 'emergency'],
    default: 'general'
  },
  
  // Read tracking
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userModel: {
      type: String,
      enum: ['Admin', 'Employee', 'Client', 'CompanyAdmin', 'superAdmin']
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Edit tracking
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editCount: {
      type: Number,
      default: 0
    },
    lastEditedAt: Date,
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    editHistory: [{
      content: String,
      editedAt: Date,
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      }
    }]
  },
  
  // Delete tracking
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    deleteReason: String
  },
  
  // Super admin specific features
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  
  isAnnouncement: {
    type: Boolean,
    default: false
  },
  
  isEmergency: {
    type: Boolean,
    default: false
  },
  
  // Message visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'company', 'department'],
    default: 'private'
  },
  
  // Scheduling for announcements
  scheduledAt: Date,
  
  // Expiry for temporary messages
  expiresAt: Date,
  
  // Tags for better organization
  tags: [String],
  
  // Related entities
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  relatedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['sent', 'edited', 'deleted', 'archived', 'restored']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
superAdminChatSchema.index({ 'sender.id': 1, createdAt: -1 });
superAdminChatSchema.index({ 'recipient.id': 1, createdAt: -1 });
superAdminChatSchema.index({ 'recipient.model': 1, createdAt: -1 });
superAdminChatSchema.index({ status: 1, priority: 1 });
superAdminChatSchema.index({ category: 1, createdAt: -1 });
superAdminChatSchema.index({ isSystemMessage: 1, isAnnouncement: 1 });
superAdminChatSchema.index({ scheduledAt: 1 });
superAdminChatSchema.index({ expiresAt: 1 });
superAdminChatSchema.index({ tags: 1 });

// Virtual for message age
superAdminChatSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is expired
superAdminChatSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for is scheduled
superAdminChatSchema.virtual('isScheduled').get(function() {
  if (!this.scheduledAt) return false;
  return new Date() < this.scheduledAt;
});

// Static method to get conversation
superAdminChatSchema.statics.getConversation = function(senderId, recipientId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { 'sender.id': senderId, 'recipient.id': recipientId },
      { 'sender.id': recipientId, 'recipient.id': senderId }
    ],
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('sender.id', 'username fullname role')
  .populate('recipient.id', 'username fullname firstName lastName role');
};

// Static method to get unread count
superAdminChatSchema.statics.getUnreadCount = function(recipientId) {
  return this.countDocuments({
    'recipient.id': recipientId,
    'deleted.isDeleted': false,
    $expr: {
      $not: {
        $in: [recipientId, '$readBy.user']
      }
    }
  });
};

// Static method to get system messages
superAdminChatSchema.statics.getSystemMessages = function(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    isSystemMessage: true,
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get announcements
superAdminChatSchema.statics.getAnnouncements = function(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    isAnnouncement: true,
    'deleted.isDeleted': false,
    $or: [
      { scheduledAt: { $lte: new Date() } },
      { scheduledAt: { $exists: false } }
    ],
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  })
  .sort({ priority: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Instance method to mark as read
superAdminChatSchema.methods.markAsRead = function(userId, userModel) {
  const alreadyRead = this.readBy.some(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      userModel: userModel,
      readAt: new Date()
    });
    
    if (this.recipient.id.toString() === userId.toString()) {
      this.status = 'read';
    }
  }
  
  return this.save();
};

// Instance method to add to audit trail
superAdminChatSchema.methods.addAuditEntry = function(action, performedBy, details = '') {
  this.auditTrail.push({
    action,
    performedBy,
    performedAt: new Date(),
    details
  });
  
  return this.save();
};

// Pre-save middleware
superAdminChatSchema.pre('save', function(next) {
  // Add initial audit entry
  if (this.isNew) {
    this.auditTrail.push({
      action: 'sent',
      performedBy: this.sender.id,
      performedAt: new Date(),
      details: 'Message sent'
    });
  }
  
  next();
});

// Add pagination plugin
superAdminChatSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('SuperAdminChat', superAdminChatSchema);
