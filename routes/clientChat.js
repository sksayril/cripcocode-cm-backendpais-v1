const express = require('express');
const router = express.Router();
const { authenticateUnifiedToken } = require('../middleware/unifiedAuth');
const {
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
} = require('../controllers/clientChatController');

// Apply authentication middleware to all routes
router.use(authenticateUnifiedToken);

// Client Chat Routes

// Send a message from client to admin/employee
router.post('/messages', sendMessage);

// Send a message from superAdmin to client
router.post('/messages/to-client', sendMessageToClient);

// Get conversation between client and recipient
router.get('/conversation/:recipientId', getConversation);

// Get client's messages (all conversations)
router.get('/messages', getClientMessages);

// Get messages for admin/employee (messages sent to them)
router.get('/recipient-messages', getRecipientMessages);

// Edit a message
router.post('/messages/:messageId/edit', editMessage);

// Delete a message
router.post('/messages/:messageId/delete', deleteMessage);

// Mark message as read
router.post('/messages/:messageId/read', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Search messages
router.get('/search', searchMessages);

// Get chat statistics
router.get('/stats', getChatStats);

// Get available recipients for client
router.get('/recipients', getAvailableRecipients);

// Get client's conversation list
router.get('/conversations', getConversationList);

// Debug endpoints
router.get('/debug/user/:userId', debugUser);
router.get('/debug/users', debugListAllUsers);

module.exports = router;
