const express = require('express');
const { authenticateToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const { authenticateEmployeeToken } = require('../middleware/employeeAuth');
const {
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
} = require('../controllers/taskController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Task Management Routes (Admin/Employee)
router.post('/create', requireAdmin, createTask);
router.get('/list', requireAdmin, getAllTasks);
router.get('/:id', requireAdmin, getTaskById);
router.put('/:id', requireAdmin, updateTask);
router.post('/:id/update', requireAdmin, updateTask); // Alternative POST method

// Task Status Management
router.delete('/:id', requireAdmin, deleteTask); // Soft delete
router.post('/:id/delete', requireAdmin, deleteTask); // Alternative POST method

// Task Assignment & Team Management
router.post('/:id/employees/:employeeId/assign', requireAdmin, assignTaskToEmployee);
router.delete('/:id/employees/:employeeId/remove', requireAdmin, removeEmployeeFromTask);
router.post('/:id/employees/:employeeId/remove', requireAdmin, removeEmployeeFromTask); // Alternative POST method

// Task Analytics
router.get('/stats/overview', requireAdmin, getTaskStats);

// Employee Task Routes (Employee Authentication Required)
router.use('/employee', authenticateEmployeeToken);

// Employee can view their own tasks
router.get('/employee/list', getAllTasks);
router.get('/employee/:id', getTaskById);

// Employee can update their task progress
router.put('/employee/:id/progress', updateTaskProgress);
router.post('/employee/:id/progress', updateTaskProgress); // Alternative POST method

// Employee can add time entries
router.post('/employee/:id/time-entry', addTimeEntry);

// Employee can add comments
router.post('/employee/:id/comment', addTaskComment);

module.exports = router;
