// backend/src/routes/section.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth.middleware');
const sectionController = require('../controllers/section.controller');

// POST /api/notes/:noteId/sections (Authenticated)
router.post('/', authenticateToken, sectionController.createSection);

// PUT /api/sections/:id (Owner or Admin)
router.put('/:id', authenticateToken, sectionController.updateSection);

// DELETE /api/sections/:id (Owner or Admin)
router.delete('/:id', authenticateToken, sectionController.deleteSection);

// PATCH /api/sections/:id/reorder (Owner or Admin)
router.patch('/:id/reorder', authenticateToken, sectionController.reorderSection);

module.exports = router;
