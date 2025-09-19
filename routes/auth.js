const express = require('express');
const {
  signup,
  login,
  superAdminLogin,
  adminLogin,
  logout,
  superAdminLogout,
  adminLogout,
  getLogoutStatus
} = require('../controllers/authController');

const router = express.Router();

// Authentication Routes
router.post('/signup', signup);
router.post('/login', login);

// Role-specific Login Routes
router.post('/superAdmin/login', superAdminLogin);
router.post('/admin/login', adminLogin);

// Logout Routes
router.post('/logout', logout);
router.post('/superAdmin/logout', superAdminLogout);
router.post('/admin/logout', adminLogout);

// Utility Routes
router.get('/logout/status', getLogoutStatus);

module.exports = router;
