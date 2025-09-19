const mongoose = require('mongoose');

// Employee Message Schema
const employeeMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      enum: ['Admin', 'Employee', 'CompanyAdmin', 'superAdmin', 'Client'],
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
  recipient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    model: {
      type: String,
      enum: ['Admin', 'Employee', 'CompanyAdmin', 'superAdmin', 'Client'],
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
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
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
    lastEditedBy: mongoose.Schema.Types.ObjectId
  },
  deleted: {
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

// Indexes for better performance
employeeMessageSchema.index({ 'sender.id': 1, 'recipient.id': 1 });
employeeMessageSchema.index({ 'recipient.id': 1, 'sender.id': 1 });
employeeMessageSchema.index({ content: 'text' });
employeeMessageSchema.index({ createdAt: -1 });

// Instance methods
employeeMessageSchema.methods.canEdit = function(userId, userRole) {
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

employeeMessageSchema.methods.canDelete = function(userId, userRole) {
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
employeeMessageSchema.statics.getConversation = function(user1Id, user2Id, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { 'sender.id': user1Id, 'recipient.id': user2Id },
      { 'sender.id': user2Id, 'recipient.id': user1Id }
    ],
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

employeeMessageSchema.statics.getUserMessages = function(userId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { 'sender.id': userId },
      { 'recipient.id': userId }
    ],
    'deleted.isDeleted': false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

employeeMessageSchema.statics.searchMessages = function(userId, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  // Create a regex pattern for case-insensitive search
  const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  
  return this.find({
    $or: [
      { 'sender.id': userId },
      { 'recipient.id': userId }
    ],
    'deleted.isDeleted': false,
    content: searchRegex
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

employeeMessageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    'recipient.id': userId,
    'readBy.user': { $ne: userId },
    'deleted.isDeleted': false
  });
};

module.exports = mongoose.model('EmployeeMessage', employeeMessageSchema);
