// backend/src/routes/note.routes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createNoteSchema, updateNoteSchema, rateNoteSchema } = require('../validators/note.validator');
const noteController = require('../controllers/note.controller');

// GET /api/topics/:topicId/notes (Public)
router.get('/', noteController.getNotesByTopic);

// GET /api/notes/user/my-notes (Authenticated - get user's own notes)
router.get('/user/my-notes', authenticateToken, noteController.getMyNotes);

// GET /api/notes/lookup/:subjectSlug/:topicSlug/:noteSlug (Public for published, owner/admin for drafts)
router.get('/lookup/:subjectSlug/:topicSlug/:noteSlug', optionalAuth, noteController.getNoteBySlugs);

// GET /api/notes/:id (Public for published, owner/admin for drafts)
router.get('/:id', optionalAuth, noteController.getNoteById);

// POST /api/notes (Authenticated users)
router.post('/', authenticateToken, validate(createNoteSchema), noteController.createNote);

// PUT /api/notes/:id (Owner or Admin)
router.put('/:id', authenticateToken, validate(updateNoteSchema), noteController.updateNote);

// PATCH /api/notes/:id/publish (Owner or Admin)
router.patch('/:id/publish', authenticateToken, noteController.publishNote);

// DELETE /api/notes/:id (Owner or Admin)
router.delete('/:id', authenticateToken, noteController.deleteNote);

// GET /api/notes/:id/analytics (Owner or Admin)
router.get('/:id/analytics', authenticateToken, noteController.getNoteAnalytics);

// GET /api/notes/:id/analytics/daily (Owner or Admin)
router.get('/:id/analytics/daily', authenticateToken, noteController.getNoteAnalyticsDaily);

// GET /api/notes/:id/rating (Optional Auth - Returns average, count, and user's rating)
router.get('/:id/rating', optionalAuth, noteController.getNoteRating);

// POST /api/notes/:id/rate (Authenticated - Add or update rating)
router.post('/:id/rate', authenticateToken, validate(rateNoteSchema), noteController.rateNote);

// DELETE /api/notes/:id/rate (Authenticated - Remove rating)
router.delete('/:id/rate', authenticateToken, noteController.deleteNoteRating);

module.exports = router;
