const { Message } = require('../models/Chat');
const Admin = require('../models/Admin');

class ChatService {
  // Get user information by ID
  static async getUserInfo(userId) {
    try {
      const user = await Admin.findById(userId).select('username fullname role isActive');
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found in Admin collection`);
      }
      
      if (!user.isActive) {
        throw new Error(`User account ${user.username} is inactive`);
      }
      
      return {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        isActive: user.isActive,
        model: 'Admin'
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Send a message
  static async sendMessage(senderId, recipientId, messageData) {
    // Prevent self-messaging (optional - remove this check if you want to allow self-messaging)
    if (senderId.toString() === recipientId.toString()) {
      throw new Error('Cannot send message to yourself');
    }
    
    // Get sender and recipient info
    const senderInfo = await this.getUserInfo(senderId);
    const recipientInfo = await this.getUserInfo(recipientId);
    
    // Create message
    const message = new Message({
      content: messageData.content,
      type: messageData.type || 'text',
      attachments: messageData.attachments || [],
      sender: {
        id: senderInfo.id,
        model: 'Admin',
        name: senderInfo.fullname || senderInfo.username,
        role: senderInfo.role
      },
      recipient: {
        id: recipientInfo.id,
        model: 'Admin',
        name: recipientInfo.fullname || recipientInfo.username,
        role: recipientInfo.role
      },
      replyTo: messageData.replyTo || null
    });
    
    await message.save();
    
    // Populate the message
    await message.populate([
      { path: 'sender.id', select: 'username fullname role' },
      { path: 'recipient.id', select: 'username fullname role' },
      { path: 'replyTo' }
    ]);
    
    return message;
  }

  // Get conversation between two users
  static async getConversation(user1Id, user2Id, page = 1, limit = 50) {
    const messages = await Message.findConversation(user1Id, user2Id, page, limit);
    const totalMessages = await Message.countDocuments({
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
    });
    
    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1,
        limit
      }
    };
  }

  // Get user's messages (all conversations)
  static async getUserMessages(userId, page = 1, limit = 50) {
    const messages = await Message.findUserMessages(userId, page, limit);
    const totalMessages = await Message.countDocuments({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      isDeleted: false
    });
    
    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1,
        limit
      }
    };
  }

  // Edit a message
  static async editMessage(messageId, userId, userRole, newContent) {
    const message = await Message.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.isDeleted) {
      throw new Error('Cannot edit deleted message');
    }
    
    if (!message.canEdit(userId, userRole)) {
      throw new Error('You are not authorized to edit this message');
    }
    
    message.content = newContent;
    message.edited.isEdited = true;
    message.edited.editCount += 1;
    message.edited.lastEditedAt = new Date();
    message.edited.lastEditedBy = userId;
    
    await message.save();
    
    await message.populate([
      { path: 'sender.id', select: 'username fullname role' },
      { path: 'recipient.id', select: 'username fullname role' },
      { path: 'replyTo' }
    ]);
    
    return message;
  }

  // Delete a message
  static async deleteMessage(messageId, userId, userRole) {
    const message = await Message.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.isDeleted) {
      throw new Error('Message already deleted');
    }
    
    if (!message.canDelete(userId, userRole)) {
      throw new Error('You are not authorized to delete this message');
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;
    
    await message.save();
    
    return message;
  }

  // Mark message as read
  static async markAsRead(messageId, userId) {
    const message = await Message.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.isDeleted) {
      throw new Error('Cannot mark deleted message as read');
    }
    
    // Check if user is recipient
    if (message.recipient.id.toString() !== userId.toString()) {
      throw new Error('You can only mark your own messages as read');
    }
    
    await message.markAsRead(userId);
    
    return message;
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    const unreadCount = await Message.countDocuments({
      'recipient.id': userId,
      isDeleted: false,
      'readBy.user': { $ne: userId }
    });
    
    return { unreadCount };
  }

  // Search messages
  static async searchMessages(userId, query, page = 1, limit = 20) {
    const searchRegex = new RegExp(query, 'i');
    
    const messages = await Message.find({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      content: searchRegex,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('sender.id', 'username fullname role')
    .populate('recipient.id', 'username fullname role')
    .populate('replyTo');
    
    const totalMessages = await Message.countDocuments({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      content: searchRegex,
      isDeleted: false
    });
    
    return {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1,
        limit
      }
    };
  }

  // Get chat statistics
  static async getChatStats(userId) {
    const totalMessages = await Message.countDocuments({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      isDeleted: false
    });
    
    const unreadCount = await Message.countDocuments({
      'recipient.id': userId,
      isDeleted: false,
      'readBy.user': { $ne: userId }
    });
    
    const sentMessages = await Message.countDocuments({
      'sender.id': userId,
      isDeleted: false
    });
    
    const receivedMessages = await Message.countDocuments({
      'recipient.id': userId,
      isDeleted: false
    });
    
    return {
      totalMessages,
      unreadMessages: unreadCount,
      sentMessages,
      receivedMessages
    };
  }
}

module.exports = ChatService;
