// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const commentController = require('../controllers/comment.controller');

// GET /api/notes/:noteId/comments (Public/Optional Auth - get comment tree)
router.get('/', optionalAuth, commentController.getCommentsByNote);

// POST /api/notes/:noteId/comments (Authenticated - post a comment or reply)
router.post('/', authenticateToken, commentController.createComment);

// PUT /api/comments/:id (Authenticated - edit comment content)
router.put('/:id', authenticateToken, commentController.updateComment);

// DELETE /api/comments/:id (Authenticated - delete comment)
router.delete('/:id', authenticateToken, commentController.deleteComment);

// PATCH /api/comments/:id/status (Authenticated - approve/reject comment)
router.patch('/:id/status', authenticateToken, commentController.updateCommentStatus);

module.exports = router;
