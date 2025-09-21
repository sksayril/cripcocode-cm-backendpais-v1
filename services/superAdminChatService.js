const SuperAdminChat = require('../models/SuperAdminChat');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');
const Company = require('../models/Company');

class SuperAdminChatService {
  // Get user information by ID and model
  static async getUserInfo(userId, model) {
    try {
      let user;
      
      if (model === 'Admin' || model === 'CompanyAdmin' || model === 'superAdmin') {
        user = await Admin.findById(userId).select('username fullname role isActive company');
        if (user) {
          return {
            id: user._id,
            name: user.fullname,
            role: user.role,
            company: user.company,
            isActive: user.isActive
          };
        }
      } else if (model === 'Employee') {
        user = await Employee.findById(userId).select('username firstName lastName role isActive company');
        if (user) {
          return {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            company: user.company,
            isActive: user.isActive
          };
        }
      } else if (model === 'Client') {
        user = await Client.findById(userId).select('firstName lastName role isActive company');
        if (user) {
          return {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            company: user.company,
            isActive: user.isActive
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error(`Failed to get user information: ${error.message}`);
    }
  }

  // Send a message from super admin to any user
  static async sendMessage(senderId, recipientId, recipientModel, messageData) {
    try {
      // Get sender (super admin) information
      const sender = await Admin.findById(senderId).select('username fullname role isActive company');
      if (!sender) {
        throw new Error('Super admin not found');
      }

      if (sender.role !== 'superAdmin') {
        throw new Error('Only super admin can use this service');
      }

      if (!sender.isActive) {
        throw new Error('Super admin account is deactivated');
      }

      // Get recipient information
      const recipientInfo = await this.getUserInfo(recipientId, recipientModel);
      if (!recipientInfo) {
        throw new Error(`${recipientModel} not found`);
      }

      if (!recipientInfo.isActive) {
        throw new Error(`${recipientModel} account is deactivated`);
      }

      // Create message
      const message = new SuperAdminChat({
        sender: {
          id: senderId,
          model: 'Admin',
          name: sender.fullname,
          role: sender.role,
          company: sender.company
        },
        recipient: {
          id: recipientId,
          model: recipientModel,
          name: recipientInfo.name,
          role: recipientInfo.role,
          company: recipientInfo.company
        },
        content: messageData.content,
        type: messageData.type || 'text',
        attachments: messageData.attachments || [],
        priority: messageData.priority || 'normal',
        category: messageData.category || 'general',
        isSystemMessage: messageData.isSystemMessage || false,
        isAnnouncement: messageData.isAnnouncement || false,
        isEmergency: messageData.isEmergency || false,
        visibility: messageData.visibility || 'private',
        scheduledAt: messageData.scheduledAt,
        expiresAt: messageData.expiresAt,
        tags: messageData.tags || [],
        relatedProject: messageData.relatedProject,
        relatedCompany: messageData.relatedCompany
      });

      await message.save();
      return message;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Send announcement to multiple users
  static async sendAnnouncement(senderId, recipients, messageData) {
    try {
      const messages = [];
      
      for (const recipient of recipients) {
        const message = await this.sendMessage(
          senderId,
          recipient.id,
          recipient.model,
          {
            ...messageData,
            isAnnouncement: true,
            category: messageData.category || 'announcement'
          }
        );
        messages.push(message);
      }
      
      return messages;
    } catch (error) {
      throw new Error(`Failed to send announcement: ${error.message}`);
    }
  }

  // Send system message
  static async sendSystemMessage(senderId, recipientId, recipientModel, messageData) {
    try {
      const message = await this.sendMessage(senderId, recipientId, recipientModel, {
        ...messageData,
        isSystemMessage: true,
        category: messageData.category || 'system'
      });
      
      return message;
    } catch (error) {
      throw new Error(`Failed to send system message: ${error.message}`);
    }
  }

  // Get conversation between super admin and recipient
  static async getConversation(senderId, recipientId, page = 1, limit = 50) {
    try {
      const messages = await SuperAdminChat.getConversation(senderId, recipientId, page, limit);
      const totalMessages = await SuperAdminChat.countDocuments({
        $or: [
          { 'sender.id': senderId, 'recipient.id': recipientId },
          { 'sender.id': recipientId, 'recipient.id': senderId }
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
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }
  }

  // Get super admin's messages (all conversations)
  static async getSuperAdminMessages(senderId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const messages = await SuperAdminChat.find({
        $or: [
          { 'sender.id': senderId },
          { 'recipient.id': senderId }
        ],
        'deleted.isDeleted': false
      })
      .populate('sender.id', 'username fullname role')
      .populate('recipient.id', 'username fullname firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const totalMessages = await SuperAdminChat.countDocuments({
        $or: [
          { 'sender.id': senderId },
          { 'recipient.id': senderId }
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
    } catch (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  // Get system messages
  static async getSystemMessages(page = 1, limit = 50) {
    try {
      const messages = await SuperAdminChat.getSystemMessages(page, limit);
      const totalMessages = await SuperAdminChat.countDocuments({
        isSystemMessage: true,
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
    } catch (error) {
      throw new Error(`Failed to get system messages: ${error.message}`);
    }
  }

  // Get announcements
  static async getAnnouncements(page = 1, limit = 50) {
    try {
      const messages = await SuperAdminChat.getAnnouncements(page, limit);
      const totalMessages = await SuperAdminChat.countDocuments({
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
    } catch (error) {
      throw new Error(`Failed to get announcements: ${error.message}`);
    }
  }

  // Mark message as read
  static async markAsRead(messageId, userId, userModel) {
    try {
      const message = await SuperAdminChat.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      await message.markAsRead(userId, userModel);
      return message;
    } catch (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`);
    }
  }

  // Get unread count
  static async getUnreadCount(recipientId) {
    try {
      return await SuperAdminChat.getUnreadCount(recipientId);
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  // Edit message
  static async editMessage(messageId, userId, userRole, newContent) {
    try {
      const message = await SuperAdminChat.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Only super admin can edit messages
      if (userRole !== 'superAdmin') {
        throw new Error('Only super admin can edit messages');
      }

      // Store edit history
      if (message.edited.editHistory.length >= 10) {
        message.edited.editHistory.shift(); // Remove oldest edit
      }

      message.edited.editHistory.push({
        content: message.content,
        editedAt: new Date(),
        editedBy: userId
      });

      message.content = newContent;
      message.edited.isEdited = true;
      message.edited.editCount += 1;
      message.edited.lastEditedAt = new Date();
      message.edited.lastEditedBy = userId;

      await message.addAuditEntry('edited', userId, 'Message content updated');
      await message.save();

      return message;
    } catch (error) {
      throw new Error(`Failed to edit message: ${error.message}`);
    }
  }

  // Delete message
  static async deleteMessage(messageId, userId, userRole) {
    try {
      const message = await SuperAdminChat.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Only super admin can delete messages
      if (userRole !== 'superAdmin') {
        throw new Error('Only super admin can delete messages');
      }

      message.deleted.isDeleted = true;
      message.deleted.deletedAt = new Date();
      message.deleted.deletedBy = userId;
      message.deleted.deleteReason = 'Deleted by super admin';

      await message.addAuditEntry('deleted', userId, 'Message deleted');
      await message.save();

      return message;
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  // Restore message
  static async restoreMessage(messageId, userId, userRole) {
    try {
      const message = await SuperAdminChat.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Only super admin can restore messages
      if (userRole !== 'superAdmin') {
        throw new Error('Only super admin can restore messages');
      }

      message.deleted.isDeleted = false;
      message.deleted.deletedAt = undefined;
      message.deleted.deletedBy = undefined;
      message.deleted.deleteReason = undefined;

      await message.addAuditEntry('restored', userId, 'Message restored');
      await message.save();

      return message;
    } catch (error) {
      throw new Error(`Failed to restore message: ${error.message}`);
    }
  }

  // Search messages
  static async searchMessages(senderId, query, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const messages = await SuperAdminChat.find({
        $or: [
          { 'sender.id': senderId },
          { 'recipient.id': senderId }
        ],
        'deleted.isDeleted': false,
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .populate('sender.id', 'username fullname role')
      .populate('recipient.id', 'username fullname firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const totalMessages = await SuperAdminChat.countDocuments({
        $or: [
          { 'sender.id': senderId },
          { 'recipient.id': senderId }
        ],
        'deleted.isDeleted': false,
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
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
    } catch (error) {
      throw new Error(`Failed to search messages: ${error.message}`);
    }
  }

  // Get chat statistics
  static async getChatStats(senderId) {
    try {
      const totalMessages = await SuperAdminChat.countDocuments({
        'sender.id': senderId,
        'deleted.isDeleted': false
      });

      const receivedMessages = await SuperAdminChat.countDocuments({
        'recipient.id': senderId,
        'deleted.isDeleted': false
      });

      const systemMessages = await SuperAdminChat.countDocuments({
        'sender.id': senderId,
        isSystemMessage: true,
        'deleted.isDeleted': false
      });

      const announcements = await SuperAdminChat.countDocuments({
        'sender.id': senderId,
        isAnnouncement: true,
        'deleted.isDeleted': false
      });

      const unreadCount = await SuperAdminChat.getUnreadCount(senderId);

      // Get message distribution by recipient type
      const recipientStats = await SuperAdminChat.aggregate([
        { $match: { 'sender.id': senderId, 'deleted.isDeleted': false } },
        { $group: { _id: '$recipient.model', count: { $sum: 1 } } }
      ]);

      // Get message distribution by category
      const categoryStats = await SuperAdminChat.aggregate([
        { $match: { 'sender.id': senderId, 'deleted.isDeleted': false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      return {
        totalMessages,
        receivedMessages,
        systemMessages,
        announcements,
        unreadCount,
        recipientDistribution: recipientStats,
        categoryDistribution: categoryStats
      };
    } catch (error) {
      throw new Error(`Failed to get chat statistics: ${error.message}`);
    }
  }

  // Get available recipients for super admin
  static async getAvailableRecipients() {
    try {
      const [admins, employees, clients] = await Promise.all([
        Admin.find({ isActive: true }).select('username fullname role company'),
        Employee.find({ isActive: true }).select('username firstName lastName role company'),
        Client.find({ isActive: true }).select('firstName lastName role company')
      ]);

      // Categorize admins by their roles
      const superAdmins = admins.filter(admin => admin.role === 'superAdmin');
      const companyAdmins = admins.filter(admin => admin.role === 'CompanyAdmin');
      const regularAdmins = admins.filter(admin => admin.role === 'admin');

      return {
        superAdmins: superAdmins.map(admin => ({
          id: admin._id,
          name: admin.fullname,
          role: admin.role,
          model: 'superAdmin',
          company: admin.company
        })),
        companyAdmins: companyAdmins.map(admin => ({
          id: admin._id,
          name: admin.fullname,
          role: admin.role,
          model: 'CompanyAdmin',
          company: admin.company
        })),
        admins: regularAdmins.map(admin => ({
          id: admin._id,
          name: admin.fullname,
          role: admin.role,
          model: 'Admin',
          company: admin.company
        })),
        employees: employees.map(employee => ({
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role,
          model: 'Employee',
          company: employee.company
        })),
        clients: clients.map(client => ({
          id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          role: client.role,
          model: 'Client',
          company: client.company
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get available recipients: ${error.message}`);
    }
  }
}

module.exports = SuperAdminChatService;
