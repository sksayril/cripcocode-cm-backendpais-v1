const jwt = require('jsonwebtoken');
const config = require('../env');
const tokenBlacklist = require('../utils/tokenBlacklist');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please login again.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    console.log('JWT decoded successfully:', {
      userId: decoded.userId,
      role: decoded.role,
      tokenType: typeof decoded
    });
    
    // Try to find admin first, then user if not found
    let admin = await Admin.findById(decoded.userId)
      .select('-password')
      .populate('company', 'name email industry isActive');

    let user = null;
    
    if (!admin) {
      // If admin not found, try to find user
      user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        // Convert user to admin format for consistency
        admin = {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          company: null, // User model doesn't have company
          isActive: user.isActive,
          permissions: {
            canManageUsers: user.role === 'superAdmin',
            canManageAdmins: user.role === 'superAdmin',
            canManageCompany: user.role === 'superAdmin',
            canViewReports: true,
            canManageProjects: user.role === 'superAdmin',
            canManageBilling: user.role === 'superAdmin'
          }
        };
      }
    }

    if (!admin && !user) {
      console.error(`Admin/User not found for userId: ${decoded.userId}`);
      console.error('Available fields in decoded token:', Object.keys(decoded));
      return res.status(401).json({
        success: false,
        message: 'Admin/User not found. Please check your authentication token.'
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if admin's company is active (for non-superAdmin users)
    if (admin.role !== 'superAdmin' && admin.company && !admin.company.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your company account is deactivated'
      });
    }

    // Add admin info to request
    req.user = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      company: admin.company?._id || admin.company,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to require superAdmin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super-admin role required.'
    });
  }
  next();
};

// Middleware to require admin role (superAdmin or CompanyAdmin)
const requireAdmin = (req, res, next) => {
  if (!['superAdmin', 'CompanyAdmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Middleware to require CompanyAdmin role
const requireCompanyAdmin = (req, res, next) => {
  if (req.user.role !== 'CompanyAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Company-admin role required.'
    });
  }
  next();
};

// Middleware to require manager role or higher
const requireManager = (req, res, next) => {
  if (!['superAdmin', 'CompanyAdmin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager role or higher required.'
    });
  }
  next();
};

// Middleware to check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${permission} permission required.`
      });
    }
    next();
  };
};

// Middleware to check if user belongs to company
const requireCompanyAccess = (req, res, next) => {
  const companyId = req.params.companyId || req.body.company || req.query.company;
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Company ID is required'
    });
  }

  // Super-admin can access any company
  if (req.user.role === 'superAdmin') {
    return next();
  }

  // Other users can only access their own company
  if (req.user.company && req.user.company.toString() === companyId.toString()) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own company.'
  });
};

// Middleware to check if user can manage specific admin
const canManageAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    
    // Super-admin can manage any admin
    if (req.user.role === 'superAdmin') {
      return next();
    }

    // Get admin details
    const admin = await Admin.findById(adminId).select('company role');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Company-admin can only manage admins in their company
    if (req.user.role === 'CompanyAdmin') {
      if (admin.company.toString() === req.user.company.toString()) {
        // Prevent CompanyAdmin from managing superAdmin
        if (admin.role === 'superAdmin') {
          return res.status(403).json({
            success: false,
            message: 'Company-admin cannot manage superAdmin accounts'
          });
        }
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only manage admins in your company.'
    });
  } catch (error) {
    console.error('Admin management check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireAdmin,
  requireCompanyAdmin,
  requireManager,
  requirePermission,
  requireCompanyAccess,
  canManageAdmin
};
