const ClientMessage = require('../models/ClientChat');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

class ClientChatService {
  // Get user information by ID and model
  static async getUserInfo(userId, model) {
    try {
      let user;
      if (model === 'Admin' || model === 'CompanyAdmin' || model === 'superAdmin') {
        user = await Admin.findById(userId).select('username fullname role isActive');
      } else if (model === 'Employee') {
        user = await Employee.findById(userId).select('username firstName lastName role isActive');
      } else if (model === 'Client') {
        user = await Client.findById(userId).select('firstName lastName email role isActive');
      } else {
        throw new Error(`Invalid model: ${model}`);
      }

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      return {
        id: user._id,
        username: user.username || user.email,
        fullname: user.fullname || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email,
        role: user.role,
        isActive: user.isActive,
        model: model
      };
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  // Send a message from client to admin/employee
  static async sendMessage(clientId, recipientId, recipientModel, messageData) {
    try {
      // Get client information
      const client = await Client.findById(clientId).select('firstName lastName email role isActive company');
      if (!client) {
        throw new Error('Client not found');
      }

      if (!client.isActive) {
        throw new Error('Client account is deactivated');
      }

      // Get recipient information
      const recipientInfo = await this.getUserInfo(recipientId, recipientModel);

      // Create message
      const message = new ClientMessage({
        sender: {
          id: clientId,
          model: 'Client',
          name: `${client.firstName} ${client.lastName}`,
          role: client.role
        },
        recipient: {
          id: recipientId,
          model: recipientModel,
          name: recipientInfo.fullname,
          role: recipientInfo.role
        },
        content: messageData.content,
        type: messageData.type || 'text',
        attachments: messageData.attachments || [],
        priority: messageData.priority || 'normal',
        category: messageData.category || 'general',
        company: client.company
      });

      await message.save();
      return message;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Send a message from superAdmin to client
  static async sendMessageToClient(superAdminId, clientId, messageData) {
    try {
      // Get superAdmin information
      const superAdmin = await Admin.findById(superAdminId).select('username fullname role isActive');
      if (!superAdmin) {
        throw new Error('SuperAdmin not found');
      }

      if (!superAdmin.isActive) {
        throw new Error('SuperAdmin account is deactivated');
      }

      // Get client information
      const client = await Client.findById(clientId).select('firstName lastName email role isActive company');
      if (!client) {
        throw new Error('Client not found');
      }

      if (!client.isActive) {
        throw new Error('Client account is deactivated');
      }

      // Create message (sender is superAdmin, recipient is client)
      const message = new ClientMessage({
        sender: {
          id: superAdminId,
          model: 'Admin',
          name: superAdmin.fullname,
          role: superAdmin.role
        },
        recipient: {
          id: clientId,
          model: 'Client',
          name: `${client.firstName} ${client.lastName}`,
          role: client.role
        },
        content: messageData.content,
        type: messageData.type || 'text',
        attachments: messageData.attachments || [],
        priority: messageData.priority || 'normal',
        category: messageData.category || 'general',
        company: client.company
      });

      await message.save();
      return message;
    } catch (error) {
      throw new Error(`Failed to send message to client: ${error.message}`);
    }
  }

  // Send a message with sender and recipient information
  static async sendMessageWithSender(senderId, senderModel, recipientId, recipientModel, messageData) {
    try {
      // Get sender information
      const senderInfo = await this.getUserInfo(senderId, senderModel);
      
      // Get recipient information
      const recipientInfo = await this.getUserInfo(recipientId, recipientModel);

      // Get company information if sender is a client
      let company = null;
      if (senderModel === 'Client') {
        const client = await Client.findById(senderId).select('company');
        company = client?.company;
      } else if (recipientModel === 'Client') {
        const client = await Client.findById(recipientId).select('company');
        company = client?.company;
      }

      // Create message
      const message = new ClientMessage({
        sender: {
          id: senderId,
          model: senderModel,
          name: senderInfo.fullname,
          role: senderInfo.role
        },
        recipient: {
          id: recipientId,
          model: recipientModel,
          name: recipientInfo.fullname,
          role: recipientInfo.role
        },
        content: messageData.content,
        type: messageData.type || 'text',
        attachments: messageData.attachments || [],
        priority: messageData.priority || 'normal',
        category: messageData.category || 'general',
        company: company
      });

      await message.save();
      return message;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get conversation between client and recipient
  static async getConversation(clientId, recipientId, page = 1, limit = 50) {
    const messages = await ClientMessage.getConversation(clientId, recipientId, page, limit);
    const totalMessages = await ClientMessage.countDocuments({
      $or: [
        { 'sender.id': clientId, 'recipient.id': recipientId },
        { 'sender.id': recipientId, 'recipient.id': clientId }
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

  // Get client's messages (all conversations)
  static async getClientMessages(clientId, page = 1, limit = 50) {
    const messages = await ClientMessage.getClientMessages(clientId, page, limit);
    const totalMessages = await ClientMessage.countDocuments({
      'sender.id': clientId,
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

  // Get messages for admin/employee (messages sent to them)
  static async getRecipientMessages(recipientId, page = 1, limit = 50) {
    const messages = await ClientMessage.getRecipientMessages(recipientId, page, limit);
    const totalMessages = await ClientMessage.countDocuments({
      'recipient.id': recipientId,
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
    const message = await ClientMessage.findById(messageId);
    
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
    const message = await ClientMessage.findById(messageId);
    
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
    const message = await ClientMessage.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if already read by this user
    const alreadyRead = message.readBy.some(read => read.user.toString() === userId.toString());
    
    if (!alreadyRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      // Update status to read if it's the recipient
      if (message.recipient.id.toString() === userId.toString()) {
        message.status = 'read';
      }
      
      await message.save();
    }

    return message;
  }

  // Get unread message count
  static async getUnreadCount(recipientId) {
    return await ClientMessage.getUnreadCount(recipientId);
  }

  // Search messages
  static async searchMessages(clientId, query, page = 1, limit = 20) {
    const messages = await ClientMessage.searchMessages(clientId, query, page, limit);
    
    // Create a regex pattern for case-insensitive search (same as in model)
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    const totalMessages = await ClientMessage.countDocuments({
      'sender.id': clientId,
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
  static async getChatStats(clientId) {
    const stats = await ClientMessage.getChatStats(clientId);
    return stats[0] || {
      totalMessages: 0,
      unreadMessages: 0,
      categories: []
    };
  }

  // Get available recipients for client
  static async getAvailableRecipients(clientId) {
    const recipients = [];
    
    // Get all active admins
    const admins = await Admin.find({ isActive: true }, '_id username fullname role');
    admins.forEach(admin => {
      recipients.push({
        id: admin._id,
        username: admin.username,
        fullname: admin.fullname,
        role: admin.role,
        model: 'Admin'
      });
    });

    // Get all active employees
    const employees = await Employee.find({ isActive: true }, '_id username fullname role');
    employees.forEach(employee => {
      recipients.push({
        id: employee._id,
        username: employee.username,
        fullname: employee.fullname,
        role: employee.role,
        model: 'Employee'
      });
    });

    return recipients;
  }

  // Get client's conversation list (unique recipients)
  static async getConversationList(clientId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const conversations = await ClientMessage.aggregate([
      {
        $match: {
          'sender.id': require('mongoose').Types.ObjectId(clientId),
          'deleted.isDeleted': false
        }
      },
      {
        $group: {
          _id: '$recipient.id',
          recipient: { $first: '$recipient' },
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'sent'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    const totalConversations = await ClientMessage.aggregate([
      {
        $match: {
          'sender.id': require('mongoose').Types.ObjectId(clientId),
          'deleted.isDeleted': false
        }
      },
      {
        $group: {
          _id: '$recipient.id'
        }
      },
      {
        $count: 'total'
      }
    ]);

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((totalConversations[0]?.total || 0) / limit),
        totalConversations: totalConversations[0]?.total || 0,
        hasNextPage: page < Math.ceil((totalConversations[0]?.total || 0) / limit),
        hasPrevPage: page > 1,
        limit
      }
    };
  }
}

module.exports = ClientChatService;
