const asyncHandler = require('../utils/asyncHandler');
const ResponseHelper = require('../utils/responseHelper');
const ClientChatService = require('../services/clientChatService');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

// Helper function to get valid roles for client chat
const getValidRoles = () => [
  'superAdmin', 'admin', 'CompanyAdmin',
  'employee', // Generic employee role (kept for backward compatibility)
  'junior', 'senior', 'lead', 'manager', 'director', 'designer', 'developer', 'analyst', 'specialist', 'coordinator', 'assistant', 'consultant', 'other', // Employee model roles
  'client', 'premium-client', 'enterprise-client' // Client model roles
];

// Send a message from client to admin/employee
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, senderModel, recipientId, recipientModel, content, type = 'text', attachments = [], priority = 'normal', category = 'general' } = req.body;
  const { id: userId, role: userRole } = req.user;

  // Validate required fields
  if (!senderId || !senderModel || !recipientId || !recipientModel || !content) {
    return ResponseHelper.error(res, 'senderId, senderModel, recipientId, recipientModel, and content are required', 400);
  }

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to send messages', 403);
  }

  // Validate sender model
  const validSenderModels = ['Client', 'Admin', 'Employee', 'superAdmin', 'CompanyAdmin'];
  if (!validSenderModels.includes(senderModel)) {
    return ResponseHelper.error(res, `Invalid sender model. Must be one of: ${validSenderModels.join(', ')}`, 400);
  }

  // Validate recipient model
  const validRecipientModels = ['Admin', 'Employee', 'superAdmin', 'CompanyAdmin', 'Client'];
  if (!validRecipientModels.includes(recipientModel)) {
    return ResponseHelper.error(res, `Invalid recipient model. Must be one of: ${validRecipientModels.join(', ')}`, 400);
  }

  // Check if sender exists and is active
  let sender;
  if (senderModel === 'Client') {
    sender = await Client.findById(senderId).select('firstName lastName email role isActive company');
  } else if (senderModel === 'Admin' || senderModel === 'superAdmin' || senderModel === 'CompanyAdmin') {
    sender = await Admin.findById(senderId).select('username fullname role isActive');
  } else if (senderModel === 'Employee') {
    sender = await Employee.findById(senderId).select('username firstName lastName role isActive');
  }

  if (!sender) {
    return ResponseHelper.error(res, `Sender not found. Please check the senderId and senderModel.`, 404);
  }

  if (!sender.isActive) {
    return ResponseHelper.error(res, 'Sender account is deactivated', 400);
  }

  // Check if recipient exists
  let recipient;
  if (recipientModel === 'Admin' || recipientModel === 'superAdmin' || recipientModel === 'CompanyAdmin') {
    recipient = await Admin.findById(recipientId).select('username fullname role isActive');
  } else if (recipientModel === 'Employee') {
    recipient = await Employee.findById(recipientId).select('username fullname role isActive');
  } else if (recipientModel === 'Client') {
    recipient = await Client.findById(recipientId).select('firstName lastName email role isActive company');
  }

  if (!recipient) {
    return ResponseHelper.error(res, `Recipient not found. Please check the recipientId and recipientModel.`, 404);
  }

  if (!recipient.isActive) {
    return ResponseHelper.error(res, 'Recipient account is deactivated', 400);
  }

  // Validate content length
  if (content.length > 5000) {
    return ResponseHelper.error(res, 'Message content cannot exceed 5000 characters', 400);
  }

  // Validate message type
  const validTypes = ['text', 'image', 'file', 'link'];
  if (!validTypes.includes(type)) {
    return ResponseHelper.error(res, `Invalid message type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  // Validate priority
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return ResponseHelper.error(res, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, 400);
  }

  // Validate category
  const validCategories = ['general', 'support', 'billing', 'technical', 'feature-request', 'complaint', 'other'];
  if (!validCategories.includes(category)) {
    return ResponseHelper.error(res, `Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
  }

  try {
    // Normalize recipientModel: superAdmin and CompanyAdmin should be treated as Admin for the service
    const normalizedRecipientModel = (recipientModel === 'superAdmin' || recipientModel === 'CompanyAdmin') ? 'Admin' : recipientModel;
    
    const message = await ClientChatService.sendMessageWithSender(senderId, senderModel, recipientId, normalizedRecipientModel, {
      content,
      type,
      attachments,
      priority,
      category
    });

    ResponseHelper.success(res, message, 'Message sent successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Send a message from superAdmin to client
const sendMessageToClient = asyncHandler(async (req, res) => {
  const { clientId, content, type = 'text', attachments = [], priority = 'normal', category = 'general' } = req.body;
  const { id: userId, role: userRole } = req.user;

  // Only superAdmin can send messages to clients
  if (userRole !== 'superAdmin') {
    return ResponseHelper.error(res, 'Only superAdmin can send messages to clients', 403);
  }

  // Validate required fields
  if (!clientId || !content) {
    return ResponseHelper.error(res, 'clientId and content are required', 400);
  }

  // Check if client exists and is active
  const client = await Client.findById(clientId).select('firstName lastName email role isActive company');
  if (!client) {
    return ResponseHelper.error(res, 'Client not found', 404);
  }

  if (!client.isActive) {
    return ResponseHelper.error(res, 'Client account is deactivated', 400);
  }

  // Get superAdmin info
  const superAdmin = await Admin.findById(userId).select('username fullname role isActive');
  if (!superAdmin) {
    return ResponseHelper.error(res, 'SuperAdmin not found', 404);
  }

  if (!superAdmin.isActive) {
    return ResponseHelper.error(res, 'SuperAdmin account is deactivated', 400);
  }

  // Validate content length
  if (content.length > 5000) {
    return ResponseHelper.error(res, 'Message content cannot exceed 5000 characters', 400);
  }

  // Validate message type
  const validTypes = ['text', 'image', 'file', 'link'];
  if (!validTypes.includes(type)) {
    return ResponseHelper.error(res, `Invalid message type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  // Validate priority
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return ResponseHelper.error(res, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, 400);
  }

  // Validate category
  const validCategories = ['general', 'support', 'billing', 'technical', 'feature-request', 'complaint', 'other'];
  if (!validCategories.includes(category)) {
    return ResponseHelper.error(res, `Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
  }

  try {
    const message = await ClientChatService.sendMessageToClient(userId, clientId, {
      content,
      type,
      attachments,
      priority,
      category
    });

    ResponseHelper.success(res, message, 'Message sent successfully');
  } catch (error) {
    ResponseHelper.error(res, error.message, 500);
  }
});

// Get conversation between client and recipient
const getConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.params;
  const { id: clientId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access conversations', 403);
  }

  // Check if recipient exists
  const recipient = await Admin.findById(recipientId).select('username fullname role isActive') ||
                   await Employee.findById(recipientId).select('username firstName lastName role isActive') ||
                   await Client.findById(recipientId).select('firstName lastName email role isActive');
  
  if (!recipient) {
    return ResponseHelper.error(res, 'Recipient not found', 404);
  }

  const conversation = await ClientChatService.getConversation(clientId, recipientId, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, conversation, 'Conversation retrieved successfully');
});

// Get client's messages (all conversations)
const getClientMessages = asyncHandler(async (req, res) => {
  const { id: clientId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access messages', 403);
  }

  const messages = await ClientChatService.getClientMessages(clientId, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, messages, 'Messages retrieved successfully');
});

// Get messages for admin/employee (messages sent to them)
const getRecipientMessages = asyncHandler(async (req, res) => {
  const { id: recipientId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access messages', 403);
  }

  const messages = await ClientChatService.getRecipientMessages(recipientId, parseInt(page), parseInt(limit));
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

  if (content.length > 5000) {
    return ResponseHelper.error(res, 'Message content cannot exceed 5000 characters', 400);
  }

  const message = await ClientChatService.editMessage(messageId, userId, userRole, content);
  ResponseHelper.success(res, message, 'Message edited successfully');
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  const message = await ClientChatService.deleteMessage(messageId, userId, userRole);
  ResponseHelper.success(res, message, 'Message deleted successfully');
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId } = req.user;

  const message = await ClientChatService.markAsRead(messageId, userId);
  ResponseHelper.success(res, message, 'Message marked as read');
});

// Get unread message count
const getUnreadCount = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access unread count', 403);
  }

  const count = await ClientChatService.getUnreadCount(userId);
  ResponseHelper.success(res, { unreadCount: count }, 'Unread count retrieved successfully');
});

// Search messages
const searchMessages = asyncHandler(async (req, res) => {
  const { id: clientId, role: userRole } = req.user;
  const { q: query, page = 1, limit = 20 } = req.query;

  if (!query) {
    return ResponseHelper.error(res, 'Search query is required', 400);
  }

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to search messages', 403);
  }

  const results = await ClientChatService.searchMessages(clientId, query, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, results, 'Search results retrieved successfully');
});

// Get chat statistics
const getChatStats = asyncHandler(async (req, res) => {
  const { id: clientId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access chat statistics', 403);
  }

  const stats = await ClientChatService.getChatStats(clientId);
  ResponseHelper.success(res, stats, 'Chat statistics retrieved successfully');
});

// Get available recipients for client
const getAvailableRecipients = asyncHandler(async (req, res) => {
  const { id: clientId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access recipients', 403);
  }

  const recipients = await ClientChatService.getAvailableRecipients(clientId);
  ResponseHelper.success(res, recipients, 'Available recipients retrieved successfully');
});

// Get client's conversation list
const getConversationList = asyncHandler(async (req, res) => {
  const { id: clientId, role: userRole } = req.user;
  const { page = 1, limit = 20 } = req.query;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access conversation list', 403);
  }

  const conversations = await ClientChatService.getConversationList(clientId, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, conversations, 'Conversation list retrieved successfully');
});

// Debug endpoint to check user info
const debugUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { id: currentUserId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access debug information', 403);
  }

  try {
    // Check in all models
    let user = await Admin.findById(userId).select('username fullname role isActive');
    let userModel = 'Admin';
    
    if (!user) {
      user = await Employee.findById(userId).select('username fullname role isActive');
      userModel = 'Employee';
    }
    
    if (!user) {
      user = await Client.findById(userId).select('firstName lastName email role isActive');
      userModel = 'Client';
    }

    if (!user) {
      return ResponseHelper.error(res, 'User not found in any model', 404);
    }

    ResponseHelper.success(res, {
      user: {
        id: user._id,
        username: user.username || user.email,
        fullname: user.fullname || `${user.firstName} ${user.lastName}`,
        role: user.role,
        model: userModel,
        isActive: user.isActive
      },
      currentUser: {
        id: currentUserId,
        role: userRole
      }
    }, 'User debug information retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, `Debug error: ${error.message}`, 500);
  }
});

// Debug endpoint to list all users
const debugListAllUsers = asyncHandler(async (req, res) => {
  const { id: currentUserId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access debug information', 403);
  }

  try {
    const admins = await Admin.find({ isActive: true }, '_id username fullname role').limit(10);
    const employees = await Employee.find({ isActive: true }, '_id username fullname role').limit(10);
    const clients = await Client.find({ isActive: true }, '_id firstName lastName email role').limit(10);

    ResponseHelper.success(res, {
      admins: admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        fullname: admin.fullname,
        role: admin.role,
        model: 'Admin'
      })),
      employees: employees.map(employee => ({
        id: employee._id,
        username: employee.username,
        fullname: employee.fullname,
        role: employee.role,
        model: 'Employee'
      })),
      clients: clients.map(client => ({
        id: client._id,
        username: client.email,
        fullname: `${client.firstName} ${client.lastName}`,
        role: client.role,
        model: 'Client'
      }))
    }, 'All users retrieved successfully');
  } catch (error) {
    ResponseHelper.error(res, `Debug error: ${error.message}`, 500);
  }
});

module.exports = {
  sendMessage,
  sendMessageToClient,
  getConversation,
  getClientMessages,
  getRecipientMessages,
  editMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
  searchMessages,
  getChatStats,
  getAvailableRecipients,
  getConversationList,
  debugUser,
  debugListAllUsers
};
