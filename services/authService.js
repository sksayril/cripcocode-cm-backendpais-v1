const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../env');

class AuthService {
  // Create new user
  static async createUser(userData) {
    try {
      const newUser = new User(userData);
      return await newUser.save();
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  // Find user by criteria
  static async findUserByCriteria(criteria) {
    try {
      return await User.findOne(criteria);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Validate user credentials
  static async validateCredentials(email, password) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return { isValid: false, user: null, message: 'User not found' };
      }

      if (!user.isActive) {
        return { isValid: false, user: null, message: 'Account is deactivated' };
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return { isValid: false, user: null, message: 'Invalid password' };
      }

      return { isValid: true, user, message: 'Credentials valid' };
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  static generateToken(payload, options = {}) {
    try {
      const defaultOptions = {
        expiresIn: config.JWT_EXPIRES_IN || '24h'
      };

      const tokenOptions = { ...defaultOptions, ...options };
      
      return jwt.sign(payload, config.JWT_SECRET, tokenOptions);
    } catch (error) {
      throw error;
    }
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }

  // Check if user exists by email, username, or phone
  static async checkUserExists(userData) {
    try {
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username },
          { phone: userData.phone }
        ]
      });

      if (existingUser) {
        let duplicateField = '';
        if (existingUser.email === userData.email) duplicateField = 'email';
        else if (existingUser.username === userData.username) duplicateField = 'username';
        else if (existingUser.phone === userData.phone) duplicateField = 'phone';

        return {
          exists: true,
          field: duplicateField,
          message: `User with this ${duplicateField} already exists`
        };
      }

      return { exists: false, field: null, message: 'User does not exist' };
    } catch (error) {
      throw error;
    }
  }

  // Validate user role
  static validateUserRole(role) {
    const validRoles = ['superAdmin', 'admin'];
    return validRoles.includes(role);
  }

  // Validate required fields for signup
  static validateSignupFields(userData) {
    const requiredFields = ['username', 'email', 'phone', 'role', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  }

  // Validate required fields for login
  static validateLoginFields(userData) {
    const requiredFields = ['email', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  }

  // Check if user has required role
  static hasRequiredRole(userRole, requiredRole) {
    if (requiredRole === 'superAdmin') {
      return userRole === 'superAdmin';
    }
    
    if (requiredRole === 'admin') {
      return ['admin', 'superAdmin'].includes(userRole);
    }
    
    return false;
  }

  // Get user permissions based on role
  static getUserPermissions(userRole) {
    const permissions = {
      canManageUsers: false,
      canManageAdmins: false,
      canAccessAllData: false,
      canModifySystem: false
    };

    if (userRole === 'superAdmin') {
      permissions.canManageUsers = true;
      permissions.canManageAdmins = true;
      permissions.canAccessAllData = true;
      permissions.canModifySystem = true;
    } else if (userRole === 'admin') {
      permissions.canAccessAllData = true;
    }

    return permissions;
  }

  // Create user response data
  static createUserResponse(user, token = null, additionalData = {}) {
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      isActive: user.isActive
    };

    const response = {
      success: true,
      message: 'Operation successful',
      data: {
        user: userResponse,
        ...additionalData
      }
    };

    if (token) {
      response.data.token = token;
      response.data.tokenType = 'Bearer';
      response.data.expiresIn = config.JWT_EXPIRES_IN || '24h';
    }

    return response;
  }

  // Create error response
  static createErrorResponse(message, statusCode = 400, error = null) {
    const response = {
      success: false,
      message
    };

    if (error) {
      response.error = error.message || error;
    }

    return { response, statusCode };
  }
}

module.exports = AuthService;
