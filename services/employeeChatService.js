const EmployeeMessage = require('../models/EmployeeChat');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

class EmployeeChatService {
  // Get user information by ID and model
  static async getUserInfo(userId, model) {
    try {
      let user;
      
      if (model === 'Admin' || model === 'CompanyAdmin' || model === 'superAdmin') {
        user = await Admin.findById(userId).select('username fullname role isActive');
      } else if (model === 'Employee') {
        user = await Employee.findById(userId).select('username fullname role isActive');
      } else if (model === 'Client') {
        user = await Client.findById(userId).select('firstName lastName email role isActive');
      } else {
        throw new Error(`Invalid model: ${model}`);
      }
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found in ${model} collection`);
      }
      
      if (!user.isActive) {
        throw new Error(`User account ${user.username} is inactive`);
      }
      
      return {
        id: user._id,
        username: user.username || user.email,
        fullname: user.fullname || `${user.firstName} ${user.lastName}`,
        role: user.role,
        isActive: user.isActive,
        model: model
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Send a message
  static async sendMessage(senderId, senderModel, recipientId, recipientModel, messageData) {
    // Prevent self-messaging
    if (senderId.toString() === recipientId.toString() && senderModel === recipientModel) {
      throw new Error('Cannot send message to yourself');
    }
    
    // Get sender and recipient info
    const senderInfo = await this.getUserInfo(senderId, senderModel);
    const recipientInfo = await this.getUserInfo(recipientId, recipientModel);
    
    // Create message
    const message = new EmployeeMessage({
      content: messageData.content,
      type: messageData.type || 'text',
      attachments: messageData.attachments || [],
      sender: {
        id: senderInfo.id,
        model: senderModel,
        name: senderInfo.fullname || senderInfo.username,
        role: senderInfo.role
      },
      recipient: {
        id: recipientInfo.id,
        model: recipientModel,
        name: recipientInfo.fullname || recipientInfo.username,
        role: recipientInfo.role
      }
    });

    await message.save();
    return message;
  }

  // Get conversation between two users
  static async getConversation(user1Id, user2Id, page = 1, limit = 50) {
    const messages = await EmployeeMessage.getConversation(user1Id, user2Id, page, limit);
    const totalMessages = await EmployeeMessage.countDocuments({
      $or: [
        { 'sender.id': user1Id, 'recipient.id': user2Id },
        { 'sender.id': user2Id, 'recipient.id': user1Id }
      ],
      'deleted.isDeleted': false
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
    const messages = await EmployeeMessage.getUserMessages(userId, page, limit);
    const totalMessages = await EmployeeMessage.countDocuments({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      'deleted.isDeleted': false
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
  static async editMessage(messageId, userId, userRole, content) {
    const message = await EmployeeMessage.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.deleted.isDeleted) {
      throw new Error('Cannot edit deleted message');
    }

    if (!message.canEdit(userId, userRole)) {
      throw new Error('You are not authorized to edit this message');
    }

    message.content = content;
    message.edited.isEdited = true;
    message.edited.editCount += 1;
    message.edited.lastEditedAt = new Date();
    message.edited.lastEditedBy = userId;

    await message.save();
    return message;
  }

  // Delete a message
  static async deleteMessage(messageId, userId, userRole) {
    const message = await EmployeeMessage.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.deleted.isDeleted) {
      throw new Error('Message already deleted');
    }

    if (!message.canDelete(userId, userRole)) {
      throw new Error('You are not authorized to delete this message');
    }

    message.deleted.isDeleted = true;
    message.deleted.deletedAt = new Date();
    message.deleted.deletedBy = userId;

    await message.save();
    return message;
  }

  // Mark message as read
  static async markAsRead(messageId, userId) {
    const message = await EmployeeMessage.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.deleted.isDeleted) {
      throw new Error('Cannot mark deleted message as read');
    }

    // Check if already read by this user
    const alreadyRead = message.readBy.some(read => read.user.toString() === userId.toString());
    
    if (!alreadyRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      // Update status to read if recipient read it
      if (message.recipient.id.toString() === userId.toString()) {
        message.status = 'read';
      }
      
      await message.save();
    }

    return message;
  }

  // Get unread count
  static async getUnreadCount(userId) {
    return await EmployeeMessage.getUnreadCount(userId);
  }

  // Search messages
  static async searchMessages(userId, query, page = 1, limit = 20) {
    const messages = await EmployeeMessage.searchMessages(userId, query, page, limit);
    
    // Create a regex pattern for case-insensitive search (same as in model)
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    const totalMessages = await EmployeeMessage.countDocuments({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      'deleted.isDeleted': false,
      content: searchRegex
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
    const totalMessages = await EmployeeMessage.countDocuments({
      $or: [
        { 'sender.id': userId },
        { 'recipient.id': userId }
      ],
      'deleted.isDeleted': false
    });

    const sentMessages = await EmployeeMessage.countDocuments({
      'sender.id': userId,
      'deleted.isDeleted': false
    });

    const receivedMessages = await EmployeeMessage.countDocuments({
      'recipient.id': userId,
      'deleted.isDeleted': false
    });

    const unreadMessages = await this.getUnreadCount(userId);

    return {
      totalMessages,
      sentMessages,
      receivedMessages,
      unreadMessages
    };
  }

  // Get available users for chat (Admin, Employee, and Client users)
  static async getAvailableUsers(userId, userRole) {
    const users = [];
    
    // Get Admin users
    const admins = await Admin.find({ isActive: true }, '_id username fullname role');
    admins.forEach(admin => {
      if (admin._id.toString() !== userId.toString()) {
        users.push({
          id: admin._id,
          username: admin.username,
          fullname: admin.fullname,
          role: admin.role,
          model: 'Admin'
        });
      }
    });
    
    // Get Employee users
    const employees = await Employee.find({ isActive: true }, '_id username fullname role');
    employees.forEach(employee => {
      if (employee._id.toString() !== userId.toString()) {
        users.push({
          id: employee._id,
          username: employee.username,
          fullname: employee.fullname,
          role: employee.role,
          model: 'Employee'
        });
      }
    });
    
    // Get Client users
    const clients = await Client.find({ isActive: true }, '_id firstName lastName email role');
    clients.forEach(client => {
      if (client._id.toString() !== userId.toString()) {
        users.push({
          id: client._id,
          username: client.email,
          fullname: `${client.firstName} ${client.lastName}`,
          role: client.role,
          model: 'Client'
        });
      }
    });
    
    return users;
  }
}

module.exports = EmployeeChatService;
