// backend/src/routes/profile.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');

// GET /api/profiles/:username (Public with optional auth to check follow status)
router.get('/:username', optionalAuth, profileController.getProfile);

// POST /api/profiles/:username/follow (Authenticated)
router.post('/:username/follow', authenticateToken, profileController.followUser);

// DELETE /api/profiles/:username/follow (Authenticated)
router.delete('/:username/follow', authenticateToken, profileController.unfollowUser);

module.exports = router;
