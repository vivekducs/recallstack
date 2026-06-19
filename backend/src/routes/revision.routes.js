// backend/src/routes/revision.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { optionalAuth } = require('../middleware/auth.middleware');
const revisionController = require('../controllers/revision.controller');

// GET /api/notes/:noteId/revisions (Public for published, owner/admin for drafts)
router.get('/', optionalAuth, revisionController.getRevisions);

// GET /api/notes/:noteId/revisions/:revisionId (Public for published, owner/admin for drafts)
router.get('/:revisionId', optionalAuth, revisionController.getRevisionSnapshot);

// POST /api/notes/:noteId/revisions/:revisionId/restore (Owner or Admin)
const { authenticateToken } = require('../middleware/auth.middleware');
router.post('/:revisionId/restore', authenticateToken, revisionController.restoreRevision);

module.exports = router;
