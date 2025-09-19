const Company = require('../models/Company');
const Admin = require('../models/Admin');
const ResponseHelper = require('../utils/responseHelper');

// Create Company (Super-admin only)
const createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      email,
      phone,
      address,
      industry,
      size,
      website,
      subscriptionPlan
    } = req.body;

    // Check if company email already exists
    const existingCompany = await Company.findOne({ email: email.toLowerCase() });
    if (existingCompany) {
      return ResponseHelper.duplicateError(res, 'email', email);
    }

    // Create new company
    const newCompany = new Company({
      name,
      description,
      email: email.toLowerCase(),
      phone,
      address,
      industry,
      size,
      website,
      subscriptionPlan,
      createdBy: req.user.id
    });

    await newCompany.save();

    // Update company stats
    await newCompany.updateStats();

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company: {
          id: newCompany._id,
          name: newCompany.name,
          email: newCompany.email,
          phone: newCompany.phone,
          industry: newCompany.industry,
          size: newCompany.size,
          status: newCompany.status,
          subscriptionPlan: newCompany.subscriptionPlan,
          stats: newCompany.stats,
          createdAt: newCompany.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Companies (with pagination and filters)
const getAllCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      industry,
      size,
      subscriptionPlan,
      isActive,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (industry) filter.industry = industry;
    if (size) filter.size = size;
    if (subscriptionPlan) filter.subscriptionPlan = subscriptionPlan;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get companies with pagination
    const companies = await Company.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Company.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Companies retrieved successfully',
      data: {
        companies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCompanies: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Single Company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate('createdBy', 'username email');

    if (!company) {
      return ResponseHelper.resourceNotFound(res, 'Company', id);
    }

    res.status(200).json({
      success: true,
      message: 'Company retrieved successfully',
      data: { company }
    });

  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if company exists
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return ResponseHelper.resourceNotFound(res, 'Company', id);
    }

    // If updating email, check for duplicates
    if (updateData.email && updateData.email !== existingCompany.email) {
      const duplicateCompany = await Company.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (duplicateCompany) {
        return ResponseHelper.duplicateError(res, 'email', updateData.email);
      }
      
      updateData.email = updateData.email.toLowerCase();
    }

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    // Update company stats
    await updatedCompany.updateStats();

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: { company: updatedCompany }
    });

  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Company (Soft delete)
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return ResponseHelper.resourceNotFound(res, 'Company', id);
    }

    // Check if company has active admins or users
    const activeAdmins = await Admin.countDocuments({ company: id, isActive: true });
    if (activeAdmins > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company with active admins. Please deactivate all admins first.'
      });
    }

    // Soft delete - set isActive to false
    existingCompany.isActive = false;
    await existingCompany.save();

    res.status(200).json({
      success: true,
      message: 'Company deactivated successfully',
      data: {
        company: {
          id: existingCompany._id,
          name: existingCompany.name,
          isActive: existingCompany.isActive
        }
      }
    });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reactivate Company
const reactivateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return ResponseHelper.resourceNotFound(res, 'Company', id);
    }

    // Reactivate company
    existingCompany.isActive = true;
    await existingCompany.save();

    res.status(200).json({
      success: true,
      message: 'Company reactivated successfully',
      data: {
        company: {
          id: existingCompany._id,
          name: existingCompany.name,
          isActive: existingCompany.isActive
        }
      }
    });

  } catch (error) {
    console.error('Reactivate company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Company Statistics
const getCompanyStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ isActive: true });
    const inactiveCompanies = await Company.countDocuments({ isActive: false });

    const industryStats = await Company.aggregate([
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 }
        }
      }
    ]);

    const sizeStats = await Company.aggregate([
      {
        $group: {
          _id: '$size',
          count: { $sum: 1 }
        }
      }
    ]);

    const subscriptionStats = await Company.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total admins and users across all companies
    const totalAdmins = await Admin.countDocuments({ isActive: true });
    const totalUsers = 0; // Will be updated when User model is implemented

    res.status(200).json({
      success: true,
      message: 'Company statistics retrieved successfully',
      data: {
        overview: {
          totalCompanies,
          activeCompanies,
          inactiveCompanies,
          totalAdmins,
          totalUsers
        },
        industryDistribution: industryStats,
        sizeDistribution: sizeStats,
        subscriptionDistribution: subscriptionStats
      }
    });

  } catch (error) {
    console.error('Get company stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Company Details with Admins
const getCompanyWithAdmins = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate('createdBy', 'username email');

    if (!company) {
      return ResponseHelper.resourceNotFound(res, 'Company', id);
    }

    // Get company admins
    const admins = await Admin.find({ company: id })
      .select('-password')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    // Update company stats
    await company.updateStats();

    res.status(200).json({
      success: true,
      message: 'Company details retrieved successfully',
      data: {
        company,
        admins,
        totalAdmins: admins.length
      }
    });

  } catch (error) {
    console.error('Get company with admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  reactivateCompany,
  getCompanyStats,
  getCompanyWithAdmins
};
