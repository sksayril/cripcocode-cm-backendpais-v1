const Admin = require('../models/Admin');

class AdminService {
  // Create new admin
  static async createAdmin(adminData) {
    try {
      const newAdmin = new Admin(adminData);
      return await newAdmin.save();
    } catch (error) {
      throw error;
    }
  }

  // Find admin by criteria
  static async findAdminByCriteria(criteria) {
    try {
      return await Admin.findOne(criteria);
    } catch (error) {
      throw error;
    }
  }

  // Find admin by ID
  static async findAdminById(id) {
    try {
      return await Admin.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Find admin by ID with populated fields
  static async findAdminByIdWithPopulate(id, populateFields = '') {
    try {
      return await Admin.findById(id).populate(populateFields);
    } catch (error) {
      throw error;
    }
  }

  // Get all admins with filters and pagination
  static async getAllAdmins(filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const admins = await Admin.find(filter)
        .select('-password')
        .populate('createdBy', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Admin.countDocuments(filter);

      return {
        admins,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      };
    } catch (error) {
      throw error;
    }
  }

  // Update admin by ID
  static async updateAdminById(id, updateData) {
    try {
      return await Admin.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).select('-password');
    } catch (error) {
      throw error;
    }
  }

  // Update admin password
  static async updateAdminPassword(id, newPassword) {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        throw new Error('Admin not found');
      }
      
      admin.password = newPassword;
      return await admin.save();
    } catch (error) {
      throw error;
    }
  }

  // Soft delete admin (set isActive to false)
  static async softDeleteAdmin(id) {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        throw new Error('Admin not found');
      }
      
      admin.isActive = false;
      return await admin.save();
    } catch (error) {
      throw error;
    }
  }

  // Hard delete admin (permanent removal)
  static async hardDeleteAdmin(id) {
    try {
      return await Admin.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Reactivate admin (set isActive to true)
  static async reactivateAdmin(id) {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        throw new Error('Admin not found');
      }
      
      admin.isActive = true;
      return await admin.save();
    } catch (error) {
      throw error;
    }
  }

  // Get admin statistics
  static async getAdminStats() {
    try {
      const totalAdmins = await Admin.countDocuments();
      const activeAdmins = await Admin.countDocuments({ isActive: true });
      const inactiveAdmins = await Admin.countDocuments({ isActive: false });

      const roleStats = await Admin.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const departmentStats = await Admin.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        roleDistribution: roleStats,
        departmentDistribution: departmentStats
      };
    } catch (error) {
      throw error;
    }
  }

  // Check for duplicate fields
  static async checkForDuplicates(updateData, excludeId = null) {
    try {
      const duplicateFilter = {};
      
      if (excludeId) {
        duplicateFilter._id = { $ne: excludeId };
      }

      if (updateData.username) duplicateFilter.username = updateData.username;
      if (updateData.email) duplicateFilter.email = updateData.email;
      if (updateData.phone) duplicateFilter.phone = updateData.phone;

      if (Object.keys(duplicateFilter).length === 0) {
        return null;
      }

      return await Admin.findOne(duplicateFilter);
    } catch (error) {
      throw error;
    }
  }

  // Validate admin role
  static validateAdminRole(role) {
    const validRoles = ['superAdmin', 'manager', 'sales'];
    return validRoles.includes(role);
  }

  // Validate required fields
  static validateRequiredFields(adminData) {
    const requiredFields = ['fullname', 'username', 'email', 'role', 'password', 'phone', 'department', 'adminArea'];
    const missingFields = requiredFields.filter(field => !adminData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  }
}

module.exports = AdminService;
