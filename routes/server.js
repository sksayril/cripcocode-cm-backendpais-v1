const express = require('express');
const ServerController = require('../controllers/serverController');

const router = express.Router();

// Basic health check
router.get('/health', ServerController.healthCheck);

// Ping endpoint for basic connectivity test
router.get('/ping', ServerController.ping);

// Comprehensive server status check
router.get('/status', ServerController.serverStatus);

// Database connection test
router.get('/database', ServerController.databaseTest);

// System resources check
router.get('/resources', ServerController.systemResources);

module.exports = router;
