const asyncHandler = require('../utils/asyncHandler');
const ResponseHelper = require('../utils/responseHelper');
const EmployeeChatService = require('../services/employeeChatService');
const { EmployeeMessage } = require('../models/EmployeeChat');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

// Helper function to get valid roles for authorization
const getValidRoles = () => [
  'superAdmin', 'admin', 'CompanyAdmin', 
  'employee', // Generic employee role
  'junior', 'senior', 'lead', 'manager', 'director', 'designer', 'developer', 'analyst', 'specialist', 'coordinator', 'assistant', 'consultant', 'other', // Employee model roles
  'client', 'premium-client', 'enterprise-client'
];

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, senderModel, content, type = 'text', attachments = [], recipientId, recipientModel } = req.body;
  const { role: userRole } = req.user;

  // Validate required fields
  if (!senderId || !senderModel || !recipientId || !recipientModel || !content) {
    return ResponseHelper.error(res, 'Sender ID, sender model, recipient ID, recipient model, and content are required', 400);
  }

  // Validate models - CompanyAdmin and superAdmin are roles within Admin model
  const validSenderModels = ['Admin', 'Employee', 'CompanyAdmin', 'superAdmin', 'Client'];
  const validRecipientModels = ['Admin', 'Employee', 'CompanyAdmin', 'superAdmin', 'Client'];
  
  if (!validSenderModels.includes(senderModel)) {
    return ResponseHelper.error(res, 'Invalid sender model. Must be Admin, CompanyAdmin, superAdmin, Employee, or Client. Note: premium-client and enterprise-client are roles within the Client model, not separate models.', 400);
  }

  if (!validRecipientModels.includes(recipientModel)) {
    return ResponseHelper.error(res, 'Invalid recipient model. Must be Admin, CompanyAdmin, superAdmin, Employee, or Client. Note: premium-client and enterprise-client are roles within the Client model, not separate models.', 400);
  }

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to send messages', 403);
  }

  // Check if sender exists and is active
  let sender;
  if (senderModel === 'Admin' || senderModel === 'CompanyAdmin' || senderModel === 'superAdmin') {
    sender = await Admin.findById(senderId).select('username fullname role isActive');
  } else if (senderModel === 'Employee') {
    sender = await Employee.findById(senderId).select('username fullname role isActive');
  } else if (senderModel === 'Client') {
    sender = await Client.findById(senderId).select('firstName lastName email role isActive');
  }

  if (!sender) {
    return ResponseHelper.error(res, 'Sender not found', 404);
  }

  if (!sender.isActive) {
    return ResponseHelper.error(res, 'Sender account is inactive', 400);
  }

  // Check if recipient exists and is active
  let recipient;
  if (recipientModel === 'Admin' || recipientModel === 'CompanyAdmin' || recipientModel === 'superAdmin') {
    recipient = await Admin.findById(recipientId).select('username fullname role isActive');
  } else if (recipientModel === 'Employee') {
    recipient = await Employee.findById(recipientId).select('username fullname role isActive');
  } else if (recipientModel === 'Client') {
    recipient = await Client.findById(recipientId).select('firstName lastName email role isActive');
  }

  if (!recipient) {
    return ResponseHelper.error(res, `Recipient not found. User ID: ${recipientId}, Model: ${recipientModel}. Please check if the user exists and is active.`, 404);
  }

  if (!recipient.isActive) {
    return ResponseHelper.error(res, 'Recipient account is inactive', 400);
  }

  // Normalize CompanyAdmin and superAdmin to Admin for service call
  const normalizedSenderModel = (senderModel === 'CompanyAdmin' || senderModel === 'superAdmin') ? 'Admin' : senderModel;
  const normalizedRecipientModel = (recipientModel === 'CompanyAdmin' || recipientModel === 'superAdmin') ? 'Admin' : recipientModel;

  const message = await EmployeeChatService.sendMessage(senderId, normalizedSenderModel, recipientId, normalizedRecipientModel, {
    content,
    type,
    attachments
  });

  ResponseHelper.created(res, message, 'Message sent successfully');
});

// Get conversation between two users
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { id: currentUserId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access conversations', 403);
  }

  // Check if target user exists
  const targetUser = await Admin.findById(userId).select('username fullname role isActive') ||
                    await Employee.findById(userId).select('username fullname role isActive') ||
                    await Client.findById(userId).select('firstName lastName email role isActive');
  
  if (!targetUser) {
    return ResponseHelper.error(res, 'User not found', 404);
  }

  const conversation = await EmployeeChatService.getConversation(currentUserId, userId, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, conversation, 'Conversation retrieved successfully');
});

// Get user's messages (all conversations)
const getUserMessages = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;
  const { page = 1, limit = 50 } = req.query;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access messages', 403);
  }

  const messages = await EmployeeChatService.getUserMessages(userId, parseInt(page), parseInt(limit));
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

  const message = await EmployeeChatService.editMessage(messageId, userId, userRole, content);
  ResponseHelper.success(res, message, 'Message edited successfully');
});

// Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId, role: userRole } = req.user;

  const message = await EmployeeChatService.deleteMessage(messageId, userId, userRole);
  ResponseHelper.success(res, message, 'Message deleted successfully');
});

// Mark message as read
const markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { id: userId } = req.user;

  const message = await EmployeeChatService.markAsRead(messageId, userId);
  ResponseHelper.success(res, message, 'Message marked as read');
});

// Get unread count
const getUnreadCount = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access unread count', 403);
  }

  const unreadCount = await EmployeeChatService.getUnreadCount(userId);
  ResponseHelper.success(res, { unreadCount }, 'Unread count retrieved successfully');
});

// Search messages
const searchMessages = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 20 } = req.query;
  const { id: userId, role: userRole } = req.user;

  if (!query) {
    return ResponseHelper.error(res, 'Search query is required', 400);
  }

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to search messages', 403);
  }

  const results = await EmployeeChatService.searchMessages(userId, query, parseInt(page), parseInt(limit));
  ResponseHelper.success(res, results, 'Search results retrieved successfully');
});

// Get chat statistics
const getChatStats = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access chat statistics', 403);
  }

  const stats = await EmployeeChatService.getChatStats(userId);
  ResponseHelper.success(res, stats, 'Chat statistics retrieved successfully');
});

// Get available users for chat
const getAvailableUsers = asyncHandler(async (req, res) => {
  const { id: userId, role: userRole } = req.user;

  // Check authorization
  if (!getValidRoles().includes(userRole)) {
    return ResponseHelper.error(res, 'You are not authorized to access user list', 403);
  }

  const users = await EmployeeChatService.getAvailableUsers(userId, userRole);
  ResponseHelper.success(res, { users }, 'Available users retrieved successfully');
});

// Debug endpoints
const debugUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check in Admin collection
  const adminUser = await Admin.findById(userId).select('username fullname role isActive');
  if (adminUser) {
    return ResponseHelper.success(res, {
      user: adminUser,
      model: 'Admin',
      found: true
    }, 'User found in Admin collection');
  }
  
  // Check in Employee collection
  const employeeUser = await Employee.findById(userId).select('username fullname role isActive');
  if (employeeUser) {
    return ResponseHelper.success(res, {
      user: employeeUser,
      model: 'Employee',
      found: true
    }, 'User found in Employee collection');
  }
  
  // Check in Client collection
  const clientUser = await Client.findById(userId).select('firstName lastName email role isActive');
  if (clientUser) {
    return ResponseHelper.success(res, {
      user: clientUser,
      model: 'Client',
      found: true
    }, 'User found in Client collection');
  }
  
  ResponseHelper.error(res, 'User not found in any collection', 404);
});

const debugListAllUsers = asyncHandler(async (req, res) => {
  const admins = await Admin.find({}, '_id username fullname role isActive').limit(10);
  const employees = await Employee.find({}, '_id username fullname role isActive').limit(10);
  const clients = await Client.find({}, '_id firstName lastName email role isActive').limit(10);
  
  ResponseHelper.success(res, {
    admins,
    employees,
    clients,
    totalAdmins: admins.length,
    totalEmployees: employees.length,
    totalClients: clients.length
  }, 'All users retrieved successfully');
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
  getAvailableUsers,
  debugUser,
  debugListAllUsers
};
