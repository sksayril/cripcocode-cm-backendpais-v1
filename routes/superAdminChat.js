const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
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
} = require('../controllers/superAdminChatController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Super Admin Chat Routes

// Send a message from super admin to any user
router.post('/messages', sendMessage);

// Send announcement to multiple users
router.post('/announcements', sendAnnouncement);

// Send system message
router.post('/system-messages', sendSystemMessage);

// Get conversation between super admin and recipient
router.get('/conversation/:recipientId', getConversation);

// Get super admin's messages (all conversations)
router.get('/messages', getSuperAdminMessages);

// Get system messages
router.get('/system-messages', getSystemMessages);

// Get announcements
router.get('/announcements', getAnnouncements);

// Get message by ID
router.get('/messages/:messageId', getMessageById);

// Get audit trail for a message
router.get('/messages/:messageId/audit-trail', getMessageAuditTrail);

// Edit a message
router.put('/messages/:messageId', editMessage);

// Delete a message
router.delete('/messages/:messageId', deleteMessage);

// Restore a message
router.patch('/messages/:messageId/restore', restoreMessage);

// Mark message as read
router.post('/messages/:messageId/read', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Search messages
router.get('/search', searchMessages);

// Get chat statistics
router.get('/stats', getChatStats);

// Get available recipients
router.get('/recipients', getAvailableRecipients);

// Debug endpoints
router.get('/debug/super-admin', debugSuperAdmin);
router.get('/debug/sender/:senderId', debugSender);
router.get('/debug/auth', debugAuth);

module.exports = router;
