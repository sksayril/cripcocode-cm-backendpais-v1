const Admin = require('../models/Admin');
const Company = require('../models/Company');
const ResponseHelper = require('../utils/responseHelper');
const mongoose = require('mongoose');

// Create Admin (Super-admin or Company-admin only)
const createAdmin = async (req, res) => {
  try {
    console.log('Create admin request received:', {
      body: req.body,
      user: req.user
    });

    const {
      fullname,
      username,
      email,
      role,
      password,
      phone,
      department,
      adminArea,
      company
    } = req.body;

    // Validation
    if (!fullname || !username || !email || !role || !password || !phone || !department || !adminArea) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: fullname, username, email, role, password, phone, department, adminArea'
      });
    }

    // Check if role is valid
    if (!['superAdmin', 'CompanyAdmin', 'manager', 'sales', 'support'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "superAdmin", "CompanyAdmin", "manager", "sales", or "support"'
      });
    }

    // Company assignment logic
    let companyId = company;
    
    if (req.user.role === 'superAdmin') {
      // Super admin can assign to any company
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company assignment is required for superAdmin created admins'
        });
      }
      
      // Validate company ID format
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID format'
        });
      }
    } else if (req.user.role === 'CompanyAdmin') {
      // Company admin can only create admins in their own company
      companyId = req.user.company;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company admin must be assigned to a company'
        });
      }
    }

    console.log('Company ID to be assigned:', companyId);
    console.log('User role:', req.user.role);
    console.log('User company:', req.user.company);

    // Verify company exists and is active
    const companyExists = await Company.findById(companyId);
    console.log('Company lookup result:', {
      companyId,
      companyFound: !!companyExists,
      companyName: companyExists?.name,
      companyActive: companyExists?.isActive
    });
    
    if (!companyExists || !companyExists.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive company',
        debug: {
          companyId,
          companyFound: !!companyExists,
          companyActive: companyExists?.isActive
        }
      });
    }

    console.log('Company verified:', companyExists.name);

    // Check if username, email, or phone already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }, { phone }]
    });

    if (existingAdmin) {
      let duplicateField = '';
      if (existingAdmin.username === username) duplicateField = 'username';
      else if (existingAdmin.email === email) duplicateField = 'email';
      else if (existingAdmin.phone === phone) duplicateField = 'phone';

      return res.status(400).json({
        success: false,
        message: `Admin with this ${duplicateField} already exists`
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      fullname,
      username,
      email,
      role,
      password,
      phone,
      department,
      adminArea,
      company: companyId,
      createdBy: req.user.id
    });

    console.log('New admin object created:', {
      fullname: newAdmin.fullname,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
      company: newAdmin.company
    });

    await newAdmin.save();

    console.log('Admin saved successfully with ID:', newAdmin._id);

    // Update company stats
    await companyExists.updateStats();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: {
          id: newAdmin._id,
          fullname: newAdmin.fullname,
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          phone: newAdmin.phone,
          department: newAdmin.department,
          adminArea: newAdmin.adminArea,
          company: {
            id: companyExists._id,
            name: companyExists.name
          },
          permissions: newAdmin.permissions,
          createdAt: newAdmin.createdAt,
          isActive: newAdmin.isActive,
          createdBy: newAdmin.createdBy
        }
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Admins (with pagination and filters)
const getAllAdmins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      department,
      company,
      isActive,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (company) filter.company = company;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Company admin can only see admins in their company
    if (req.user.role === 'CompanyAdmin') {
      filter.company = req.user.company;
    }
    
    if (search) {
      filter.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get admins with pagination
    const admins = await Admin.find(filter)
      .select('-password')
      .populate('company', 'name email industry')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Admin.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Admins retrieved successfully',
      data: {
        admins,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAdmins: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Single Admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)
      .select('-password')
      .populate('company', 'name email industry size')
      .populate('createdBy', 'username email');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if user has access to this admin
    if (req.user.role === 'CompanyAdmin' && admin.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view admins in your company.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin retrieved successfully',
      data: { admin }
    });

  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if user has access to update this admin
    if (req.user.role === 'CompanyAdmin' && existingAdmin.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update admins in your company.'
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.password;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.company; // Company cannot be changed after creation

    // If updating username, email, or phone, check for duplicates
    if (updateData.username || updateData.email || updateData.phone) {
      const duplicateFilter = {
        _id: { $ne: id } // Exclude current admin
      };

      if (updateData.username) duplicateFilter.username = updateData.username;
      if (updateData.email) duplicateFilter.email = updateData.email;
      if (updateData.phone) duplicateFilter.phone = updateData.phone;

      const duplicate = await Admin.findOne(duplicateFilter);
      if (duplicate) {
        let duplicateField = '';
        if (duplicate.username === updateData.username) duplicateField = 'username';
        else if (duplicate.email === updateData.email) duplicateField = 'email';
        else if (duplicate.phone === updateData.phone) duplicateField = 'phone';

        return res.status(400).json({
          success: false,
          message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`
        });
      }
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password')
     .populate('company', 'name email industry')
     .populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin: updatedAdmin }
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Admin Password
const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if user has access to update this admin
    if (req.user.role === 'CompanyAdmin' && existingAdmin.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update admins in your company.'
      });
    }

    // Hash the password manually to avoid validation issues
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password using findByIdAndUpdate
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { 
        password: hashedPassword,
        updatedAt: Date.now()
      },
      { 
        new: true, 
        runValidators: false // Skip validation to avoid company requirement issue
      }
    );

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin password updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Admin (Soft delete - set isActive to false)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if user has access to delete this admin
    if (req.user.role === 'CompanyAdmin' && existingAdmin.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete admins in your company.'
      });
    }

    // Prevent deleting superAdmin
    if (existingAdmin.role === 'superAdmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete superAdmin account'
      });
    }

    // Soft delete - set isActive to false using direct MongoDB update to avoid validation issues
    try {
      const result = await Admin.updateOne(
        { _id: id },
        { 
          $set: { 
            isActive: false,
            updatedAt: Date.now()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Admin was not updated'
        });
      }
    } catch (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update admin status',
        error: updateError.message
      });
    }

    // Update company stats
    const company = await Company.findById(existingAdmin.company);
    if (company) {
      await company.updateStats();
    }

    res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully',
      data: {
        admin: {
          id: existingAdmin._id,
          username: existingAdmin.username,
          isActive: existingAdmin.isActive
        }
      }
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Hard Delete Admin (Permanent removal)
const hardDeleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Only superAdmin can hard delete
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only superAdmin can permanently delete admins.'
      });
    }

    // Prevent deleting superAdmin
    if (existingAdmin.role === 'superAdmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete superAdmin account'
      });
    }

    // Permanent delete
    await Admin.findByIdAndDelete(id);

    // Update company stats
    const company = await Company.findById(existingAdmin.company);
    if (company) {
      await company.updateStats();
    }

    res.status(200).json({
      success: true,
      message: 'Admin permanently deleted',
      data: {
        deletedAdmin: {
          id: existingAdmin._id,
          username: existingAdmin.username
        }
      }
    });

  } catch (error) {
    console.error('Hard delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reactivate Admin
const reactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if user has access to reactivate this admin
    if (req.user.role === 'CompanyAdmin' && existingAdmin.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only reactivate admins in your company.'
      });
    }

    // Reactivate admin using direct MongoDB update to avoid validation issues
    try {
      const result = await Admin.updateOne(
        { _id: id },
        { 
          $set: { 
            isActive: true,
            updatedAt: Date.now()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Admin was not updated'
        });
      }
    } catch (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update admin status',
        error: updateError.message
      });
    }

    // Update company stats
    const company = await Company.findById(existingAdmin.company);
    if (company) {
      await company.updateStats();
    }

    res.status(200).json({
      success: true,
      message: 'Admin reactivated successfully',
      data: {
        admin: {
          id: existingAdmin._id,
          username: existingAdmin.username,
          isActive: existingAdmin.isActive
        }
      }
    });

  } catch (error) {
    console.error('Reactivate admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Admin Statistics
const getAdminStats = async (req, res) => {
  try {
    let filter = {};
    
    // Company admin can only see stats for their company
    if (req.user.role === 'CompanyAdmin') {
      filter.company = req.user.company;
    }

    const totalAdmins = await Admin.countDocuments(filter);
    const activeAdmins = await Admin.countDocuments({ ...filter, isActive: true });
    const inactiveAdmins = await Admin.countDocuments({ ...filter, isActive: false });

    const roleStats = await Admin.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Admin.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const companyStats = await Admin.aggregate([
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
          companyName: { $first: '$companyInfo.name' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        roleDistribution: roleStats,
        departmentDistribution: departmentStats,
        companyDistribution: companyStats
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  hardDeleteAdmin,
  reactivateAdmin,
  getAdminStats
};
