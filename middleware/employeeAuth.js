const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const config = require('../env');
const ResponseHelper = require('../utils/responseHelper');

// Employee Authentication Middleware
const authenticateEmployeeToken = async (req, res, next) => {
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

    // Check if token is for employee
    if (decoded.type !== 'employee') {
      return ResponseHelper.error(res, 'Invalid token type. Employee token required.', 401);
    }

    // Get employee details
    const employee = await Employee.findById(decoded.id)
      .select('-password')
      .populate('company', 'name status isActive');

    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found.', 401);
    }

    // Check if employee is active
    if (!employee.isActive) {
      return ResponseHelper.error(res, 'Account is deactivated. Please contact HR.', 401);
    }

    // Check if company is active
    if (!employee.company || !employee.company.isActive) {
      return ResponseHelper.error(res, 'Your company account is inactive. Please contact support.', 401);
    }

    // Check if account is locked
    if (employee.isLocked) {
      return ResponseHelper.error(res, 'Account is temporarily locked. Please try again later.', 401);
    }

    // Add employee info to request
    req.user = {
      id: employee._id,
      type: 'employee',
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      role: employee.role,
      designation: employee.designation,
      company: employee.company._id,
      companyName: employee.company.name,
      permissions: employee.permissions
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
};

// Middleware to check if employee can access task
const canAccessTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Task = require('../models/Task');

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found.', 404);
    }

    // Check if employee is assigned to the task or belongs to the same company
    if (task.assignedTo.toString() !== req.user.id && 
        !task.teamMembers.find(member => member.employee.toString() === req.user.id && member.isActive) &&
        task.company.toString() !== req.user.company) {
      return ResponseHelper.error(res, 'Access denied. You can only access your assigned tasks.', 403);
    }

    req.task = task;
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
};

// Middleware to check if employee can modify task
const canModifyTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Task = require('../models/Task');

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found.', 404);
    }

    // Check if employee is assigned to the task
    if (task.assignedTo.toString() !== req.user.id && 
        !task.teamMembers.find(member => member.employee.toString() === req.user.id && member.isActive)) {
      return ResponseHelper.error(res, 'Access denied. You can only modify your assigned tasks.', 403);
    }

    // Check if task can be modified (not completed or cancelled)
    if (['completed', 'cancelled'].includes(task.status)) {
      return ResponseHelper.error(res, 'Cannot modify completed or cancelled tasks.', 400);
    }

    req.task = task;
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
};

// Middleware to check if employee can view company tasks
const canViewCompanyTasks = async (req, res, next) => {
  try {
    // Employee can only view tasks from their assigned company
    // This is already enforced in the controller, but we can add additional checks here
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
};

// Middleware to check if employee can create tasks
const canCreateTasks = async (req, res, next) => {
  try {
    // Check if employee has permission to create tasks
    if (!req.user.permissions.canCreateProjects) {
      return ResponseHelper.error(res, 'You do not have permission to create tasks.', 403);
    }

    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
};

// Middleware to check if employee can assign tasks
const canAssignTasks = async (req, res, next) => {
  try {
    // Check if employee has permission to assign tasks
    if (!req.user.permissions.canAssignTasks) {
      return ResponseHelper.error(res, 'You do not have permission to assign tasks.', 403);
    }

    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Access verification failed.', 500);
  }
};

module.exports = {
  authenticateEmployeeToken,
  canAccessTask,
  canModifyTask,
  canViewCompanyTasks,
  canCreateTasks,
  canAssignTasks
};
