// backend/src/routes/analytics.routes.js

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

// GET /api/analytics/dashboard (Authenticated)
router.get('/dashboard', authenticateToken, analyticsController.getDashboard);

module.exports = router;
