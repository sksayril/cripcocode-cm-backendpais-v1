const express = require('express');
const { authenticateToken, requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const { authenticateClientToken, canAccessProject, canModifyProject, canViewCompanyProjects, canCreateProjects } = require('../middleware/clientAuth');
const {
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
} = require('../controllers/projectController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Project Management Routes
router.post('/create', requireAdmin, createProject);
router.get('/list', requireAdmin, getAllProjects);
router.get('/:id', requireAdmin, getProjectById);
router.put('/:id', requireAdmin, updateProject);
router.post('/:id/update', requireAdmin, updateProject); // Alternative POST method

// Project Status Management
router.delete('/:id', requireAdmin, deleteProject); // Soft delete
router.post('/:id/delete', requireAdmin, deleteProject); // Alternative POST method

// Project Phase Management
router.post('/:id/phases', requireAdmin, addProjectPhase);
router.put('/:id/phases/:phaseId', requireAdmin, updateProjectPhase);
router.post('/:id/phases/:phaseId/update', requireAdmin, updateProjectPhase); // Alternative POST method

// Project Team Management
router.post('/:id/team', requireAdmin, addTeamMember);
router.delete('/:id/team/:memberId', requireAdmin, removeTeamMember);
router.post('/:id/team/:memberId/remove', requireAdmin, removeTeamMember); // Alternative POST method

// Project Issues & Risks Management
router.post('/:id/issues', requireAdmin, addProjectIssue);
router.post('/:id/risks', requireAdmin, addProjectRisk);

// Project Analytics
router.get('/stats/overview', requireAdmin, getProjectStats);

// Client Project Creation (Client can create their own projects)
router.post('/client/create', authenticateClientToken, canCreateProjects, createClientProject);

// Client Project Access Routes
router.get('/client/list', authenticateClientToken, canViewCompanyProjects, getAllProjects);
router.get('/client/:id', authenticateClientToken, canAccessProject, getProjectById);
router.put('/client/:id', authenticateClientToken, canModifyProject, updateProject);
router.post('/client/:id/update', authenticateClientToken, canModifyProject, updateProject);

module.exports = router;
