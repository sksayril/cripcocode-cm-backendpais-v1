const express = require('express');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  reactivateCompany,
  getCompanyStats,
  getCompanyWithAdmins,
  getCompanyAdmins
} = require('../controllers/companyController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Company CRUD Operations
router.post('/create', createCompany);
router.get('/list', getAllCompanies);

// Company Analytics & Details
router.get('/stats/overview', getCompanyStats);

// Company-specific routes (must come before generic /:id route)
// Get company admins list - Returns count and list of all admins for a company
router.get('/:id/admins', getCompanyAdmins);
// Get company with admins
router.get('/:id/with-admins', getCompanyWithAdmins);

// Company CRUD Operations (generic routes)
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.post('/:id/update', updateCompany); // Alternative POST method

// Company Status Management
router.delete('/:id', deleteCompany); // Soft delete
router.post('/:id/delete', deleteCompany); // Alternative POST method
router.put('/:id/reactivate', reactivateCompany);
router.post('/:id/reactivate', reactivateCompany); // Alternative POST method

module.exports = router;
