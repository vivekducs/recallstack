// backend/src/routes/section.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createSectionSchema, updateSectionSchema, reorderSectionSchema } = require('../validators/section.validator');
const sectionController = require('../controllers/section.controller');

// POST /api/notes/:noteId/sections (Authenticated)
router.post('/', authenticateToken, validate(createSectionSchema), sectionController.createSection);

// PUT /api/sections/:id (Owner or Admin)
router.put('/:id', authenticateToken, validate(updateSectionSchema), sectionController.updateSection);

// DELETE /api/sections/:id (Owner or Admin)
router.delete('/:id', authenticateToken, sectionController.deleteSection);

// PATCH /api/sections/:id/reorder (Owner or Admin)
router.patch('/:id/reorder', authenticateToken, validate(reorderSectionSchema), sectionController.reorderSection);

module.exports = router;
