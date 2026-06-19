// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

// Protect all admin endpoints with authentication and admin-only filters
router.use(authenticateToken);
router.use(adminOnly);

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

// GET /api/admin/notes
router.get('/notes', adminController.getNotes);

// PATCH /api/admin/notes/:id/unpublish
router.patch('/notes/:id/unpublish', adminController.unpublishNote);

// DELETE /api/admin/notes/:id
router.delete('/notes/:id', adminController.deleteNote);

// GET /api/admin/comments
router.get('/comments', adminController.getComments);

// PATCH /api/admin/comments/:id/approve
router.patch('/comments/:id/approve', adminController.approveComment);

// PATCH /api/admin/comments/:id/reject
router.patch('/comments/:id/reject', adminController.rejectComment);

// DELETE /api/admin/comments/:id
router.delete('/comments/:id', adminController.deleteComment);

// GET /api/admin/analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
