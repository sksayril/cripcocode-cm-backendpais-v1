const jwt = require('jsonwebtoken');
const config = require('../env');
const tokenBlacklist = require('../utils/tokenBlacklist');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Client = require('../models/Client');
const User = require('../models/User');

// Unified authentication middleware for employee chat
const authenticateUnifiedToken = async (req, res, next) => {
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
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      type: decoded.type,
      tokenType: typeof decoded
    });
    
    let user = null;
    let userType = null;

    // Try to find user based on token type or role
    if (decoded.type === 'client') {
      // Client authentication
      user = await Client.findById(decoded.id)
        .select('-password')
        .populate('company', 'name status isActive');
      userType = 'client';
    } else if (decoded.type === 'employee') {
      // Employee authentication
      user = await Employee.findById(decoded.id)
        .select('-password')
        .populate('company', 'name status isActive');
      userType = 'employee';
    } else {
      // Admin or User authentication (legacy)
      const userId = decoded.userId || decoded.id;
      
      // Try Admin first
      user = await Admin.findById(userId)
        .select('-password')
        .populate('company', 'name email industry isActive');
      
      if (user) {
        userType = 'admin';
      } else {
        // Try User model
        const userModel = await User.findById(userId).select('-password');
        if (userModel) {
          // Convert user to admin format for consistency
          user = {
            _id: userModel._id,
            username: userModel.username,
            email: userModel.email,
            role: userModel.role,
            company: null,
            isActive: userModel.isActive,
            permissions: {
              canManageUsers: userModel.role === 'superAdmin',
              canManageAdmins: userModel.role === 'superAdmin',
              canManageCompany: userModel.role === 'superAdmin',
              canViewReports: true,
              canManageProjects: userModel.role === 'superAdmin',
              canManageBilling: userModel.role === 'superAdmin'
            }
          };
          userType = 'admin';
        }
      }
    }

    if (!user) {
      console.error(`User not found for userId: ${decoded.userId || decoded.id}, type: ${decoded.type || 'admin'}`);
      return res.status(401).json({
        success: false,
        message: 'User not found. Please check your authentication token.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check company status for non-superAdmin users
    if (user.role !== 'superAdmin' && user.company && !user.company.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your company account is deactivated'
      });
    }

    // Add user info to request with unified format
    req.user = {
      id: user._id,
      username: user.username || user.email,
      email: user.email,
      role: user.role,
      type: userType,
      company: user.company?._id || user.company,
      permissions: user.permissions || {},
      // Additional fields for different user types
      ...(userType === 'client' && {
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.company?.name
      }),
      ...(userType === 'employee' && {
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        designation: user.designation,
        companyName: user.company?.name
      })
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

module.exports = {
  authenticateUnifiedToken
};
