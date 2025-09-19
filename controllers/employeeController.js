const Employee = require('../models/Employee');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const Project = require('../models/Project');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../env');
const ResponseHelper = require('../utils/responseHelper');

// Generate JWT Token for Employee
const generateEmployeeToken = (employeeId) => {
  return jwt.sign(
    { 
      id: employeeId, 
      type: 'employee',
      iat: Math.floor(Date.now() / 1000)
    },
    config.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Employee Authentication Controllers
const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return ResponseHelper.error(res, 'Email and password are required', 400);
    }

    // Find employee by email
    const employee = await Employee.findOne({ email })
      .select('+password')
      .populate('company', 'name status isActive');

    if (!employee) {
      return ResponseHelper.error(res, 'Invalid credentials', 401);
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

    // Verify password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await employee.incrementLoginAttempts();
      return ResponseHelper.error(res, 'Invalid credentials', 401);
    }

    // Reset login attempts on successful login
    if (employee.loginAttempts > 0) {
      await employee.resetLoginAttempts();
    }

    // Update last login
    employee.lastLogin = new Date();
    await employee.save();

    // Generate token
    const token = generateEmployeeToken(employee._id);

    // Remove password from response
    employee.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Login successful',
      employee,
      token
    });
  } catch (error) {
    console.error('Error in employeeLogin:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const employeeLogout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    return ResponseHelper.success(res, {
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error in employeeLogout:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Employee Management Controllers (Admin Only)
const createEmployee = async (req, res) => {
  try {
    console.log('Create employee request received:', {
      body: req.body,
      user: req.user
    });

    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      department,
      role,
      designation,
      skills,
      joiningDate,
      contractType,
      salary,
      address,
      emergencyContact,
      company
    } = req.body;

    console.log('Extracted fields:', { firstName, lastName, username, email, phone, department, role, designation });

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !phone || !password || !department || !role || !designation) {
      console.log('Validation failed - missing fields');
      return ResponseHelper.error(res, 'Missing required fields: firstName, lastName, username, email, phone, password, department, role, designation', 400);
    }

    console.log('Name fields:', { firstName, lastName, username });

    try {
      // Check if email already exists
      const existingEmployeeByEmail = await Employee.findOne({ email });
      if (existingEmployeeByEmail) {
        console.log('Email already exists:', email);
        return ResponseHelper.error(res, 'Employee with this email already exists', 400);
      }
      console.log('Email validation passed');

      // Check if username already exists
      const existingEmployeeByUsername = await Employee.findOne({ username });
      if (existingEmployeeByUsername) {
        console.log('Username already exists:', username);
        return ResponseHelper.error(res, 'Employee with this username already exists', 400);
      }
      console.log('Username validation passed');
    } catch (dbError) {
      console.error('Database lookup error:', dbError);
      return ResponseHelper.error(res, 'Database lookup failed', 500);
    }

    // Determine company based on user role
    let companyId;
    try {
      if (req.user.role === 'superAdmin') {
        companyId = company || req.body.company;
        if (!companyId) {
          return ResponseHelper.error(res, 'Company ID is required for super admin', 400);
        }
      } else {
        companyId = req.user.company;
      }

      console.log('Company ID to be assigned:', companyId);
      console.log('User role:', req.user.role);
    } catch (companyError) {
      console.error('Company assignment error:', companyError);
      return ResponseHelper.error(res, 'Company assignment failed', 500);
    }

    // Check if company exists and is active
    let companyDoc;
    try {
      companyDoc = await Company.findById(companyId);
      if (!companyDoc || !companyDoc.isActive) {
        return ResponseHelper.error(res, 'Company not found or inactive', 404);
      }
      console.log('Company verified:', companyDoc.name);
    } catch (companyLookupError) {
      console.error('Company lookup error:', companyLookupError);
      return ResponseHelper.error(res, 'Company lookup failed', 500);
    }

    // Create employee data
    const employeeData = {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      company: companyId,
      department,
      role,
      designation,
      skills: skills || [],
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      contractType: contractType || 'full-time',
      salary: salary || {},
      address: address || {},
      emergencyContact: emergencyContact || {},
      createdBy: req.user.id
    };

    console.log('Employee data to be created:', {
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      username: employeeData.username,
      email: employeeData.email,
      department: employeeData.department,
      role: employeeData.role,
      company: employeeData.company
    });

    let employee;
    try {
      employee = await Employee.create(employeeData);
      console.log('Employee created successfully with ID:', employee._id);
    } catch (createError) {
      console.error('Employee creation error:', createError);
      return ResponseHelper.error(res, 'Failed to create employee: ' + createError.message, 500);
    }

    try {
      // Update company employee statistics
      companyDoc.totalEmployees += 1;
      await companyDoc.save();
      console.log('Company stats updated');
    } catch (statsError) {
      console.error('Company stats update error:', statsError);
      // Don't fail the request for this
    }

    try {
      // Populate references for response
      await employee.populate([
        { path: 'company', select: 'name status' },
        { path: 'createdBy', select: 'firstName lastName email' }
      ]);
      console.log('Employee populated successfully');
    } catch (populateError) {
      console.error('Employee populate error:', populateError);
      // Don't fail the request for this
    }

    // Remove password from response
    employee.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Employee created successfully',
      employee
    }, 201);
  } catch (error) {
    console.error('Unexpected error in createEmployee:', error);
    console.error('Error stack:', error.stack);
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const getAllEmployees = async (req, res) => {
  try {
    console.log('getAllEmployees called with query:', req.query);
    console.log('User info:', { role: req.user?.role, company: req.user?.company });

    const {
      page = 1,
      limit = 10,
      search,
      department,
      role,
      status,
      company: companyFilter
    } = req.query;

    const filter = {};

    // Company-specific filtering
    if (req.user.role === 'CompanyAdmin') {
      if (!req.user.company) {
        return ResponseHelper.error(res, 'User company not found', 400);
      }
      filter.company = req.user.company;
    } else if (companyFilter) {
      filter.company = companyFilter;
    }

    // Department filtering
    if (department) {
      filter.department = department;
    }

    // Role filtering
    if (role) {
      filter.role = role;
    }

    // Status filtering
    if (status) {
      if (status === 'active') filter.isActive = true;
      else if (status === 'inactive') filter.isActive = false;
      else if (status === 'locked') filter.lockUntil = { $gt: new Date() };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const options = {
      page: pageNum,
      limit: limitNum,
      populate: [
        { path: 'company', select: 'name status' },
        { path: 'createdBy', select: 'firstName lastName email' }
      ],
      sort: { createdAt: -1 }
    };

    console.log('Filter:', filter);
    console.log('Options:', options);

    const employees = await Employee.paginate(filter, options);
    console.log('Employees found:', employees?.docs?.length || 0);

    // Remove passwords from response
    employees.docs = employees.docs.map(emp => {
      emp.password = undefined;
      return emp;
    });

    return ResponseHelper.success(res, {
      message: 'Employees retrieved successfully',
      employees
    });
  } catch (error) {
    console.error('Error in getAllEmployees:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('getEmployeeById called with ID:', id);
    console.log('User info:', { role: req.user?.role, company: req.user?.company });

    const employee = await Employee.findById(id)
      .populate('company', 'name status industry')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedProjects.project', 'title status projectType')
      .populate('currentTasks.task', 'title status priority dueDate');

    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    console.log('Employee found:', {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      company: employee.company
    });

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const employeeCompanyId = employee.company._id || employee.company;
      const userCompanyId = req.user.company;
      
      console.log('Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        userCompanyType: typeof userCompanyId,
        employeeCompany: employeeCompanyId,
        employeeCompanyType: typeof employeeCompanyId,
        userCompanyStr: userCompanyId?.toString(),
        employeeCompanyStr: employeeCompanyId?.toString(),
        companiesMatch: employeeCompanyId?.toString() === userCompanyId?.toString()
      });
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (employeeCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Remove password from response
    employee.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Employee retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const employeeCompanyId = employee.company._id || employee.company;
      const userCompanyId = req.user.company;
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (employeeCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.company;
    delete updateData.createdBy;
    delete updateData.employeeId;

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate([
      { path: 'company', select: 'name status' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    // Remove password from response
    updatedEmployee.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const updateEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ResponseHelper.error(res, 'Current password and new password are required', 400);
    }

    const employee = await Employee.findById(id).select('+password');
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const employeeCompanyId = employee.company._id || employee.company;
      const userCompanyId = req.user.company;
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (employeeCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await employee.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return ResponseHelper.error(res, 'Current password is incorrect', 400);
    }

    // Update password
    employee.password = newPassword;
    await employee.save();

    return ResponseHelper.success(res, {
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in updateEmployeePassword:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const employeeCompanyId = employee.company._id || employee.company;
      const userCompanyId = req.user.company;
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (employeeCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Prevent deletion of employees with active projects
    const activeProjects = await Project.find({
      'team.member': id,
      status: { $in: ['active', 'in-progress', 'planning'] }
    });

    if (activeProjects.length > 0) {
      return ResponseHelper.error(res, 'Cannot delete employee with active projects. Please reassign projects first.', 400);
    }

    // Soft delete
    employee.isActive = false;
    await employee.save();

    // Update company employee statistics
    const company = await Company.findById(employee.company);
    if (company) {
      company.totalEmployees = Math.max(0, company.totalEmployees - 1);
      await company.save();
    }

    return ResponseHelper.success(res, {
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const reactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const employeeCompanyId = employee.company._id || employee.company;
      const userCompanyId = req.user.company;
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (employeeCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Reactivate employee
    employee.isActive = true;
    employee.lockUntil = undefined;
    employee.loginAttempts = 0;
    await employee.save();

    // Update company employee statistics
    const company = await Company.findById(employee.company);
    if (company) {
      company.totalEmployees += 1;
      await company.save();
    }

    return ResponseHelper.success(res, {
      message: 'Employee reactivated successfully'
    });
  } catch (error) {
    console.error('Error in reactivateEmployee:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Project Assignment Controllers
const assignEmployeeToProject = async (req, res) => {
  try {
    const { employeeId, projectId } = req.params;
    const { role, responsibilities } = req.body;

    if (!role) {
      return ResponseHelper.error(res, 'Role is required for project assignment', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access
    if (req.user.role === 'CompanyAdmin') {
      if (employee.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
      if (project.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
      }
    }

    // Check if employee is already assigned to this project
    const existingAssignment = employee.assignedProjects.find(
      assignment => assignment.project.toString() === projectId && assignment.isActive
    );

    if (existingAssignment) {
      return ResponseHelper.error(res, 'Employee is already assigned to this project', 400);
    }

    // Add project assignment to employee
    employee.assignedProjects.push({
      project: projectId,
      role,
      responsibilities: responsibilities || [],
      assignedDate: new Date(),
      isActive: true
    });

    // Update employee statistics
    employee.performance.totalProjects += 1;
    await employee.save();

    // Add employee to project team
    project.team.push({
      member: employeeId,
      role,
      assignedDate: new Date(),
      isActive: true
    });
    await project.save();

    return ResponseHelper.success(res, {
      message: 'Employee assigned to project successfully'
    });
  } catch (error) {
    console.error('Error in assignEmployeeToProject:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const removeEmployeeFromProject = async (req, res) => {
  try {
    const { employeeId, projectId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access
    if (req.user.role === 'CompanyAdmin') {
      if (employee.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
      if (project.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
      }
    }

    // Remove project assignment from employee
    const assignment = employee.assignedProjects.find(
      assignment => assignment.project.toString() === projectId && assignment.isActive
    );

    if (assignment) {
      assignment.isActive = false;
      await employee.save();
    }

    // Remove employee from project team
    const teamMember = project.team.find(
      member => member.member.toString() === employeeId && member.isActive
    );

    if (teamMember) {
      teamMember.isActive = false;
      teamMember.removedDate = new Date();
      await project.save();
    }

    return ResponseHelper.success(res, {
      message: 'Employee removed from project successfully'
    });
  } catch (error) {
    console.error('Error in removeEmployeeFromProject:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Dashboard & Analytics Controllers
const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId)
      .populate('company', 'name status')
      .populate('assignedProjects.project', 'title status projectType progress')
      .populate('currentTasks.task', 'title status priority dueDate progress');

    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: employeeId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          overdueTasks: { $sum: { $cond: [{ $lt: ['$dueDate', new Date()] }, 1, 0] } },
          totalHours: { $sum: '$actualHours' }
        }
      }
    ]);

    // Get project statistics
    const projectStats = await Project.aggregate([
      { $match: { 'team.member': employeeId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Get recent activities
    const recentTasks = await Task.find({ assignedTo: employeeId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('project', 'title');

    const dashboard = {
      employee: {
        id: employee._id,
        name: employee.fullName,
        department: employee.department,
        role: employee.role,
        designation: employee.designation,
        company: employee.company
      },
      statistics: {
        tasks: taskStats[0] || {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
          totalHours: 0
        },
        projects: projectStats[0] || {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          avgProgress: 0
        }
      },
      currentWork: {
        assignedProjects: employee.assignedProjects.filter(assignment => assignment.isActive),
        currentTasks: employee.currentTasks.filter(task => task.status !== 'completed')
      },
      recentActivities: recentTasks
    };

    return ResponseHelper.success(res, {
      message: 'Dashboard data retrieved successfully',
      dashboard
    });
  } catch (error) {
    console.error('Error in getEmployeeDashboard:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getEmployeeStats = async (req, res) => {
  try {
    const { company: companyFilter, department, role } = req.query;
    const filter = {};

    // Company-specific filtering
    if (req.user.role === 'CompanyAdmin') {
      filter.company = req.user.company;
    } else if (companyFilter) {
      filter.company = companyFilter;
    }

    // Department filtering
    if (department) {
      filter.department = department;
    }

    // Role filtering
    if (role) {
      filter.role = role;
    }

    const stats = await Employee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          lockedAccounts: { $sum: { $cond: [{ $gt: ['$lockUntil', new Date()] }, 1, 0] } },
          avgRating: { $avg: '$performance.averageRating' }
        }
      }
    ]);

    // Department distribution
    const departmentStats = await Employee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgRating: { $avg: '$performance.averageRating' }
        }
      }
    ]);

    // Role distribution
    const roleStats = await Employee.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgRating: { $avg: '$performance.averageRating' }
        }
      }
    ]);

    const result = {
      overview: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        lockedAccounts: 0,
        avgRating: 0
      },
      departmentDistribution: departmentStats,
      roleDistribution: roleStats
    };

    return ResponseHelper.success(res, {
      message: 'Employee statistics retrieved successfully',
      stats: result
    });
  } catch (error) {
    console.error('Error in getEmployeeStats:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

module.exports = {
  // Employee Authentication
  employeeLogin,
  employeeLogout,

  // Employee Management
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeePassword,
  deleteEmployee,
  reactivateEmployee,

  // Project Assignment
  assignEmployeeToProject,
  removeEmployeeFromProject,

  // Dashboard & Analytics
  getEmployeeDashboard,
  getEmployeeStats
};
