const express = require('express');
const { authenticateToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const {
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
} = require('../controllers/clientController');

const router = express.Router();

// Client Authentication Routes (Public)
router.post('/signup', clientSignup);
router.post('/login', clientLogin);
router.post('/logout', clientLogout);

// Debug and utility routes (Public - for troubleshooting)
router.get('/debug/:email', debugClient);
router.post('/reset-password', resetClientPasswordPublic);

// Client Management Routes (Admin/Super Admin)
// Apply authentication middleware to all management routes
router.use(authenticateToken);

// Super Admin Routes
router.post('/create', requireSuperAdmin, createClient);

// Admin Routes (Company Admin can access most routes)
router.get('/list', requireAdmin, getAllClients);

// Client Management Routes (specific rou`tes first to avoid conflicts)
router.post('/:id/approve', requireAdmin, approveClient); // Both Super Admin and Admin can approve
router.post('/:id/reset-password', requireAdmin, resetClientPassword); // Reset client password
router.post('/:id/assign-company', requireSuperAdmin, assignClientToCompany);
router.get('/:id', requireAdmin, getClientById);
router.put('/:id', requireAdmin, updateClient);
router.post('/:id/update', requireAdmin, updateClient); // Alternative POST method

// Client Status Management
router.delete('/:id', requireAdmin, deleteClient); // Soft delete
router.post('/:id/delete', requireAdmin, deleteClient); // Alternative POST method
router.put('/:id/reactivate', requireAdmin, reactivateClient);
router.post('/:id/reactivate', requireAdmin, reactivateClient); // Alternative POST method
router.put('/:id/activate', requireSuperAdmin, activateClient); // Super Admin only - Activate client
router.post('/:id/activate', requireSuperAdmin, activateClient); // Alternative POST method

// Client Analytics & Details
router.get('/stats/overview', requireAdmin, getClientStats);
router.get('/:id/projects', requireAdmin, getClientProjects);

module.exports = router;
