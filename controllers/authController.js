const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../env');
const tokenBlacklist = require('../utils/tokenBlacklist');

// Super Admin Signup API
const signup = async (req, res) => {
  try {
    const { username, email, phone, role, password } = req.body;

    // Validation
    if (!username || !email || !phone || !role || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if role is valid
    if (!['superAdmin', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "superAdmin" or "admin"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, username, or phone already exists'
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      phone,
      role,
      password
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Send response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        token,
        tokenType: 'Bearer',
        expiresIn: config.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// General Login API
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Try to find user in User collection first
    let user = await User.findOne({ email });
    let userType = 'user';
    
    console.log('Login attempt:', { email, userFound: !!user, userType });
    
    // If not found in User collection, try Admin collection
    if (!user) {
      user = await Admin.findOne({ email });
      userType = 'admin';
      console.log('Admin lookup result:', { email, adminFound: !!user, userType });
    }

    if (!user) {
      console.log('No user found in either collection:', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      userType,
      isActive: user.isActive 
    });

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    console.log('Attempting password comparison for user:', user._id);
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password comparison result:', { isValid: isPasswordValid });
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username || user.fullname,
        email: user.email,
        role: user.role
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username || user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: user.company,
          userType: userType,
          createdAt: user.createdAt
        },
        token,
        tokenType: 'Bearer',
        expiresIn: config.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Super Admin Login API (Specific endpoint)
const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user is superAdmin
    if (user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Superadmin role required for this endpoint'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token with superAdmin privileges
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Superadmin login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Super-admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin Login API (Specific endpoint)
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by email in Admin collection
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user is admin or superAdmin
    if (!['superAdmin', 'CompanyAdmin', 'manager', 'sales', 'support'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required for this endpoint'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: true
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: user.company,
          department: user.department,
          adminArea: user.adminArea,
          createdAt: user.createdAt,
          isAdmin: true
        },
        token,
        tokenType: 'Bearer',
        expiresIn: config.JWT_EXPIRES_IN,
        permissions: {
          canManageUsers: user.role === 'superAdmin',
          canManageAdmins: user.role === 'superAdmin',
          canAccessAllData: true,
          canModifySystem: user.role === 'superAdmin'
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// General Logout API
const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required for logout'
      });
    }

    // Add token to blacklist
    tokenBlacklist.addToBlacklist(token);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        message: 'Token has been invalidated. Please login again to get a new token.',
        logoutTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Super Admin Logout API
const superAdminLogout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required for logout'
      });
    }

    // Verify token to get user info
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if user is superAdmin
    if (decoded.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Superadmin role required for this endpoint'
      });
    }

    // Add token to blacklist
    tokenBlacklist.addToBlacklist(token);

    res.status(200).json({
      success: true,
      message: 'Super-admin logout successful',
      data: {
        user: {
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role
        },
        message: 'Token has been invalidated. Please login again to get a new token.',
        logoutTime: new Date().toISOString(),
        sessionEnded: true
      }
    });

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
        message: 'Token expired'
      });
    }

    console.error('Super-admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// CompanyAdmin Login API (Specific endpoint)
const companyAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by email in Admin collection
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user is CompanyAdmin
    if (user.role !== 'CompanyAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. CompanyAdmin role required for this endpoint'
      });
    }

    // Check if user has a company assigned
    if (!user.company) {
      return res.status(403).json({
        success: false,
        message: 'CompanyAdmin must be associated with a company'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        company: user.company,
        isAdmin: true
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: 'CompanyAdmin login successful',
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: user.company,
          department: user.department,
          adminArea: user.adminArea,
          createdAt: user.createdAt,
          isAdmin: true
        },
        token,
        tokenType: 'Bearer',
        expiresIn: config.JWT_EXPIRES_IN,
        permissions: {
          canManageCompanyUsers: true,
          canSendAnnouncements: true,
          canSendNotices: true,
          canAccessCompanyData: true,
          canManageCompanyProjects: true,
          canAccessCompanyChat: true,
          canModifyCompanySettings: true
        }
      }
    });

  } catch (error) {
    console.error('CompanyAdmin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// CompanyAdmin Logout API
const companyAdminLogout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required for logout'
      });
    }

    // Verify token to get user info
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if user is CompanyAdmin
    if (decoded.role !== 'CompanyAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. CompanyAdmin role required for this endpoint'
      });
    }

    // Add token to blacklist
    tokenBlacklist.addToBlacklist(token);

    res.status(200).json({
      success: true,
      message: 'CompanyAdmin logout successful',
      data: {
        user: {
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          company: decoded.company
        },
        message: 'Token has been invalidated. Please login again to get a new token.',
        logoutTime: new Date().toISOString(),
        sessionEnded: true
      }
    });

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
        message: 'Token expired'
      });
    }

    console.error('CompanyAdmin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin Logout API
const adminLogout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required for logout'
      });
    }

    // Verify token to get user info
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if user is admin or superAdmin
    if (!['admin', 'superAdmin'].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or superAdmin role required for this endpoint'
      });
    }

    // Add token to blacklist
    tokenBlacklist.addToBlacklist(token);

    res.status(200).json({
      success: true,
      message: 'Admin logout successful',
      data: {
        user: {
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role
        },
        message: 'Token has been invalidated. Please login again to get a new token.',
        logoutTime: new Date().toISOString(),
        sessionEnded: true
      }
    });

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
        message: 'Token expired'
      });
    }

    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get logout status (optional - for debugging)
const getLogoutStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout status retrieved',
      data: {
        blacklistedTokensCount: tokenBlacklist.getBlacklistSize(),
        message: 'This endpoint shows the count of blacklisted tokens'
      }
    });

  } catch (error) {
    console.error('Logout status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
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
};
