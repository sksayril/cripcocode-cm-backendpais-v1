const mongoose = require('mongoose');

const clientMessageSchema = new mongoose.Schema({
  // Sender information (Client, Admin, Employee, or superAdmin)
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      enum: ['Client', 'Admin', 'Employee', 'superAdmin', 'CompanyAdmin'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  
  // Recipient information (Client, Admin, CompanyAdmin, superAdmin, or Employee)
  recipient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      enum: ['Client', 'Admin', 'Employee', 'superAdmin', 'CompanyAdmin'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  // Message type
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'link'],
    default: 'text'
  },
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Read tracking
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
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
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Delete tracking
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Message category for organization
  category: {
    type: String,
    enum: ['general', 'support', 'billing', 'technical', 'feature-request', 'complaint', 'other'],
    default: 'general'
  },
  
  // Company context (for multi-tenant support)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
}, {
  timestamps: true
});

// Indexes for better performance
clientMessageSchema.index({ 'sender.id': 1, 'recipient.id': 1 });
clientMessageSchema.index({ 'recipient.id': 1, 'sender.id': 1 });
clientMessageSchema.index({ 'recipient.id': 1, 'sender.id': 1 });
clientMessageSchema.index({ content: 'text' });
clientMessageSchema.index({ createdAt: -1 });
clientMessageSchema.index({ 'company': 1 });
clientMessageSchema.index({ 'category': 1 });
clientMessageSchema.index({ 'priority': 1 });

// Instance methods
clientMessageSchema.methods.canEdit = function(userId, userRole) {
  // superAdmin can edit any message
  if (userRole === 'superAdmin') {
    return true;
  }
  
  // Admin and CompanyAdmin can edit their own messages
  if (['admin', 'CompanyAdmin'].includes(userRole) && this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  // All employee roles can edit their own messages
  const employeeRoles = ['employee', 'junior', 'senior', 'lead', 'manager', 'director', 'designer', 'developer', 'analyst', 'specialist', 'coordinator', 'assistant', 'consultant', 'other'];
  if (employeeRoles.includes(userRole) && this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  // All client roles can edit their own messages
  const clientRoles = ['client', 'premium-client', 'enterprise-client'];
  if (clientRoles.includes(userRole) && this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  return false;
};

clientMessageSchema.methods.canDelete = function(userId, userRole) {
  // superAdmin can delete any message
  if (userRole === 'superAdmin') {
    return true;
  }
  
  // Admin and CompanyAdmin can delete their own messages
  if (['admin', 'CompanyAdmin'].includes(userRole) && this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  // All employee roles can delete their own messages
  const employeeRoles = ['employee', 'junior', 'senior', 'lead', 'manager', 'director', 'designer', 'developer', 'analyst', 'specialist', 'coordinator', 'assistant', 'consultant', 'other'];
  if (employeeRoles.includes(userRole) && this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  // All client roles can delete their own messages
  const clientRoles = ['client', 'premium-client', 'enterprise-client'];
  if (clientRoles.includes(userRole) && this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  return false;
};

// Static methods
clientMessageSchema.statics.getConversation = function(clientId, recipientId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { 'sender.id': clientId, 'recipient.id': recipientId },
      { 'sender.id': recipientId, 'recipient.id': clientId }
    ],
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

clientMessageSchema.statics.getClientMessages = function(clientId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    'sender.id': clientId,
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

clientMessageSchema.statics.getRecipientMessages = function(recipientId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    'recipient.id': recipientId,
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

clientMessageSchema.statics.searchMessages = function(clientId, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  // Create a regex pattern for case-insensitive search
  const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  
  return this.find({
    'sender.id': clientId,
    'deleted.isDeleted': false,
    content: searchRegex
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

clientMessageSchema.statics.getUnreadCount = function(recipientId) {
  return this.countDocuments({
    'recipient.id': recipientId,
    'readBy.user': { $ne: recipientId },
    'deleted.isDeleted': false
  });
};

clientMessageSchema.statics.getChatStats = function(clientId) {
  return this.aggregate([
    {
      $match: {
        'sender.id': mongoose.Types.ObjectId(clientId),
        'deleted.isDeleted': false
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        unreadMessages: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'sent'] },
              1,
              0
            ]
          }
        },
        categories: {
          $addToSet: '$category'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ClientMessage', clientMessageSchema);
