const Task = require('../models/Task');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Client = require('../models/Client');
const Company = require('../models/Company');
const ResponseHelper = require('../utils/responseHelper');

// Task Creation & Management
const createTask = async (req, res) => {
  try {
    console.log('Create task request received:', {
      body: req.body,
      user: req.user,
      userId: req.user?.id,
      userRole: req.user?.role
    });

    const {
      title,
      description,
      shortDescription,
      project,
      client,
      type,
      category,
      priority,
      complexity,
      assignedTo,
      startDate,
      dueDate,
      estimatedHours,
      budget,
      deliverables,
      requirements,
      tags,
      labels,
      dependencies,
      parentTask
    } = req.body;

    // Validate required fields
    if (!title || !description || !project || !client || !type || !category || !assignedTo || !startDate || !dueDate || !estimatedHours) {
      return ResponseHelper.error(res, 'Missing required fields', 400);
    }

    // Check if project exists
    console.log('Checking project:', project);
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      console.log('Project not found:', project);
      return ResponseHelper.error(res, 'Project not found', 404);
    }
    console.log('Project found:', projectExists._id);

    // Check if client exists and is active
    console.log('Checking client:', client);
    const clientExists = await Client.findById(client);
    if (!clientExists || !clientExists.isActive) {
      console.log('Client not found or inactive:', client);
      return ResponseHelper.error(res, 'Client not found or inactive', 404);
    }
    console.log('Client found:', clientExists._id);

    // Check if assigned employee exists and is active
    console.log('Checking employee:', assignedTo);
    const employeeExists = await Employee.findById(assignedTo);
    if (!employeeExists || !employeeExists.isActive) {
      console.log('Employee not found or inactive:', assignedTo);
      return ResponseHelper.error(res, 'Assigned employee not found or inactive', 404);
    }
    console.log('Employee found:', employeeExists._id);

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin') {
      // For superAdmin users, company might be null, so we need to handle this case
      if (!req.user.company) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (projectExists.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
      }
      if (clientExists.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
      }
      if (employeeExists.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Check dependencies if provided
    if (dependencies && dependencies.length > 0) {
      for (const dep of dependencies) {
        const depTask = await Task.findById(dep.task);
        if (!depTask) {
          return ResponseHelper.error(res, `Dependency task ${dep.task} not found`, 404);
        }
      }
    }

    // Check parent task if provided
    if (parentTask) {
      const parentTaskExists = await Task.findById(parentTask);
      if (!parentTaskExists) {
        return ResponseHelper.error(res, 'Parent task not found', 404);
      }
    }

    // Create task data
    const taskData = {
      title,
      description,
      shortDescription,
      project,
      client,
      company: projectExists.company, // Use project's company
      type,
      category,
      priority,
      complexity,
      assignedTo,
      assignedBy: req.user.id,
      assignedByModel: req.user.role === 'superAdmin' || req.user.role === 'admin' ? 'User' : 'Admin',
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      estimatedHours,
      budget: budget || { allocated: 0, spent: 0, currency: 'USD' },
      deliverables: deliverables || [],
      requirements: requirements || [],
      tags: tags || [],
      labels: labels || [],
      dependencies: dependencies || [],
      parentTask,
      createdBy: req.user.id,
      createdByModel: req.user.role === 'superAdmin' || req.user.role === 'admin' ? 'User' : 'Admin'
    };

    console.log('Creating task with data:', taskData);
    const task = await Task.create(taskData);
    console.log('Task created successfully:', task._id);

    // Update employee current tasks
    console.log('Updating employee current tasks');
    employeeExists.currentTasks.push({
      task: task._id,
      assignedDate: new Date(),
      dueDate: new Date(dueDate),
      priority,
      status: 'pending'
    });
    await employeeExists.save();
    console.log('Employee current tasks updated');

    // Update parent task if this is a sub-task
    if (parentTask) {
      const parent = await Task.findById(parentTask);
      if (parent) {
        parent.subTasks.push(task._id);
        await parent.save();
      }
    }

    // Populate references for response
    await task.populate([
      { path: 'project', select: 'title status projectType' },
      { path: 'client', select: 'firstName lastName companyName' },
      { path: 'assignedTo', select: 'firstName lastName email department' },
      { path: 'assignedBy', select: 'firstName lastName email' },
      { path: 'company', select: 'name status' }
    ]);

    return ResponseHelper.success(res, {
      message: 'Task created successfully',
      task
    }, 201);
  } catch (error) {
    console.error('Error in createTask:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      type,
      category,
      project,
      client,
      assignedTo,
      company: companyFilter,
      startDate,
      endDate,
      overdue
    } = req.query;

    const filter = {};

    // Company-specific filtering
    if (req.user.role !== 'superAdmin') {
      filter.company = req.user.company;
    } else if (companyFilter) {
      filter.company = companyFilter;
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    // Priority filtering
    if (priority) {
      filter.priority = priority;
    }

    // Type filtering
    if (type) {
      filter.type = type;
    }

    // Category filtering
    if (category) {
      filter.category = category;
    }

    // Project filtering
    if (project) {
      filter.project = project;
    }

    // Client filtering
    if (client) {
      filter.client = client;
    }

    // Assigned employee filtering
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    // Overdue tasks filtering
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $nin: ['completed', 'cancelled'] };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'project', select: 'title status projectType' },
        { path: 'client', select: 'firstName lastName companyName' },
        { path: 'assignedTo', select: 'firstName lastName email department' },
        { path: 'assignedBy', select: 'firstName lastName email' },
        { path: 'company', select: 'name status' }
      ],
      sort: { dueDate: 1, priority: -1 }
    };

    const tasks = await Task.paginate(filter, options);

    return ResponseHelper.success(res, {
      message: 'Tasks retrieved successfully',
      tasks
    });
  } catch (error) {
    console.error('Error in getAllTasks:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('project', 'title status projectType progress')
      .populate('client', 'firstName lastName companyName industry')
      .populate('assignedTo', 'firstName lastName email department role')
      .populate('assignedBy', 'firstName lastName email')
      .populate('company', 'name status industry')
      .populate('teamMembers.employee', 'firstName lastName email department')
      .populate('dependencies.task', 'title status priority dueDate')
      .populate('parentTask', 'title status priority')
      .populate('subTasks', 'title status priority dueDate progress')
      .populate('timeEntries.employee', 'firstName lastName email')
      .populate('reviewComments.reviewer', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName email')
      .populate('updates.updatedBy', 'firstName lastName email');

    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && task.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
    }

    return ResponseHelper.success(res, {
      message: 'Task retrieved successfully',
      task
    });
  } catch (error) {
    console.error('Error in getTaskById:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && task.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.company;
    delete updateData.createdBy;

    // Handle status change
    if (updateData.status && updateData.status !== task.status) {
      // Add update record
      updateData.updates = [
        ...task.updates,
        {
          field: 'status',
          oldValue: task.status,
          newValue: updateData.status,
          updatedBy: req.user.id,
          updateDate: new Date()
        }
      ];

      // Update completion date if status changes to completed
      if (updateData.status === 'completed' && !task.completionDate) {
        updateData.completionDate = new Date();
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate([
      { path: 'project', select: 'title status projectType' },
      { path: 'client', select: 'firstName lastName companyName' },
      { path: 'assignedTo', select: 'firstName lastName email department' },
      { path: 'assignedBy', select: 'firstName lastName email' },
      { path: 'company', select: 'name status' }
    ]);

    return ResponseHelper.success(res, {
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && task.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
    }

    // Check if task has active dependencies
    const hasActiveDependencies = await Task.findOne({
      dependencies: { $elemMatch: { task: id } },
      status: { $nin: ['completed', 'cancelled'] }
    });

    if (hasActiveDependencies) {
      return ResponseHelper.error(res, 'Cannot delete task with active dependencies. Please complete or cancel dependent tasks first.', 400);
    }

    // Remove from employee's current tasks
    await Employee.updateMany(
      { 'currentTasks.task': id },
      { $pull: { currentTasks: { task: id } } }
    );

    // Remove from parent task if this is a sub-task
    if (task.parentTask) {
      await Task.findByIdAndUpdate(
        task.parentTask,
        { $pull: { subTasks: id } }
      );
    }

    // Soft delete
    task.status = 'cancelled';
    await task.save();

    return ResponseHelper.success(res, {
      message: 'Task cancelled successfully'
    });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Task Assignment & Team Management
const assignTaskToEmployee = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    const { role } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.isActive) {
      return ResponseHelper.error(res, 'Employee not found or inactive', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin') {
      if (task.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
      }
      if (employee.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Check if employee is already assigned
    const existingAssignment = task.teamMembers.find(
      member => member.employee.toString() === employeeId && member.isActive
    );

    if (existingAssignment) {
      return ResponseHelper.error(res, 'Employee is already assigned to this task', 400);
    }

    // Add employee to task team
    task.teamMembers.push({
      employee: employeeId,
      role: role || 'Contributor',
      assignedDate: new Date(),
      isActive: true
    });

    // Update main assignment if this is the primary assignee
    if (task.assignedTo.toString() === employeeId) {
      // Employee is already the main assignee
    } else {
      // Add to employee's current tasks
      employee.currentTasks.push({
        task: task._id,
        assignedDate: new Date(),
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status
      });
      await employee.save();
    }

    await task.save();

    return ResponseHelper.success(res, {
      message: 'Employee assigned to task successfully'
    });
  } catch (error) {
    console.error('Error in assignTaskToEmployee:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const removeEmployeeFromTask = async (req, res) => {
  try {
    const { id, employeeId } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return ResponseHelper.error(res, 'Employee not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin') {
      if (task.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
      }
      if (employee.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Employee belongs to different company.', 403);
      }
    }

    // Remove from task team
    const teamMember = task.teamMembers.find(
      member => member.employee.toString() === employeeId && member.isActive
    );

    if (teamMember) {
      teamMember.isActive = false;
      await task.save();
    }

    // Remove from employee's current tasks
    await Employee.findByIdAndUpdate(
      employeeId,
      { $pull: { currentTasks: { task: task._id } } }
    );

    return ResponseHelper.success(res, {
      message: 'Employee removed from task successfully'
    });
  } catch (error) {
    console.error('Error in removeEmployeeFromTask:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Time Tracking & Progress
const addTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, description, isBillable } = req.body;

    if (!startTime || !description) {
      return ResponseHelper.error(res, 'Start time and description are required', 400);
    }

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && task.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
    }

    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== req.user.id && 
        !task.teamMembers.find(member => member.employee.toString() === req.user.id && member.isActive)) {
      return ResponseHelper.error(res, 'Access denied. You are not assigned to this task.', 403);
    }

    // Add time entry
    await task.addTimeEntry(req.user.id, new Date(startTime), endTime ? new Date(endTime) : null, description, isBillable !== false);

    return ResponseHelper.success(res, {
      message: 'Time entry added successfully'
    });
  } catch (error) {
    console.error('Error in addTimeEntry:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status, comment } = req.body;

    if (progress === undefined && !status && !comment) {
      return ResponseHelper.error(res, 'At least one field to update is required', 400);
    }

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && task.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
    }

    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== req.user.id && 
        !task.teamMembers.find(member => member.employee.toString() === req.user.id && member.isActive)) {
      return ResponseHelper.error(res, 'Access denied. You are not assigned to this task.', 403);
    }

    const updateData = {};

    // Update progress
    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        return ResponseHelper.error(res, 'Progress must be between 0 and 100', 400);
      }
      updateData.progress = progress;
    }

    // Update status
    if (status) {
      updateData.status = status;
      if (status === 'completed' && !task.completionDate) {
        updateData.completionDate = new Date();
      }
    }

    // Add comment if provided
    if (comment) {
      await task.addComment(req.user.id, comment);
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    return ResponseHelper.success(res, {
      message: 'Task progress updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error in updateTaskProgress:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Task Comments & Communication
const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isInternal } = req.body;

    if (!content) {
      return ResponseHelper.error(res, 'Comment content is required', 400);
    }

    const task = await Task.findById(id);
    if (!task) {
      return ResponseHelper.error(res, 'Task not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && task.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Task belongs to different company.', 403);
    }

    // Add comment
    await task.addComment(req.user.id, content, isInternal === true);

    return ResponseHelper.success(res, {
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error in addTaskComment:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Task Analytics & Statistics
const getTaskStats = async (req, res) => {
  try {
    const { company: companyFilter, project, status, priority, type, assignedTo } = req.query;
    const filter = {};

    // Company-specific filtering
    if (req.user.role !== 'superAdmin') {
      filter.company = req.user.company;
    } else if (companyFilter) {
      filter.company = companyFilter;
    }

    // Project filtering
    if (project) {
      filter.project = project;
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    // Priority filtering
    if (priority) {
      filter.priority = priority;
    }

    // Type filtering
    if (type) {
      filter.type = type;
    }

    // Assigned employee filtering
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          pendingTasks: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          overdueTasks: { $sum: { $cond: [{ $lt: ['$dueDate', new Date()] }, 1, 0] } },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalActualHours: { $sum: '$actualHours' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Status distribution
    const statusStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Type distribution
    const typeStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const result = {
      overview: stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        totalEstimatedHours: 0,
        totalActualHours: 0,
        avgProgress: 0
      },
      priorityDistribution: priorityStats,
      statusDistribution: statusStats,
      typeDistribution: typeStats
    };

    return ResponseHelper.success(res, {
      message: 'Task statistics retrieved successfully',
      stats: result
    });
  } catch (error) {
    console.error('Error in getTaskStats:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

module.exports = {
  // Task Management
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,

  // Task Assignment & Team
  assignTaskToEmployee,
  removeEmployeeFromTask,

  // Time Tracking & Progress
  addTimeEntry,
  updateTaskProgress,

  // Communication
  addTaskComment,

  // Analytics
  getTaskStats
};
