const express = require('express');
const {
  signup,
  login,
  superAdminLogin,
  adminLogin,
  companyAdminLogin,
  logout,
  superAdminLogout,
  adminLogout,
  companyAdminLogout,
  getLogoutStatus
} = require('../controllers/authController');

const router = express.Router();

// Authentication Routes
router.post('/signup', signup);
router.post('/login', login);

// Role-specific Login Routes
router.post('/superAdmin/login', superAdminLogin);
router.post('/admin/login', adminLogin);
router.post('/companyAdmin/login', companyAdminLogin);

// Logout Routes
router.post('/logout', logout);
router.post('/superAdmin/logout', superAdminLogout);
router.post('/admin/logout', adminLogout);
router.post('/companyAdmin/logout', companyAdminLogout);

// Utility Routes
router.get('/logout/status', getLogoutStatus);

module.exports = router;
