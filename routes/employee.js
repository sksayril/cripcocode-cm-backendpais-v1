const express = require('express');
const { authenticateToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const { authenticateEmployeeToken } = require('../middleware/employeeAuth');
const {
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
  getEmployeeStats,

  // Helper Functions
  getEmployeeEnumValues
} = require('../controllers/employeeController');

const router = express.Router();

// Employee Authentication Routes (Public)
router.post('/login', employeeLogin);
router.post('/logout', employeeLogout);

// Helper Route - Get Valid Enum Values (Public - no auth required for enum values)
router.get('/enums', getEmployeeEnumValues);

// Employee Management Routes (Admin/Super Admin)
// Apply authentication middleware to all management routes
router.use(authenticateToken);

// Employee Creation (Super Admin and Company Admin)
router.post('/create', requireAdmin, createEmployee);

// Admin Routes (Company Admin can access most routes)
router.get('/list', requireAdmin, getAllEmployees);
router.get('/:id', requireAdmin, getEmployeeById);
router.put('/:id', requireAdmin, updateEmployee);
router.post('/:id/update', requireAdmin, updateEmployee); // Alternative POST method

// Employee Password Management
router.put('/:id/password', requireAdmin, updateEmployeePassword);
router.post('/:id/password', requireAdmin, updateEmployeePassword); // Alternative POST method

// Employee Status Management
router.delete('/:id', requireAdmin, deleteEmployee); // Soft delete
router.post('/:id/delete', requireAdmin, deleteEmployee); // Alternative POST method
router.put('/:id/reactivate', requireAdmin, reactivateEmployee);
router.post('/:id/reactivate', requireAdmin, reactivateEmployee); // Alternative POST method

// Project Assignment Routes
router.post('/:employeeId/projects/:projectId/assign', requireAdmin, assignEmployeeToProject);
router.delete('/:employeeId/projects/:projectId/remove', requireAdmin, removeEmployeeFromProject);
router.post('/:employeeId/projects/:projectId/remove', requireAdmin, removeEmployeeFromProject); // Alternative POST method

// Employee Analytics
router.get('/stats/overview', requireAdmin, getEmployeeStats);

// Employee Dashboard Routes (Employee Authentication Required)
router.use('/dashboard', authenticateEmployeeToken);
router.get('/dashboard', getEmployeeDashboard);

module.exports = router;
