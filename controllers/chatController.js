const asyncHandler = require('../utils/asyncHandler');
const ResponseHelper = require('../utils/responseHelper');
const ChatService = require('../services/chatService');
const { Message } = require('../models/Chat');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, senderModel, content, type = 'text', attachments = [], recipientId, recipientModel } = req.body;
  const { role: userRole } = req.user;

  // Validate required fields
  if (!senderId || !recipientId || !content) {
    return ResponseHelper.error(res, 'Sender ID, recipient ID, and content are required', 400);
  }

  // Validate sender and recipient models
  const validSenderModels = ['Admin', 'Employee', 'Client', 'superAdmin', 'CompanyAdmin'];
  const validRecipientModels = ['Admin', 'Employee', 'Client', 'superAdmin', 'CompanyAdmin'];

  if (senderModel && !validSenderModels.includes(senderModel)) {
    return ResponseHelper.error(res, `Invalid sender model. Must be one of: ${validSenderModels.join(', ')}`, 400);
  }

  if (recipientModel && !validRecipientModels.includes(recipientModel)) {
    return ResponseHelper.error(res, `Invalid recipient model. Must be one of: ${validRecipientModels.join(', ')}`, 400);
  }

  // Only superAdmin, admin, and CompanyAdmin can send messages
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to send messages', 403);
  }

  try {
    let message;
    
    if (senderModel && recipientModel) {
      // Use explicit models
      message = await ChatService.sendMessageWithSender(senderId, senderModel, recipientId, recipientModel, {
        content,
        type,
        attachments
      });
    } else {
      // Use legacy method (auto-detect models)
      message = await ChatService.sendMessage(senderId, recipientId, {
        content,
        type,
        attachments
      });
    }

    ResponseHelper.created(res, message, 'Message sent successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return ResponseHelper.error(res, error.message, 404);
    }
    if (error.message.includes('inactive')) {
      return ResponseHelper.error(res, error.message, 400);
    }
    return ResponseHelper.error(res, `Failed to send message: ${error.message}`, 400);
  }
});

// Get conversation between two users
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { id: currentUserId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Only superAdmin, admin, and CompanyAdmin can access conversations
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access conversations', 403);
  }

  // Check if target user exists in any collection
  let targetUser = await Admin.findById(userId).select('username fullname role isActive');
  if (!targetUser) {
    targetUser = await Employee.findById(userId).select('username fullname firstName lastName role isActive');
  }
  if (!targetUser) {
    targetUser = await Client.findById(userId).select('username fullname firstName lastName role isActive');
  }
  
  if (!targetUser) {
    return ResponseHelper.error(res, 'User not found', 404);
  }

  const conversation = await ChatService.getConversation(currentUserId, userId, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, conversation, 'Conversation retrieved successfully');
});

// Get user's messages (all conversations)
const getUserMessages = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Only superAdmin, admin, and CompanyAdmin can access messages
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access messages', 403);
  }

  const messages = await ChatService.getUserMessages(userId, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, messages, 'Messages retrieved successfully');
});

// Edit a message
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const { id: userId, role: userRole } = req.user;

  if (!content) {
    return ResponseHelper.error(res, 'Content is required', 400);
  }

  const message = await ChatService.editMessage(messageId, userId, userRole, content);
  ResponseHelper.success(res, message, 'Message edited successfully');
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  const message = await ChatService.deleteMessage(messageId, userId, userRole);
  ResponseHelper.success(res, message, 'Message deleted successfully');
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId } = req.user;

  const message = await ChatService.markAsRead(messageId, userId);
  ResponseHelper.success(res, message, 'Message marked as read');
});

// Get unread count
const getUnreadCount = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Only superAdmin, admin, and CompanyAdmin can access unread count
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access unread count', 403);
  }

  const unreadCount = await ChatService.getUnreadCount(userId);
  ResponseHelper.success(res, unreadCount, 'Unread count retrieved successfully');
});

// Search messages
const searchMessages = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 20 } = req.query;
  const { id: userId, role: userRole } = req.user;

  if (!query) {
    return ResponseHelper.error(res, 'Search query is required', 400);
  }

  // Only superAdmin, admin, and CompanyAdmin can search messages
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to search messages', 403);
  }

  const results = await ChatService.searchMessages(userId, query, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, results, 'Search results retrieved successfully');
});

// Get chat statistics
const getChatStats = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Only superAdmin, admin, and CompanyAdmin can access chat statistics
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access chat statistics', 403);
  }

  const stats = await ChatService.getChatStats(userId);
  ResponseHelper.success(res, stats, 'Chat statistics retrieved successfully');
});

// Get all admin users for chat
const getAdminUsers = asyncHandler(async (req, res) => {
  const { id: currentUserId, role: userRole } = req.user;

  // Only superAdmin, admin, and CompanyAdmin can access admin users
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access admin users', 403);
  }

  const admins = await Admin.find({ 
    isActive: true,
    _id: { $ne: currentUserId } // Exclude current user
  }).select('username fullname role createdAt');

  ResponseHelper.success(res, { admins }, 'Admin users retrieved successfully');
});

// Debug endpoint to list all admins (including inactive)
const debugListAllAdmins = asyncHandler(async (req, res) => {
  const { role: userRole } = req.user;

  // Only superAdmin, admin, and CompanyAdmin can access this debug endpoint
  if (!['superAdmin', 'admin', 'CompanyAdmin'].includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access this debug endpoint', 403);
  }

  const allAdmins = await Admin.find({}).select('_id username fullname role isActive createdAt');
  
  ResponseHelper.success(res, { 
    totalAdmins: allAdmins.length,
    admins: allAdmins 
  }, 'All admin users retrieved successfully');
});

// Debug endpoint to check user existence
const debugUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Try to find user in all collections
    let user = await Admin.findById(userId).select('username fullname role isActive');
    let model = 'Admin';
    
    if (!user) {
      user = await Employee.findById(userId).select('username fullname firstName lastName role isActive');
      if (user) model = 'Employee';
    }
    
    if (!user) {
      user = await Client.findById(userId).select('username fullname firstName lastName role isActive');
      if (user) model = 'Client';
    }
    
    if (!user) {
      return ResponseHelper.error(res, 'User not found in any collection', 404);
    }
    
    const currentUser = req.user;
    
    ResponseHelper.success(res, {
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username),
        role: user.role,
        isActive: user.isActive,
        model: model
      },
      currentUser: {
        id: currentUser.id,
        model: currentUser.type || 'Admin',
        role: currentUser.role
      }
    }, 'User debug info retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 400);
  }
});

// Debug endpoint to check current user authentication
const debugAuth = asyncHandler(async (req, res) => {
  try {
    const currentUser = req.user;
    
    ResponseHelper.success(res, {
      currentUser: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        type: currentUser.type,
        isActive: currentUser.isActive,
        company: currentUser.company
      },
      tokenInfo: {
        userId: currentUser.id,
        role: currentUser.role,
        type: currentUser.type
      }
    }, 'Authentication debug info retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 400);
  }
});

module.exports = {
  sendMessage,
  getConversation,
  getUserMessages,
  editMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
  searchMessages,
  getChatStats,
  getAdminUsers,
  debugUser,
  debugAuth,
  debugListAllAdmins
};
