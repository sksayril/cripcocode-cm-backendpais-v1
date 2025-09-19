const express = require('express');
const { authenticateToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  hardDeleteAdmin,
  reactivateAdmin,
  getAdminStats
} = require('../controllers/adminController');
const Admin = require('../models/Admin');
const User = require('../models/User');
const mongoose = require('mongoose');

const router = express.Router();

// Public endpoint to create a test admin user (for testing only)
router.post('/create-test-admin', async (req, res) => {
  try {
    const { fullname, username, email, password, phone, department, adminArea } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }
    
    // Create test admin (without company for testing)
    const testAdmin = new Admin({
      fullname: fullname || 'Test Admin',
      username: username || 'testadmin',
      email: email || 'testadmin@company.com',
      password: password || 'testpassword123',
      phone: phone || '1234567890',
      role: 'superAdmin',
      department: department || 'IT',
      adminArea: adminArea || 'Testing',
      company: null // No company for test admin
    });
    
    await testAdmin.save();
    
    res.status(201).json({
      success: true,
      message: 'Test admin created successfully',
      data: {
        admin: {
          id: testAdmin._id,
          fullname: testAdmin.fullname,
          username: testAdmin.username,
          email: testAdmin.email,
          role: testAdmin.role
        }
      }
    });
  } catch (error) {
    console.error('Create test admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test admin',
      error: error.message
    });
  }
});

// Public endpoint to check system status (no authentication required)
router.get('/system-status', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    const dbStatus = mongoose.connection.readyState;
    
    res.json({
      success: true,
      message: 'System status check',
      data: {
        databaseStatus: dbStatus === 1 ? 'connected' : 'disconnected',
        adminCollectionCount: adminCount,
        userCollectionCount: userCount,
        hasAdmins: adminCount > 0,
        hasUsers: userCount > 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'System status check failed',
      error: error.message
    });
  }
});

// Apply authentication middleware to all routes below
router.use(authenticateToken);

// Test endpoint to verify authentication
router.get('/test-auth', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      company: req.user.company
    }
  });
});

// Test endpoint to check if user can create admins
router.get('/test-permissions', (req, res) => {
  const canCreateAdmin = ['superAdmin', 'CompanyAdmin'].includes(req.user.role);
  
  res.json({
    success: true,
    message: 'Permission check completed',
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        company: req.user.company
      },
      permissions: {
        canCreateAdmin,
        canManageUsers: req.user.permissions?.canManageUsers || false,
        canManageAdmins: req.user.permissions?.canManageAdmins || false,
        canManageCompany: req.user.permissions?.canManageCompany || false
      }
    }
  });
});

// Debug endpoint to check database and model status
router.get('/debug', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const adminCount = await Admin.countDocuments();
    const adminSample = await Admin.findOne().select('_id username email role');
    
    res.json({
      success: true,
      message: 'Debug information',
      data: {
        databaseStatus: dbStatus === 1 ? 'connected' : 'disconnected',
        adminCollectionCount: adminCount,
        adminSample: adminSample,
        mongooseVersion: mongoose.version,
        nodeVersion: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// Admin CRUD Operations - Allow both superAdmin and CompanyAdmin
router.post('/create', requireAdmin, createAdmin);
router.get('/list', requireAdmin, getAllAdmins);
router.get('/:id', requireAdmin, getAdminById);
router.put('/:id', requireAdmin, updateAdmin);
router.post('/:id/update', requireAdmin, updateAdmin); // Alternative POST method

// Admin Password Management
router.put('/:id/password', requireAdmin, updateAdminPassword);
router.post('/:id/password', requireAdmin, updateAdminPassword); // Alternative POST method

// Admin Status Management
router.delete('/:id', requireAdmin, deleteAdmin); // Soft delete
router.post('/:id/delete', requireAdmin, deleteAdmin); // Alternative POST method

// Hard delete and reactivate (superAdmin only)
router.delete('/:id/permanent', requireSuperAdmin, hardDeleteAdmin);
router.post('/:id/delete/permanent', requireSuperAdmin, hardDeleteAdmin); // Alternative POST method
router.put('/:id/reactivate', requireAdmin, reactivateAdmin);
router.post('/:id/reactivate', requireAdmin, reactivateAdmin); // Alternative POST method

// Admin Analytics
router.get('/stats/overview', requireAdmin, getAdminStats);

module.exports = router;
