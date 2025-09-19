const express = require('express');
const { 
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
} = require('../controllers/employeeChatController');

// Import authentication middleware
const { authenticateUnifiedToken } = require('../middleware/unifiedAuth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUnifiedToken);

// Employee Chat Routes
router.post('/messages', sendMessage);
router.get('/conversation/:userId', getConversation);
router.get('/messages', getUserMessages);
router.post('/messages/:messageId/edit', editMessage);
router.post('/messages/:messageId/delete', deleteMessage);
router.post('/messages/:messageId/read', markAsRead);
router.get('/unread-count', getUnreadCount);
router.get('/search', searchMessages);
router.get('/stats', getChatStats);
router.get('/available-users', getAvailableUsers);

// Debug Routes
router.get('/debug/user/:userId', debugUser);
router.get('/debug/users', debugListAllUsers);

module.exports = router;
