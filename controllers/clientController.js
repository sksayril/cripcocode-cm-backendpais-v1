const Client = require('../models/Client');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../env');
const ResponseHelper = require('../utils/responseHelper');

// Generate JWT Token for Client
const generateClientToken = (clientId) => {
  return jwt.sign(
    { 
      id: clientId, 
      type: 'client',
      iat: Math.floor(Date.now() / 1000)
    },
    config.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Client Authentication Controllers
const clientSignup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      companyName,
      industry,
      businessType,
      address,
      website,
      socialMedia,
      communicationPreferences,
      timezone,
      language
    } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return ResponseHelper.error(res, 'Client with this email already exists', 400);
    }

    // For client signup, they need to be assigned to a company by super admin
    // So we'll create the client with pending status
    const clientData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || "client", // Default to "client" if not provided
      companyName,
      industry,
      businessType,
      address,
      website,
      socialMedia,
      communicationPreferences,
      timezone,
      language,
      status: 'pending',
      isActive: false, // Will be activated when assigned to company
      company: null, // Will be set when assigned by super admin
      createdBy: null, // No admin for self-signup
      assignedBy: null // No admin for self-signup
    };

    const client = await Client.create(clientData);

    // Generate token
    const token = generateClientToken(client._id);

    // Update last login
    client.lastLogin = new Date();
    await client.save();

    // Remove password from response
    client.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Client account created successfully. Pending company assignment.',
      client,
      token
    }, 201);
  } catch (error) {
    console.error('Error in clientSignup:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return ResponseHelper.error(res, 'Please provide email and password', 400);
    }

    // Check if client exists and password is correct
    const client = await Client.findOne({ email }).select('+password');
    if (!client) {
      return ResponseHelper.error(res, 'Incorrect email or password', 401);
    }

    // Debug: Check if password exists and compare
    console.log('Client found:', client.email);
    console.log('Has password:', !!client.password);
    console.log('Password length:', client.password ? client.password.length : 0);
    
    const isPasswordValid = await client.comparePassword(password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return ResponseHelper.error(res, 'Incorrect email or password', 401);
    }

    // Check if client is active
    if (!client.isActive) {
      return ResponseHelper.error(res, 'Account is deactivated. Please contact support.', 401);
    }

    // Check if client is locked
    if (client.isLocked) {
      return ResponseHelper.error(res, 'Account is temporarily locked due to multiple failed login attempts', 401);
    }

    // Check if client is assigned to a company
    if (!client.company) {
      return ResponseHelper.error(res, 'Account not yet assigned to a company. Please contact support.', 401);
    }

    // Reset login attempts on successful login
    await client.resetLoginAttempts();

    // Update last login
    client.lastLogin = new Date();
    await client.save();

    // Generate token
    const token = generateClientToken(client._id);

    // Remove password from response
    client.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Login successful',
      client,
      token
    });
  } catch (error) {
    console.error('Error in clientLogin:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const clientLogout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    return ResponseHelper.success(res, {
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error in clientLogout:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Client Management Controllers (Admin/Super Admin)
const createClient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      companyName,
      industry,
      businessType,
      address,
      website,
      socialMedia,
      communicationPreferences,
      timezone,
      language,
      company, // Company ID to assign the client to
      notes
    } = req.body;

    // Validate company assignment
    if (!company) {
      return ResponseHelper.error(res, 'Company assignment is required', 400);
    }

    // Check if company exists and is active
    const companyExists = await Company.findById(company);
    if (!companyExists || !companyExists.isActive) {
      return ResponseHelper.error(res, 'Company not found or inactive', 404);
    }

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return ResponseHelper.error(res, 'Client with this email already exists', 400);
    }

    // Create client
    const clientData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || "client", // Default to "client" if not provided
      companyName,
      industry,
      businessType,
      address,
      website,
      socialMedia,
      communicationPreferences,
      timezone,
      language,
      company,
      status: 'active',
      isActive: true,
      createdBy: req.user.id,
      assignedBy: req.user.id
    };

    if (notes) {
      clientData.notes = [{
        content: notes,
        createdBy: req.user.id
      }];
    }

    const client = await Client.create(clientData);

    // Update company statistics
    await companyExists.updateStats();

    // Remove password from response
    client.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Client created and assigned to company successfully',
      client
    }, 201);
  } catch (error) {
    console.error('Error in createClient:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      industry,
      businessType,
      company
    } = req.query;

    // Build filter object
    const filter = {};

    // Company filter (CompanyAdmin can only see their company's clients)
    if (req.user.role === 'CompanyAdmin') {
      filter.company = req.user.company;
    } else if (company) {
      filter.company = company;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Industry filter
    if (industry) {
      filter.industry = industry;
    }

    // Business type filter
    if (businessType) {
      filter.businessType = businessType;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
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
        { path: 'createdBy', select: 'firstName lastName' }
      ],
      sort: { createdAt: -1 }
    };

    const clients = await Client.paginate(filter, options);

    return ResponseHelper.success(res, {
      message: 'Clients retrieved successfully',
      clients
    });
  } catch (error) {
    console.error('Error in getAllClients:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('getClientById called with ID:', id);
    console.log('User info:', { role: req.user?.role, company: req.user?.company });

    // Get client with plain password field included
    const client = await Client.findById(id)
      .select('+plainPassword')
      .populate({
        path: 'company',
        select: '-__v' // Exclude version key, include all other fields including virtuals
      })
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email');

    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    console.log('Client found:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      company: client.company
    });

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const clientCompanyId = client.company?._id || client.company;
      const userCompanyId = req.user.company;
      
      console.log('Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        userCompanyType: typeof userCompanyId,
        clientCompany: clientCompanyId,
        clientCompanyType: typeof clientCompanyId,
        userCompanyStr: userCompanyId?.toString(),
        clientCompanyStr: clientCompanyId?.toString(),
        companiesMatch: clientCompanyId?.toString() === userCompanyId?.toString()
      });
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (clientCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
      }
    }

    // Convert client to object and include both passwords
    const clientData = client.toObject();
    
    // Get the original plain text password (if stored)
    // Note: For clients created before plainPassword field was added, this will be null
    const originalPassword = clientData.plainPassword || client.plainPassword || null;
    
    // Debug logging
    console.log('Password retrieval debug:', {
      hasPlainPassword: !!(clientData.plainPassword || client.plainPassword),
      plainPasswordValue: (clientData.plainPassword || client.plainPassword) ? '***' : null,
      hasHashedPassword: !!clientData.password,
      clientPlainPassword: !!client.plainPassword,
      clientDataPlainPassword: !!clientData.plainPassword
    });
    
    // Build comprehensive company assignment information
    // Check if company is assigned - handle both populated object and ObjectId
    const companyId = clientData.company?._id || clientData.company;
    const isAssigned = !!(companyId && companyId.toString() !== 'null' && companyId.toString() !== 'undefined');
    
    // Get company details - if populated, use it; otherwise it's just an ID
    let companyDetails = null;
    if (isAssigned && clientData.company && typeof clientData.company === 'object' && clientData.company.name) {
      // Company is populated with full details
      companyDetails = {
        _id: clientData.company._id || clientData.company,
        name: clientData.company.name || null,
        email: clientData.company.email || null,
        phone: clientData.company.phone || null,
        description: clientData.company.description || null,
        industry: clientData.company.industry || null,
        size: clientData.company.size || null,
        website: clientData.company.website || null,
        address: clientData.company.address || null,
        fullAddress: clientData.company.fullAddress || null,
        isActive: clientData.company.isActive !== undefined ? clientData.company.isActive : null,
        status: clientData.company.status || (clientData.company.isActive ? 'active' : 'inactive'),
        subscriptionPlan: clientData.company.subscriptionPlan || null,
        subscriptionExpiry: clientData.company.subscriptionExpiry || null,
        stats: clientData.company.stats || null,
        createdAt: clientData.company.createdAt || null,
        updatedAt: clientData.company.updatedAt || null
      };
    } else if (isAssigned) {
      // Company is just an ObjectId, not populated
      companyDetails = {
        _id: companyId,
        name: null,
        email: null,
        phone: null,
        description: null,
        industry: null,
        size: null,
        website: null,
        address: null,
        fullAddress: null,
        isActive: null,
        status: null,
        subscriptionPlan: null,
        subscriptionExpiry: null,
        stats: null,
        createdAt: null,
        updatedAt: null,
        note: 'Company details not loaded. Company ID is available but full details need to be fetched separately.'
      };
    }
    
    const companyAssignment = {
      isAssigned: isAssigned,
      assigned: isAssigned,
      assignmentStatus: isAssigned ? 'assigned' : 'not_assigned',
      message: isAssigned 
        ? 'Client is assigned to a company' 
        : 'Client is not assigned to any company. Please assign to a company to activate the account.',
      company: companyDetails,
      assignedBy: clientData.assignedBy || null,
      assignedAt: clientData.assignedAt || null,
      assignmentDetails: isAssigned ? {
        assignedBy: clientData.assignedBy ? {
          _id: clientData.assignedBy._id,
          firstName: clientData.assignedBy.firstName,
          lastName: clientData.assignedBy.lastName,
          email: clientData.assignedBy.email
        } : null,
        assignedAt: clientData.assignedAt || null,
        assignmentDate: clientData.assignedAt ? new Date(clientData.assignedAt).toISOString() : null
      } : null
    };
    
    // Structure the response with password information
    // Show original password as 'password' field, and hashed password as 'hashedPassword'
    const responseData = {
      ...clientData,
      password: originalPassword, // Original plain text password (what user wants to see)
      originalPassword: originalPassword, // Also include as originalPassword for clarity
      hashedPassword: clientData.password, // Hashed password (for reference)
      // Add a note if password is not available
      passwordNote: originalPassword ? null : 'Password not available. This client was created before password storage was implemented. Update the password to store it.',
      // Add comprehensive company assignment information
      companyAssignment: companyAssignment
    };
    
    // Remove the plainPassword field from the response (we're using password and originalPassword instead)
    delete responseData.plainPassword;
    
    // Ensure password fields are clearly visible
    if (originalPassword) {
      responseData.password = originalPassword;
      responseData.originalPassword = originalPassword;
    } else {
      responseData.password = null;
      responseData.originalPassword = null;
    }

    return ResponseHelper.success(res, {
      message: 'Client retrieved successfully',
      client: responseData
    });
  } catch (error) {
    console.error('Error in getClientById:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('updateClient called with ID:', id);
    console.log('Update data:', updateData);
    console.log('User info:', { role: req.user?.role, company: req.user?.company });

    const client = await Client.findById(id);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    console.log('Client found:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      company: client.company
    });

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const clientCompanyId = client.company?._id || client.company;
      const userCompanyId = req.user.company;
      
      console.log('Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        userCompanyType: typeof userCompanyId,
        clientCompany: clientCompanyId,
        clientCompanyType: typeof clientCompanyId,
        userCompanyStr: userCompanyId?.toString(),
        clientCompanyStr: clientCompanyId?.toString(),
        companiesMatch: clientCompanyId?.toString() === userCompanyId?.toString()
      });
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (clientCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
      }
    }

    // Handle notes field - convert string to proper note object and append to existing notes
    let notesToAdd = null;
    if (updateData.notes && typeof updateData.notes === 'string') {
      notesToAdd = {
        content: updateData.notes,
        createdBy: req.user.id,
        createdAt: new Date()
      };
      delete updateData.notes; // Remove from updateData since we'll handle it separately
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.company;
    delete updateData.createdBy;
    delete updateData.assignedBy;
    delete updateData.assignedAt;

    // Update client
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Add note if provided
    if (notesToAdd) {
      updatedClient.notes.push(notesToAdd);
      await updatedClient.save();
    }

    // Populate references
    await updatedClient.populate([
      { path: 'company', select: 'name status industry' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'assignedBy', select: 'firstName lastName email' },
      { path: 'notes.createdBy', select: 'firstName lastName email' }
    ]);

    // Remove password from response
    updatedClient.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Client updated successfully',
      client: updatedClient
    });
  } catch (error) {
    console.error('Error in updateClient:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('deleteClient called with ID:', id);
    console.log('User info:', { role: req.user?.role, company: req.user?.company });

    const client = await Client.findById(id);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    console.log('Client found:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      company: client.company,
      status: client.status,
      isActive: client.isActive
    });

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const clientCompanyId = client.company?._id || client.company;
      const userCompanyId = req.user.company;
      
      console.log('Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        userCompanyType: typeof userCompanyId,
        clientCompany: clientCompanyId,
        clientCompanyType: typeof clientCompanyId,
        userCompanyStr: userCompanyId?.toString(),
        clientCompanyStr: clientCompanyId?.toString(),
        companiesMatch: clientCompanyId?.toString() === userCompanyId?.toString()
      });
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      if (clientCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
      }
    }

    // Check if client is already inactive
    if (!client.isActive) {
      return ResponseHelper.error(res, 'Client is already deactivated', 400);
    }

    // Soft delete
    client.isActive = false;
    client.status = 'inactive';
    client.deactivatedAt = new Date();
    client.deactivatedBy = req.user.id;
    await client.save();

    console.log('Client deactivated successfully:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      deactivatedAt: client.deactivatedAt,
      deactivatedBy: client.deactivatedBy
    });

    // Update company statistics
    if (client.company) {
      try {
        const company = await Company.findById(client.company);
        if (company) {
          await company.updateStats();
          console.log('Company statistics updated');
        }
      } catch (statsError) {
        console.error('Error updating company stats:', statsError);
        // Don't fail the request for this
      }
    }

    return ResponseHelper.success(res, {
      message: 'Client deactivated successfully',
      data: {
        client: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          status: client.status,
          isActive: client.isActive,
          deactivatedAt: client.deactivatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error in deleteClient:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const reactivateClient = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('reactivateClient called with ID:', id);
    console.log('User info:', { role: req.user?.role, company: req.user?.company });

    const client = await Client.findById(id);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    console.log('Client found:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      company: client.company,
      status: client.status,
      isActive: client.isActive
    });

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const clientCompanyId = client.company?._id || client.company;
      const userCompanyId = req.user.company;
      
      console.log('Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        userCompanyType: typeof userCompanyId,
        clientCompany: clientCompanyId,
        clientCompanyType: typeof clientCompanyId,
        userCompanyStr: userCompanyId?.toString(),
        clientCompanyStr: clientCompanyId?.toString(),
        companiesMatch: clientCompanyId?.toString() === userCompanyId?.toString()
      });
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      // If client has no company assigned, allow CompanyAdmin to reactivate
      if (!clientCompanyId) {
        console.log('Client has no company assigned, allowing reactivation for CompanyAdmin');
      } else if (clientCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
      }
    }

    // Check if client is already active
    if (client.isActive) {
      return ResponseHelper.error(res, 'Client is already active', 400);
    }

    // Reactivate client
    client.isActive = true;
    client.status = 'active';
    client.reactivatedAt = new Date();
    client.reactivatedBy = req.user.id;
    // Clear deactivation fields
    client.deactivatedAt = undefined;
    client.deactivatedBy = undefined;
    await client.save();

    console.log('Client reactivated successfully:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      reactivatedAt: client.reactivatedAt,
      reactivatedBy: client.reactivatedBy
    });

    // Update company statistics
    if (client.company) {
      try {
        const company = await Company.findById(client.company);
        if (company) {
          await company.updateStats();
          console.log('Company statistics updated');
        }
      } catch (statsError) {
        console.error('Error updating company stats:', statsError);
        // Don't fail the request for this
      }
    }

    return ResponseHelper.success(res, {
      message: 'Client reactivated successfully',
      data: {
        client: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          status: client.status,
          isActive: client.isActive,
          reactivatedAt: client.reactivatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error in reactivateClient:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const assignClientToCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, notes } = req.body;

    console.log('assignClientToCompany called with:', { clientId: id, company, notes });
    console.log('User info:', { role: req.user?.role, id: req.user?.id });

    if (!company) {
      return ResponseHelper.error(res, 'Company assignment is required', 400);
    }

    // Find the client
    const client = await Client.findById(id);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    console.log('Client found:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      currentCompany: client.company,
      status: client.status,
      isActive: client.isActive
    });

    // Check if client is already assigned to the same company
    const currentCompanyId = client.company?._id || client.company;
    if (currentCompanyId && currentCompanyId.toString() === company) {
      return ResponseHelper.error(res, 'Client is already assigned to this company', 400);
    }

    // Store previous company for stats update
    const previousCompanyId = currentCompanyId;

    // Find and validate the company
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return ResponseHelper.error(res, 'Company not found', 404);
    }

    if (!companyExists.isActive) {
      return ResponseHelper.error(res, 'Company is inactive and cannot accept new clients', 400);
    }

    console.log('Company found:', {
      id: companyExists._id,
      name: companyExists.name,
      isActive: companyExists.isActive
    });

    // Update client
    client.company = company;
    client.status = 'active';
    client.isActive = true;
    client.assignedAt = new Date();
    client.assignedBy = req.user.id;

    // Add note if provided
    if (notes) {
      client.notes.push({
        content: notes,
        createdBy: req.user.id,
        createdAt: new Date()
      });
    }

    await client.save();

    const isReassignment = !!previousCompanyId;
    console.log('Client assigned successfully:', {
      clientId: client._id,
      companyId: company,
      previousCompanyId: previousCompanyId,
      isReassignment: isReassignment,
      assignedAt: client.assignedAt,
      assignedBy: client.assignedBy
    });

    // Update company statistics for both previous and new company
    try {
      // Update new company stats
      await companyExists.updateStats();
      console.log('New company statistics updated');

      // Update previous company stats if this is a reassignment
      if (previousCompanyId) {
        const previousCompany = await Company.findById(previousCompanyId);
        if (previousCompany) {
          await previousCompany.updateStats();
          console.log('Previous company statistics updated');
        }
      }
    } catch (statsError) {
      console.error('Error updating company stats:', statsError);
      // Don't fail the request for this
    }

    // Remove password from response
    client.password = undefined;

    return ResponseHelper.success(res, {
      message: isReassignment 
        ? 'Client reassigned to company successfully' 
        : 'Client assigned to company successfully',
      data: {
        client: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          company: client.company,
          status: client.status,
          isActive: client.isActive,
          assignedAt: client.assignedAt,
          assignedBy: client.assignedBy
        },
        company: {
          id: companyExists._id,
          name: companyExists.name
        },
        previousCompany: previousCompanyId ? {
          id: previousCompanyId
        } : null,
        isReassignment: isReassignment
      }
    });
  } catch (error) {
    console.error('Error in assignClientToCompany:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const getClientStats = async (req, res) => {
  try {
    const { company, period } = req.query;

    console.log('getClientStats called with:', { company, period, userRole: req.user?.role });

    // Build filter object
    const filter = {};

    // Company filter (CompanyAdmin can only see their company's stats)
    if (req.user.role === 'CompanyAdmin') {
      filter.company = req.user.company;
      console.log('Company-admin filter applied:', filter.company);
    } else if (company) {
      filter.company = company;
      console.log('Company filter applied:', company);
    }

    // Date filter for period-based statistics
    let dateFilter = {};
    if (period) {
      const now = new Date();
      switch (period) {
        case 'week':
          dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'quarter':
          dateFilter.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        case 'year':
          dateFilter.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
      }
    }

    const combinedFilter = { ...filter, ...dateFilter };

    // Get basic client statistics
    const stats = await Client.aggregate([
      { $match: combinedFilter },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          pendingClients: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inactiveClients: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          totalRevenue: { $sum: { $ifNull: ['$totalRevenue', 0] } },
          avgRevenue: { $avg: { $ifNull: ['$totalRevenue', 0] } }
        }
      }
    ]);

    // Get industry distribution
    const industryDistribution = await Client.aggregate([
      { $match: combinedFilter },
      { $group: { _id: { $ifNull: ['$industry', 'Not Specified'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get business type distribution
    const businessTypeDistribution = await Client.aggregate([
      { $match: combinedFilter },
      { $group: { _id: { $ifNull: ['$businessType', 'Not Specified'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get status distribution
    const statusDistribution = await Client.aggregate([
      { $match: combinedFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly client registration trend (last 12 months)
    const monthlyTrend = await Client.aggregate([
      { $match: filter }, // Use base filter without date restriction
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get clients by company (for super admin)
    let companyDistribution = [];
    if (req.user.role === 'superAdmin') {
      companyDistribution = await Client.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'companies',
            localField: 'company',
            foreignField: '_id',
            as: 'companyInfo'
          }
        },
        {
          $group: {
            _id: '$company',
            companyName: { $first: { $arrayElemAt: ['$companyInfo.name', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    }

    // Get recent activity (last 30 days)
    const recentActivity = await Client.aggregate([
      { $match: { ...filter, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: null,
          newClients: { $sum: 1 },
          newActiveClients: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);

    const result = {
      overview: {
        ...(stats[0] || {
          totalClients: 0,
          activeClients: 0,
          pendingClients: 0,
          inactiveClients: 0,
          totalRevenue: 0,
          avgRevenue: 0
        }),
        activePercentage: stats[0] ? Math.round((stats[0].activeClients / stats[0].totalClients) * 100) : 0,
        inactivePercentage: stats[0] ? Math.round((stats[0].inactiveClients / stats[0].totalClients) * 100) : 0
      },
      distributions: {
        industry: industryDistribution,
        businessType: businessTypeDistribution,
        status: statusDistribution,
        ...(req.user.role === 'superAdmin' && { company: companyDistribution })
      },
      trends: {
        monthly: monthlyTrend
      },
      activity: {
        recent: recentActivity[0] || { newClients: 0, newActiveClients: 0 }
      },
      filters: {
        company: filter.company || null,
        period: period || 'all'
      }
    };

    console.log('Client statistics retrieved successfully:', {
      totalClients: result.overview.totalClients,
      activeClients: result.overview.activeClients,
      industryCount: result.distributions.industry.length
    });

    return ResponseHelper.success(res, {
      message: 'Client statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getClientStats:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

const getClientProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      projectType, 
      priority, 
      category,
      page = 1, 
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('getClientProjects called with:', { 
      clientId: id, 
      status, 
      projectType, 
      priority, 
      category,
      page, 
      limit,
      search,
      sortBy,
      sortOrder,
      userRole: req.user?.role 
    });

    // Find the client
    const client = await Client.findById(id);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    console.log('Client found:', {
      id: client._id,
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      company: client.company
    });

    // Check company access
    if (req.user.role !== 'superAdmin') {
      // Handle both populated company object and ObjectId
      const clientCompanyId = client.company?._id || client.company;
      const userCompanyId = req.user.company;
      
      console.log('Company Access Debug:', {
        userRole: req.user.role,
        userCompany: userCompanyId,
        clientCompany: clientCompanyId,
        companiesMatch: clientCompanyId?.toString() === userCompanyId?.toString()
      });
      
      if (!userCompanyId) {
        return ResponseHelper.error(res, 'Access denied. Company information not available.', 403);
      }
      
      // If client has no company assigned, allow CompanyAdmin to access
      if (!clientCompanyId) {
        console.log('Client has no company assigned, allowing access for CompanyAdmin');
      } else if (clientCompanyId?.toString() !== userCompanyId.toString()) {
        return ResponseHelper.error(res, 'Access denied. Client belongs to different company.', 403);
      }
    }

    // Build filter for projects
    const projectFilter = { client: id };
    
    if (status) projectFilter.status = status;
    if (projectType) projectFilter.projectType = projectType;
    if (priority) projectFilter.priority = priority;
    if (category) projectFilter.category = category;

    // Search functionality
    if (search) {
      projectFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'client', select: 'firstName lastName email companyName' },
        { path: 'company', select: 'name status' },
        { path: 'projectManager', select: 'firstName lastName email' },
        { path: 'team.member', select: 'firstName lastName email' }
      ],
      sort: sortConfig
    };

    // Get projects with pagination
    const Project = require('../models/Project');
    const projects = await Project.paginate(projectFilter, options);

    // Get project statistics for this client
    const projectStats = await Project.aggregate([
      { $match: { client: client._id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          onHoldProjects: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          cancelledProjects: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalBudget: { $sum: { $ifNull: ['$budget', 0] } },
          avgBudget: { $avg: { $ifNull: ['$budget', 0] } }
        }
      }
    ]);

    // Get project distribution by status
    const statusDistribution = await Project.aggregate([
      { $match: { client: client._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get project distribution by type
    const typeDistribution = await Project.aggregate([
      { $match: { client: client._id } },
      { $group: { _id: '$projectType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = {
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        company: client.company
      },
      projects: {
        data: projects.docs,
        pagination: {
          currentPage: projects.page,
          totalPages: projects.totalPages,
          totalItems: projects.totalDocs,
          itemsPerPage: projects.limit,
          hasNextPage: projects.hasNextPage,
          hasPrevPage: projects.hasPrevPage
        }
      },
      statistics: {
        overview: projectStats[0] || {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          onHoldProjects: 0,
          cancelledProjects: 0,
          totalBudget: 0,
          avgBudget: 0
        },
        distributions: {
          status: statusDistribution,
          type: typeDistribution
        }
      },
      filters: {
        status: status || null,
        projectType: projectType || null,
        priority: priority || null,
        category: category || null,
        search: search || null,
        sortBy,
        sortOrder
      }
    };

    console.log('Client projects retrieved successfully:', {
      clientId: client._id,
      totalProjects: result.statistics.overview.totalProjects,
      activeProjects: result.statistics.overview.activeProjects,
      currentPage: result.projects.pagination.currentPage
    });

    return ResponseHelper.success(res, {
      message: 'Client projects retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getClientProjects:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

// Activate Client (Super Admin Only)
const activateClient = async (req, res) => {
  try {
    const { id: clientId } = req.params;

    // Only superAdmin can activate clients
    if (req.user.role !== 'superAdmin') {
      return ResponseHelper.error(res, 'Access denied. Only superAdmin can activate clients.', 403);
    }

    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    // Activate client
    client.isActive = true;
    client.status = 'active';
    
    // Clear deactivation fields if they exist
    if (client.deactivatedAt) {
      client.deactivatedAt = undefined;
    }
    if (client.deactivatedBy) {
      client.deactivatedBy = undefined;
    }
    
    // Set activation tracking
    client.reactivatedAt = new Date();
    client.reactivatedBy = req.user.id;
    
    await client.save();

    // Update company statistics if client has a company
    if (client.company) {
      try {
        const company = await Company.findById(client.company);
        if (company) {
          await company.updateStats();
        }
      } catch (statsError) {
        console.error('Error updating company stats:', statsError);
        // Don't fail the request for this
      }
    }

    // Remove password from response
    client.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Client activated successfully',
      data: {
        client: {
          id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          status: client.status,
          isActive: client.isActive,
          reactivatedAt: client.reactivatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error in activateClient:', error);
    return ResponseHelper.error(res, 'Internal server error: ' + error.message, 500);
  }
};

// Approve Client (Super Admin/Admin)
const approveClient = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const { company, notes, role } = req.body;

    // Validate required fields
    if (!company) {
      return ResponseHelper.error(res, 'Company assignment is required for approval', 400);
    }

    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    // Check if client is already approved
    if (client.status === 'active' && client.isActive) {
      return ResponseHelper.error(res, 'Client is already approved and active', 400);
    }

    // Verify company exists (handle both ID and name)
    let companyExists;
    if (mongoose.Types.ObjectId.isValid(company)) {
      // If it's a valid ObjectId, search by ID
      companyExists = await Company.findById(company);
    } else {
      // If it's not a valid ObjectId, search by name
      companyExists = await Company.findOne({ name: { $regex: new RegExp(company, 'i') } });
    }
    
    if (!companyExists) {
      return ResponseHelper.error(res, 'Company not found', 404);
    }
    
    const companyId = companyExists._id;

    // Update client status
    const updateData = {
      status: 'active',
      isActive: true,
      company: companyId,
      assignedBy: req.user.id,
      assignedAt: new Date()
    };

    // Add note if provided
    if (notes) {
      updateData.$push = {
        notes: {
          content: notes,
          createdBy: req.user.id,
          createdAt: new Date()
        }
      };
    }

    // Update role if provided
    if (role && ['client', 'premium-client', 'enterprise-client'].includes(role)) {
      updateData.role = role;
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      updateData,
      { new: true, runValidators: true }
    ).populate('company', 'name email phone address');

    // Remove password from response
    updatedClient.password = undefined;

    return ResponseHelper.success(res, {
      message: 'Client approved successfully and assigned to company',
      client: updatedClient
    });

  } catch (error) {
    console.error('Error in approveClient:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Debug Client (for troubleshooting)
const debugClient = async (req, res) => {
  try {
    const { email } = req.params;
    
    const client = await Client.findOne({ email }).select('+password');
    
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }
    
    // Return client info for debugging (without password)
    const clientInfo = {
      _id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      status: client.status,
      isActive: client.isActive,
      isLocked: client.isLocked,
      company: client.company,
      role: client.role,
      createdAt: client.createdAt,
      assignedAt: client.assignedAt,
      assignedBy: client.assignedBy,
      hasPassword: !!client.password
    };
    
    return ResponseHelper.success(res, {
      message: 'Client debug info',
      client: clientInfo
    });
    
  } catch (error) {
    console.error('Error in debugClient:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Reset Client Password (Admin only)
const resetClientPassword = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return ResponseHelper.error(res, 'New password must be at least 8 characters long', 400);
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    // Update password (this will trigger the pre-save middleware to hash it)
    client.password = newPassword;
    await client.save();

    return ResponseHelper.success(res, {
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error in resetClientPassword:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

// Reset Client Password (Public - for troubleshooting)
const resetClientPasswordPublic = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword || newPassword.length < 8) {
      return ResponseHelper.error(res, 'Email and new password (min 8 chars) are required', 400);
    }

    const client = await Client.findOne({ email });
    if (!client) {
      return ResponseHelper.error(res, 'Client not found', 404);
    }

    // Update password (this will trigger the pre-save middleware to hash it)
    client.password = newPassword;
    await client.save();

    return ResponseHelper.success(res, {
      message: 'Password reset successfully. You can now login with the new password.'
    });

  } catch (error) {
    console.error('Error in resetClientPasswordPublic:', error);
    return ResponseHelper.error(res, 'Internal server error', 500);
  }
};

module.exports = {
  // Client Authentication
  clientSignup,
  clientLogin,
  clientLogout,

  // Client Management
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  reactivateClient,
  activateClient,
  assignClientToCompany,
  getClientStats,
  getClientProjects,
  approveClient,
  debugClient,
  resetClientPassword,
  resetClientPasswordPublic
};
