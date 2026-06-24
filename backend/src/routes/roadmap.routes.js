// backend/src/routes/roadmap.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const roadmapController = require('../controllers/roadmap.controller');

// === PROGRESS ENDPOINTS ===
// GET /api/roadmap/progress (Authenticated users get their own progress)
router.get('/progress', authenticateToken, roadmapController.getProgress);

// POST /api/roadmap/progress (Authenticated users save/update progress)
router.post('/progress', authenticateToken, roadmapController.upsertProgress);

// === PRIVATE NOTES ENDPOINTS ===
// GET /api/roadmap/notes (Authenticated users get their own notes)
router.get('/notes', authenticateToken, roadmapController.getNotes);

// POST /api/roadmap/notes (Authenticated users create/update note)
router.post('/notes', authenticateToken, roadmapController.upsertNote);

// DELETE /api/roadmap/notes/:itemId (Authenticated users delete note)
router.delete('/notes/:itemId', authenticateToken, roadmapController.deleteNote);

// === RESOURCES ENDPOINTS ===
// GET /api/roadmap/resources (Publicly accessible for viewing video/blog links)
router.get('/resources', roadmapController.getResources);

// POST /api/roadmap/resources (Admin only - add video or blog links)
router.post('/resources', authenticateToken, adminOnly, roadmapController.addResource);

// DELETE /api/roadmap/resources/:id (Admin only - remove video or blog links)
router.delete('/resources/:id', authenticateToken, adminOnly, roadmapController.deleteResource);

module.exports = router;
