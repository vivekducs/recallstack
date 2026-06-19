// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, authController.getMe);

// PUT /api/auth/profile (Protected)
router.put('/profile', authenticateToken, authController.updateProfile);

// PATCH /api/auth/preferences (Protected)
router.patch('/preferences', authenticateToken, authController.updatePreferences);

module.exports = router;
