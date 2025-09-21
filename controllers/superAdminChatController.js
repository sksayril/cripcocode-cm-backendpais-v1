const SuperAdminChatService = require('../services/superAdminChatService');
const ResponseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

// Get valid roles for super admin chat
const getValidRoles = () => ['superAdmin', 'CompanyAdmin', 'Admin', 'manager', 'sales', 'support'];

// Send a message from super admin to any user
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, content, type = 'text', attachments = [], recipientId, recipientModel, priority = 'normal', category = 'general', isSystemMessage = false, isAnnouncement = false, isEmergency = false, visibility = 'private', scheduledAt, expiresAt, tags = [], relatedProject, relatedCompany } = req.body;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can send messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can use this chat system', 403);
  }

  // Validate required fields
  if (!senderId || !recipientId || !recipientModel || !content) {
    return ResponseHelper.error(res, 'senderId, recipientId, recipientModel, and content are required', 400);
  }

  // Validate that senderId is a valid super admin
  const senderAdmin = await Admin.findById(senderId).select('username fullname role isActive');
  if (!senderAdmin) {
    return ResponseHelper.error(res, 'Sender not found', 404);
  }

  if (senderAdmin.role !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can send messages', 403);
  }

  if (!senderAdmin.isActive) {
    return ResponseHelper.error(res, 'Sender account is deactivated', 400);
  }

  // Validate recipient model
  const validRecipientModels = ['Admin', 'Employee', 'Client', 'CompanyAdmin', 'superAdmin'];
  if (!validRecipientModels.includes(recipientModel)) {
    return ResponseHelper.error(res, `Invalid recipient model. Must be one of: ${validRecipientModels.join(', ')}`, 400);
  }

  // Validate content length
  if (content.length > 10000) {
    return ResponseHelper.error(res, 'Message content cannot exceed 10000 characters', 400);
  }

  // Validate message type
  const validTypes = ['text', 'image', 'file', 'link', 'system', 'announcement', 'command'];
  if (!validTypes.includes(type)) {
    return ResponseHelper.error(res, `Invalid message type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  // Validate priority
  const validPriorities = ['low', 'normal', 'high', 'urgent', 'critical'];
  if (!validPriorities.includes(priority)) {
    return ResponseHelper.error(res, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, 400);
  }

  // Validate category
  const validCategories = ['general', 'system', 'announcement', 'support', 'billing', 'technical', 'security', 'policy', 'maintenance', 'emergency'];
  if (!validCategories.includes(category)) {
    return ResponseHelper.error(res, `Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
  }

  // Validate visibility
  const validVisibility = ['public', 'private', 'company', 'department'];
  if (!validVisibility.includes(visibility)) {
    return ResponseHelper.error(res, `Invalid visibility. Must be one of: ${validVisibility.join(', ')}`, 400);
  }

  try {
    const message = await SuperAdminChatService.sendMessage(senderId, recipientId, recipientModel, {
      content,
      type,
      attachments,
      priority,
      category,
      isSystemMessage,
      isAnnouncement,
      isEmergency,
      visibility,
      scheduledAt,
      expiresAt,
      tags,
      relatedProject,
      relatedCompany
    });

    ResponseHelper.success(res, message, 'Message sent successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Send announcement to multiple users
const sendAnnouncement = asyncHandler(async (req, res) => {
  const { recipients, content, type = 'announcement', priority = 'high', category = 'announcement', visibility = 'public', scheduledAt, expiresAt, tags = [] } = req.body;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can send announcements
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can send announcements', 403);
  }

  // Validate required fields
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !content) {
    return ResponseHelper.error(res, 'recipients array and content are required', 400);
  }

  try {
    const messages = await SuperAdminChatService.sendAnnouncement(userId, recipients, {
      content,
      type,
      priority,
      category,
      visibility,
      scheduledAt,
      expiresAt,
      tags
    });

    ResponseHelper.success(res, { messages, count: messages.length }, 'Announcement sent successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Send system message
const sendSystemMessage = asyncHandler(async (req, res) => {
  const { senderId, content, type = 'system', attachments = [], recipientId, recipientModel, priority = 'high', category = 'system' } = req.body;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can send system messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can send system messages', 403);
  }

  // Validate required fields
  if (!senderId || !recipientId || !recipientModel || !content) {
    return ResponseHelper.error(res, 'senderId, recipientId, recipientModel, and content are required', 400);
  }

  // Validate that senderId is a valid super admin
  const senderAdmin = await Admin.findById(senderId).select('username fullname role isActive');
  if (!senderAdmin) {
    return ResponseHelper.error(res, 'Sender not found', 404);
  }

  if (senderAdmin.role !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can send system messages', 403);
  }

  if (!senderAdmin.isActive) {
    return ResponseHelper.error(res, 'Sender account is deactivated', 400);
  }

  // Validate recipient model
  const validRecipientModels = ['Admin', 'Employee', 'Client', 'CompanyAdmin', 'superAdmin'];
  if (!validRecipientModels.includes(recipientModel)) {
    return ResponseHelper.error(res, `Invalid recipient model. Must be one of: ${validRecipientModels.join(', ')}`, 400);
  }

  try {
    const message = await SuperAdminChatService.sendSystemMessage(senderId, recipientId, recipientModel, {
      content,
      type,
      priority,
      category
    });

    ResponseHelper.success(res, message, 'System message sent successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get conversation between super admin and recipient
const getConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.params;
  const { id: userId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Only super admin can access conversations
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access conversations', 403);
  }

  // Check if recipient exists
  const recipient = await Admin.findById(recipientId).select('username fullname role isActive') ||
                   await Employee.findById(recipientId).select('username firstName lastName role isActive') ||
                   await Client.findById(recipientId).select('firstName lastName role isActive');
  
  if (!recipient) {
    return ResponseHelper.error(res, 'Recipient not found', 404);
  }

  try {
    const conversation = await SuperAdminChatService.getConversation(userId, recipientId, parseInt(page), parseInt(limit));
    ResponseHelper.success(res, conversation, 'Conversation retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get super admin's messages (all conversations)
const getSuperAdminMessages = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Only super admin can access messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access messages', 403);
  }

  try {
    const messages = await SuperAdminChatService.getSuperAdminMessages(userId, parseInt(page), parseInt(limit));
    ResponseHelper.success(res, messages, 'Messages retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get system messages
const getSystemMessages = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Only super admin can access system messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access system messages', 403);
  }

  try {
    const messages = await SuperAdminChatService.getSystemMessages(parseInt(page), parseInt(limit));
    ResponseHelper.success(res, messages, 'System messages retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get announcements
const getAnnouncements = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Only super admin can access announcements
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access announcements', 403);
  }

  try {
    const messages = await SuperAdminChatService.getAnnouncements(parseInt(page), parseInt(limit));
    ResponseHelper.success(res, messages, 'Announcements retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can mark messages as read
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can mark messages as read', 403);
  }

  try {
    const message = await SuperAdminChatService.markAsRead(messageId, userId, 'Admin');
    ResponseHelper.success(res, message, 'Message marked as read');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get unread message count
const getUnreadCount = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Only super admin can access unread count
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access unread count', 403);
  }

  try {
    const count = await SuperAdminChatService.getUnreadCount(userId);
    ResponseHelper.success(res, { unreadCount: count }, 'Unread count retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Edit message
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can edit messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can edit messages', 403);
  }

  if (!content) {
    return ResponseHelper.error(res, 'Content is required', 400);
  }

  try {
    const message = await SuperAdminChatService.editMessage(messageId, userId, userRole, content);
    ResponseHelper.success(res, message, 'Message edited successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Delete message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can delete messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can delete messages', 403);
  }

  try {
    const message = await SuperAdminChatService.deleteMessage(messageId, userId, userRole);
    ResponseHelper.success(res, message, 'Message deleted successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Restore message
const restoreMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can restore messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can restore messages', 403);
  }

  try {
    const message = await SuperAdminChatService.restoreMessage(messageId, userId, userRole);
    ResponseHelper.success(res, message, 'Message restored successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Search messages
const searchMessages = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { q: query, page = 1, limit = 20 } = req.query;

  // Only super admin can search messages
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can search messages', 403);
  }

  if (!query) {
    return ResponseHelper.error(res, 'Search query is required', 400);
  }

  try {
    const results = await SuperAdminChatService.searchMessages(userId, query, parseInt(page), parseInt(limit));
    ResponseHelper.success(res, results, 'Search results retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get chat statistics
const getChatStats = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Only super admin can access chat statistics
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access chat statistics', 403);
  }

  try {
    const stats = await SuperAdminChatService.getChatStats(userId);
    ResponseHelper.success(res, stats, 'Chat statistics retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get available recipients
const getAvailableRecipients = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Only super admin can access available recipients
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access available recipients', 403);
  }

  try {
    const recipients = await SuperAdminChatService.getAvailableRecipients();
    ResponseHelper.success(res, recipients, 'Available recipients retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get message by ID
const getMessageById = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can access message details
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access message details', 403);
  }

  try {
    const SuperAdminChat = require('../models/SuperAdminChat');
    const message = await SuperAdminChat.findById(messageId)
      .populate('sender.id', 'username fullname role')
      .populate('recipient.id', 'username fullname firstName lastName role');

    if (!message) {
      return ResponseHelper.error(res, 'Message not found', 404);
    }

    ResponseHelper.success(res, message, 'Message retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get audit trail for a message
const getMessageAuditTrail = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can access audit trail
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access audit trail', 403);
  }

  try {
    const SuperAdminChat = require('../models/SuperAdminChat');
    const message = await SuperAdminChat.findById(messageId)
      .populate('auditTrail.performedBy', 'username fullname role');

    if (!message) {
      return ResponseHelper.error(res, 'Message not found', 404);
    }

    ResponseHelper.success(res, { auditTrail: message.auditTrail }, 'Audit trail retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Debug endpoint to check super admin info
const debugSuperAdmin = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  try {
    const superAdmin = await Admin.findById(userId).select('username fullname role isActive company');
    
    // Get all super admin users
    const allSuperAdmins = await Admin.find({ role: 'superAdmin' }).select('_id username fullname role isActive');
    
    ResponseHelper.success(res, {
      user: {
        id: userId,
        role: userRole,
        isSuperAdmin: userRole === 'superAdmin',
        adminInfo: superAdmin
      },
      allSuperAdmins: allSuperAdmins
    }, 'Super admin debug info retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Debug endpoint to check specific sender ID
const debugSender = asyncHandler(async (req, res) => {
  const { senderId } = req.params;
  const { id: userId, role: userRole } = req.user;

  // Only super admin can access debug info
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only super admin can access debug info', 403);
  }

  try {
    const sender = await Admin.findById(senderId).select('username fullname role isActive company');
    
    ResponseHelper.success(res, {
      requestedSenderId: senderId,
      sender: sender,
      exists: !!sender,
      isSuperAdmin: sender && sender.role === 'superAdmin',
      isActive: sender && sender.isActive
    }, 'Sender debug info retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Debug endpoint to check JWT token and authentication
const debugAuth = asyncHandler(async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return ResponseHelper.error(res, 'No token provided', 401);
    }

    // Decode JWT without verification to see what's inside
    const jwt = require('jsonwebtoken');
    const config = require('../env');
    
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (jwtError) {
      return ResponseHelper.error(res, `JWT verification failed: ${jwtError.message}`, 401);
    }

    // Try to find the user in both Admin and User collections
    const Admin = require('../models/Admin');
    const User = require('../models/User');
    
    const admin = await Admin.findById(decoded.userId).select('username fullname role isActive company');
    const user = await User.findById(decoded.userId).select('username email role isActive');
    
    // Get all super admin users
    const allSuperAdmins = await Admin.find({ role: 'superAdmin' }).select('_id username fullname role isActive');
    
    ResponseHelper.success(res, {
      tokenInfo: {
        decoded: decoded,
        userId: decoded.userId,
        role: decoded.role
      },
      userLookup: {
        admin: admin,
        user: user,
        foundInAdmin: !!admin,
        foundInUser: !!user,
        isActive: (admin && admin.isActive) || (user && user.isActive)
      },
      allSuperAdmins: allSuperAdmins,
      recommendations: {
        useThisSenderId: admin ? admin._id : (allSuperAdmins.length > 0 ? allSuperAdmins[0]._id : null),
        validSenderIds: allSuperAdmins.map(sa => sa._id)
      }
    }, 'Authentication debug info retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

module.exports = {
  sendMessage,
  sendAnnouncement,
  sendSystemMessage,
  getConversation,
  getSuperAdminMessages,
  getSystemMessages,
  getAnnouncements,
  markAsRead,
  getUnreadCount,
  editMessage,
  deleteMessage,
  restoreMessage,
  searchMessages,
  getChatStats,
  getAvailableRecipients,
  getMessageById,
  getMessageAuditTrail,
  debugSuperAdmin,
  debugSender,
  debugAuth
};
