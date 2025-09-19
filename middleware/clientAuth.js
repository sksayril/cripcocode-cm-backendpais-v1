const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const config = require('../env');
const ResponseHelper = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');


// Client Authentication Middleware
const authenticateClientToken = asyncHandler(async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return ResponseHelper.error(res, 'Access denied. No token provided.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Check if token is for client
    if (decoded.type !== 'client') {
      return ResponseHelper.error(res, 'Invalid token type. Client token required.', 401);
    }

    // Get client details
    const client = await Client.findById(decoded.id)
      .select('-password')
      .populate('company', 'name status');

    if (!client) {
      return ResponseHelper.error(res, 'Client not found.', 401);
    }

    // Check if client is active
    if (!client.isActive) {
      return ResponseHelper.error(res, 'Account is deactivated. Please contact support.', 401);
    }

    // Check if client is assigned to a company
    if (!client.company) {
      return ResponseHelper.error(res, 'Account not yet assigned to a company. Please contact support.', 401);
    }

    // Check if client's company is active
    if (!client.company.isActive) {
      return ResponseHelper.error(res, 'Your assigned company is inactive. Please contact support.', 401);
    }

    // Add client info to request
    req.user = {
      id: client._id,
      type: 'client',
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      company: client.company._id,
      companyName: client.company.name,
      role: 'client'
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ResponseHelper.error(res, 'Invalid token.', 401);
    } else if (error.name === 'TokenExpiredError') {
      return ResponseHelper.error(res, 'Token expired.', 401);
    } else {
      return ResponseHelper.error(res, 'Authentication failed.', 401);
    }
  }
});

// Middleware to check if client can access project
const canAccessProject = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const Project = require('../models/Project');

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found.', 404);
    }

    // Check if client owns the project or belongs to the same company
    if (project.client.toString() !== req.user.id && project.company.toString() !== req.user.company) {
      return ResponseHelper.error(res, 'Access denied. You can only access your own projects.', 403);
    }

    req.project = project;
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
});

// Middleware to check if client can modify project
const canModifyProject = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const Project = require('../models/Project');

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found.', 404);
    }

    // Check if client owns the project
    if (project.client.toString() !== req.user.id) {
      return ResponseHelper.error(res, 'Access denied. You can only modify your own projects.', 403);
    }

    // Check if project can be modified (not completed or archived)
    if (['completed', 'archived'].includes(project.status)) {
      return ResponseHelper.error(res, 'Cannot modify completed or archived projects.', 400);
    }

    req.project = project;
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
});

// Middleware to check if client can view company projects
const canViewCompanyProjects = asyncHandler(async (req, res, next) => {
  try {
    // Client can only view projects from their assigned company
    // This is already enforced in the controller, but we can add additional checks here
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
});

// Middleware to check if client can create projects
const canCreateProjects = asyncHandler(async (req, res, next) => {
  try {
    // Check if client is active and assigned to a company
    if (!req.user.company) {
      return ResponseHelper.error(res, 'You must be assigned to a company to create projects.', 403);
    }

    // Additional checks can be added here (e.g., project limits, subscription status)
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
});

module.exports = {
  authenticateClientToken,
  canAccessProject,
  canModifyProject,
  canViewCompanyProjects,
  canCreateProjects
};
