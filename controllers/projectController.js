const Project = require('../models/Project');
const Client = require('../models/Client');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const ResponseHelper = require('../utils/responseHelper');

// Project Creation & Management
const createProject = async (req, res) => {
  try {
    console.log('Create project request received:', {
      body: req.body,
      user: req.user
    });

    const {
      title,
      description,
      shortDescription,
      projectType,
      category,
      digitalMarketing,
      development,
      client,
      company,
      startDate,
      endDate,
      estimatedDuration,
      budget,
      billing,
      projectManager,
      team,
      phases,
      communication,
      tags,
      notes
    } = req.body;

    // Validate required fields
    if (!title || !description || !projectType || !category || !client || !startDate || !endDate || !estimatedDuration || !budget?.total) {
      return ResponseHelper.error(res, 'Missing required fields', 400);
    }

    // Validate project type specific fields
    if (projectType === 'digital-marketing' && !digitalMarketing?.serviceType) {
      return ResponseHelper.error(res, 'Digital marketing service type is required', 400);
    }

    if (projectType === 'development' && !development?.platform) {
      return ResponseHelper.error(res, 'Development platform is required', 400);
    }

    // Check if client exists and is active
    const clientExists = await Client.findById(client);
    if (!clientExists || !clientExists.isActive) {
      return ResponseHelper.error(res, 'Client not found or inactive', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && clientExists.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
    }

    // Check if project manager exists and has access
    if (projectManager) {
      console.log('Checking project manager:', projectManager);
      const manager = await Admin.findById(projectManager);
      if (!manager || !manager.isActive) {
        return ResponseHelper.error(res, 'Project manager not found or inactive', 404);
      }

      // Check if manager belongs to the same company
      if (req.user.role !== 'superAdmin' && manager.company.toString() !== req.user.company.toString()) {
        return ResponseHelper.error(res, 'Access denied. Project manager belongs to different company.', 403);
      }
    }

    // Validate team members if provided
    if (team && team.length > 0) {
      console.log('Validating team members:', team);
      for (const member of team) {
        if (member.member) {
          const Employee = require('../models/Employee');
          const employee = await Employee.findById(member.member);
          if (!employee || !employee.isActive) {
            return ResponseHelper.error(res, `Team member ${member.member} not found or inactive`, 404);
          }
        }
      }
    }

    // Create project data
    const projectData = {
      title,
      description,
      shortDescription,
      projectType,
      category,
      digitalMarketing: projectType === 'digital-marketing' ? digitalMarketing : undefined,
      development: projectType === 'development' ? development : undefined,
      client,
      company: clientExists.company, // Use client's company
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      estimatedDuration,
      budget: {
        total: budget.total,
        allocated: budget.allocated || 0,
        spent: budget.spent || 0,
        currency: budget.currency || 'USD'
      },
      billing: billing || { type: 'fixed' },
      projectManager: projectManager || req.user.id,
      team: team || [],
      phases: phases || [],
      communication: communication || { channels: ['email'], frequency: 'weekly' },
      tags: tags || [],
      notes: notes ? [{
        content: notes,
        createdBy: req.user.id
      }] : [],
      createdBy: req.user.id
    };

    // Add creator to team if not already included
    if (!projectData.team.find(member => member.member.toString() === req.user.id)) {
      projectData.team.push({
        member: req.user.id,
        role: 'Creator',
        assignedDate: new Date(),
        isActive: true
      });
    }

    console.log('Creating project with data:', projectData);
    const project = await Project.create(projectData);
    console.log('Project created successfully:', project._id);

    // Update client project statistics
    clientExists.totalProjects += 1;
    clientExists.activeProjects += 1;
    await clientExists.save();

    // Populate references for response
    await project.populate([
      { path: 'client', select: 'firstName lastName email companyName' },
      { path: 'company', select: 'name status' },
      { path: 'projectManager', select: 'firstName lastName email' },
      { path: 'team.member', select: 'firstName lastName email' }
    ]);

    return ResponseHelper.success(res, {
      message: 'Project created successfully',
      project
    }, 201);
  } catch (error) {
    console.error('Error in createProject:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      projectType,
      category,
      priority,
      client,
      company: companyFilter,
      startDate,
      endDate
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

    // Project type filtering
    if (projectType) {
      filter.projectType = projectType;
    }

    // Category filtering
    if (category) {
      filter.category = category;
    }

    // Priority filtering
    if (priority) {
      filter.priority = priority;
    }

    // Client filtering
    if (client) {
      filter.client = client;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
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
        { path: 'client', select: 'firstName lastName email companyName' },
        { path: 'company', select: 'name status' },
        { path: 'projectManager', select: 'firstName lastName email' },
        { path: 'team.member', select: 'firstName lastName email' }
      ],
      sort: { createdAt: -1 }
    };

    const projects = await Project.paginate(filter, options);

    return ResponseHelper.success(res, {
      message: 'Projects retrieved successfully',
      projects
    });
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('client', 'firstName lastName email companyName industry businessType')
      .populate('company', 'name status industry')
      .populate('projectManager', 'firstName lastName email role')
      .populate('team.member', 'firstName lastName email role')
      .populate('phases.deliverables.assignedTo', 'firstName lastName email')
      .populate('phases.tasks.assignedTo', 'firstName lastName email')
      .populate('risks.assignedTo', 'firstName lastName email')
      .populate('issues.reportedBy', 'firstName lastName email')
      .populate('issues.assignedTo', 'firstName lastName email')
      .populate('documents.uploadedBy', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName email');

    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin') {
      // For non-superAdmin users, company might be null, so we need to handle this case
      if (!req.user.company) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      // Handle populated company object vs ObjectId
      const projectCompanyId = project.company._id || project.company;
      const userCompanyId = req.user.company;
      
      console.log('🔍 Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        userCompanyType: typeof userCompanyId,
        projectCompany: projectCompanyId,
        projectCompanyType: typeof projectCompanyId,
        userCompanyStr: userCompanyId.toString(),
        projectCompanyStr: projectCompanyId.toString(),
        companiesMatch: projectCompanyId.toString() === userCompanyId.toString()
      });
      
      if (projectCompanyId.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
      }
    }

    return ResponseHelper.success(res, {
      message: 'Project retrieved successfully',
      project
    });
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.client;
    delete updateData.company;
    delete updateData.createdBy;

    // Handle phases update
    if (updateData.phases) {
      // Ensure phases have proper structure
      updateData.phases = updateData.phases.map(phase => ({
        ...phase,
        deliverables: phase.deliverables || [],
        tasks: phase.tasks || [],
        budget: phase.budget || { allocated: 0, spent: 0, currency: 'USD' }
      }));
    }

    // Add update note if provided
    if (updateData.notes) {
      updateData.notes = [
        ...project.notes,
        {
          content: updateData.notes,
          createdBy: req.user.id
        }
      ];
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate([
      { path: 'client', select: 'firstName lastName email companyName' },
      { path: 'company', select: 'name status' },
      { path: 'projectManager', select: 'firstName lastName email' },
      { path: 'team.member', select: 'firstName lastName email' }
    ]);

    return ResponseHelper.success(res, {
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error in updateProject:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    // Soft delete
    project.status = 'archived';
    await project.save();

    // Update client project statistics
    const client = await Client.findById(project.client);
    if (client) {
      client.activeProjects = Math.max(0, client.activeProjects - 1);
      await client.save();
    }

    return ResponseHelper.success(res, {
      message: 'Project archived successfully'
    });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Project Phase Management
const addProjectPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const phaseData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    // Validate phase data
    if (!phaseData.name) {
      return ResponseHelper.error(res, 'Phase name is required', 400);
    }

    // Add phase
    const newPhase = {
      name: phaseData.name,
      description: phaseData.description,
      startDate: phaseData.startDate ? new Date(phaseData.startDate) : undefined,
      endDate: phaseData.endDate ? new Date(phaseData.endDate) : undefined,
      status: phaseData.status || 'pending',
      progress: phaseData.progress || 0,
      deliverables: phaseData.deliverables || [],
      tasks: phaseData.tasks || [],
      budget: {
        allocated: phaseData.budget?.allocated || 0,
        spent: phaseData.budget?.spent || 0,
        currency: phaseData.budget?.currency || 'USD'
      }
    };

    project.phases.push(newPhase);
    await project.save();

    return ResponseHelper.success(res, {
      message: 'Phase added successfully',
      phase: newPhase
    });
  } catch (error) {
    console.error('Error in addProjectPhase:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const updateProjectPhase = async (req, res) => {
  try {
    const { id, phaseId } = req.params;
    const updateData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    const phase = project.phases.id(phaseId);
    if (!phase) {
      return ResponseHelper.error(res, 'Phase not found', 404);
    }

    // Update phase
    Object.assign(phase, updateData);
    await project.save();

    return ResponseHelper.success(res, {
      message: 'Phase updated successfully',
      phase
    });
  } catch (error) {
    console.error('Error in updateProjectPhase:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Project Team Management
const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { member, role } = req.body;

    if (!member || !role) {
      return ResponseHelper.error(res, 'Member ID and role are required', 400);
    }

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    // Check if member exists and is active
    const teamMember = await Admin.findById(member);
    if (!teamMember || !teamMember.isActive) {
      return ResponseHelper.error(res, 'Team member not found or inactive', 404);
    }

    // Check if member belongs to the same company
    if (req.user.role !== 'superAdmin' && teamMember.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Team member belongs to different company.', 403);
    }

    // Check if member is already in team
    const existingMember = project.team.find(tm => tm.member.toString() === member);
    if (existingMember && existingMember.isActive) {
      return ResponseHelper.error(res, 'Member is already in the team', 400);
    }

    // Add or reactivate team member
    if (existingMember) {
      existingMember.isActive = true;
      existingMember.role = role;
      existingMember.removedDate = undefined;
    } else {
      project.team.push({
        member,
        role,
        assignedDate: new Date(),
        isActive: true
      });
    }

    await project.save();

    return ResponseHelper.success(res, {
      message: 'Team member added successfully'
    });
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    const teamMember = project.team.id(memberId);
    if (!teamMember) {
      return ResponseHelper.error(res, 'Team member not found', 404);
    }

    // Remove team member
    teamMember.isActive = false;
    teamMember.removedDate = new Date();
    await project.save();

    return ResponseHelper.success(res, {
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error in removeTeamMember:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Project Issues & Risks Management
const addProjectIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issueData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    // Validate issue data
    if (!issueData.title || !issueData.description) {
      return ResponseHelper.error(res, 'Issue title and description are required', 400);
    }

    // Add issue
    const newIssue = {
      title: issueData.title,
      description: issueData.description,
      severity: issueData.severity || 'medium',
      status: 'open',
      reportedBy: req.user.id,
      assignedTo: issueData.assignedTo,
      reportedAt: new Date()
    };

    project.issues.push(newIssue);
    await project.save();

    return ResponseHelper.success(res, {
      message: 'Issue added successfully',
      issue: newIssue
    });
  } catch (error) {
    console.error('Error in addProjectIssue:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const addProjectRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const riskData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return ResponseHelper.error(res, 'Project not found', 404);
    }

    // Check company access (all non-superAdmin roles should be restricted to their company)
    if (req.user.role !== 'superAdmin' && project.company.toString() !== req.user.company.toString()) {
      return ResponseHelper.error(res, 'Access denied. Project belongs to different company.', 403);
    }

    // Validate risk data
    if (!riskData.description) {
      return ResponseHelper.error(res, 'Risk description is required', 400);
    }

    // Add risk
    const newRisk = {
      description: riskData.description,
      probability: riskData.probability || 'medium',
      impact: riskData.impact || 'medium',
      mitigation: riskData.mitigation,
      status: 'identified',
      assignedTo: riskData.assignedTo
    };

    project.risks.push(newRisk);
    await project.save();

    return ResponseHelper.success(res, {
      message: 'Risk added successfully',
      risk: newRisk
    });
  } catch (error) {
    console.error('Error in addProjectRisk:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Project Statistics & Analytics
const getProjectStats = async (req, res) => {
  try {
    const { company: companyFilter, projectType, status } = req.query;
    const filter = {};

    // Company-specific filtering
    if (req.user.role !== 'superAdmin') {
      filter.company = req.user.company;
    } else if (companyFilter) {
      filter.company = companyFilter;
    }

    // Project type filtering
    if (projectType) {
      filter.projectType = projectType;
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    const stats = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          planningProjects: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } },
          onHoldProjects: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          totalBudget: { $sum: '$budget.total' },
          totalSpent: { $sum: '$budget.spent' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Project type distribution
    const typeStats = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$projectType',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget.total' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Status distribution
    const statusStats = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget.total' }
        }
      }
    ]);

    // Priority distribution
    const priorityStats = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      overview: stats[0] || {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        planningProjects: 0,
        onHoldProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        avgProgress: 0
      },
      typeDistribution: typeStats,
      statusDistribution: statusStats,
      priorityDistribution: priorityStats
    };

    return ResponseHelper.success(res, {
      message: 'Project statistics retrieved successfully',
      stats: result
    });
  } catch (error) {
    console.error('Error in getProjectStats:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Client Project Creation (Client can create their own projects)
const createClientProject = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      projectType,
      category,
      digitalMarketing,
      development,
      startDate,
      endDate,
      estimatedDuration,
      budget,
      tags,
      notes
    } = req.body;

    // Validate required fields
    if (!title || !description || !projectType || !category || !startDate || !endDate || !estimatedDuration || !budget?.total) {
      return ResponseHelper.error(res, 'Missing required fields', 400);
    }

    // Get client from authenticated user (assuming client authentication middleware)
    const clientId = req.user.id; // This should be set by client auth middleware

    const client = await Client.findById(clientId);
    if (!client || !client.isActive) {
      return ResponseHelper.error(res, 'Client not found or inactive', 404);
    }

    // Create project data
    const projectData = {
      title,
      description,
      shortDescription,
      projectType,
      category,
      digitalMarketing: projectType === 'digital-marketing' ? digitalMarketing : undefined,
      development: projectType === 'development' ? development : undefined,
      client: clientId,
      company: client.company,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      estimatedDuration,
      budget: {
        total: budget.total,
        allocated: budget.allocated || 0,
        spent: budget.spent || 0,
        currency: budget.currency || 'USD'
      },
      billing: { type: 'fixed' },
      projectManager: client.assignedBy, // Assign to the admin who assigned the client
      team: [],
      phases: [],
      communication: { channels: ['email'], frequency: 'weekly' },
      tags: tags || [],
      notes: notes ? [{
        content: notes,
        createdBy: clientId
      }] : [],
      createdBy: clientId
    };

    const project = await Project.create(projectData);

    // Update client project statistics
    client.totalProjects += 1;
    client.activeProjects += 1;
    await client.save();

    // Populate references for response
    await project.populate([
      { path: 'client', select: 'firstName lastName email companyName' },
      { path: 'company', select: 'name status' },
      { path: 'projectManager', select: 'firstName lastName email' }
    ]);

    return ResponseHelper.success(res, {
      message: 'Project created successfully',
      project
    }, 201);
  } catch (error) {
    console.error('Error in createClientProject:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

module.exports = {
  // Project Management
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,

  // Phase Management
  addProjectPhase,
  updateProjectPhase,

  // Team Management
  addTeamMember,
  removeTeamMember,

  // Issues & Risks
  addProjectIssue,
  addProjectRisk,

  // Analytics
  getProjectStats,

  // Client Project Creation
  createClientProject
};
