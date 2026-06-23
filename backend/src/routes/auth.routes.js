// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePreferencesSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, authController.getMe);

// PUT /api/auth/profile (Protected)
router.put('/profile', authenticateToken, validate(updateProfileSchema), authController.updateProfile);

// PATCH /api/auth/preferences (Protected)
router.patch('/preferences', authenticateToken, validate(updatePreferencesSchema), authController.updatePreferences);

// POST /api/auth/forgot-password (Public)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/auth/reset-password (Public)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
