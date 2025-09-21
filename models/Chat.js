const mongoose = require('mongoose');

// Message schema
const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  
  // Sender information (polymorphic reference)
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['Admin', 'Employee', 'Client', 'superAdmin', 'CompanyAdmin']
    },
    name: String,
    role: String
  },
  
  // Recipient information (polymorphic reference)
  recipient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipient.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['Admin', 'Employee', 'Client', 'superAdmin', 'CompanyAdmin']
    },
    name: String,
    role: String
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
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
    }
  },
  
  // Reply to message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Read status
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'readBy.userModel'
    },
    userModel: {
      type: String,
      enum: ['Admin', 'Employee', 'Client', 'superAdmin', 'CompanyAdmin']
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Instance methods for messages
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => 
    r.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

messageSchema.methods.canEdit = function(userId, userRole) {
  // Only superAdmin, admin, and CompanyAdmin can edit their own messages
  if (['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole) && 
      this.sender.id.toString() === userId.toString()) {
    return true;
  }
  return false;
};

messageSchema.methods.canDelete = function(userId, userRole) {
  // Super-admin can delete any message
  if (userRole === 'superAdmin') return true;
  
  // Admin and CompanyAdmin can delete their own messages
  if (['admin', 'CompanyAdmin'].includes(userRole) && 
      this.sender.id.toString() === userId.toString()) {
    return true;
  }
  
  return false;
};

// Static methods for messages
messageSchema.statics.findConversation = function(user1Id, user2Id, page = 1, limit = 50) {
  return this.find({
    $or: [
      {
        'sender.id': user1Id,
        'recipient.id': user2Id
      },
      {
        'sender.id': user2Id,
        'recipient.id': user1Id
      }
    ],
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .populate('sender.id', 'username fullname role')
  .populate('recipient.id', 'username fullname role')
  .populate('replyTo');
};

messageSchema.statics.findUserMessages = function(userId, page = 1, limit = 50) {
  return this.find({
    $or: [
      { 'sender.id': userId },
      { 'recipient.id': userId }
    ],
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .populate('sender.id', 'username fullname role')
  .populate('recipient.id', 'username fullname role')
  .populate('replyTo');
};

// Pre-save middleware for messages
messageSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.edited.isEdited = true;
    this.edited.editCount += 1;
    this.edited.lastEditedAt = new Date();
  }
  next();
});

// Create models
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  Message
};
