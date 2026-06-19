// backend/src/routes/bookmark.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const bookmarkController = require('../controllers/bookmark.controller');

// GET /api/bookmarks (Authenticated - list user's bookmarked notes)
router.get('/', authenticateToken, bookmarkController.getBookmarks);

// POST /api/bookmarks (Authenticated - save a note)
router.post('/', authenticateToken, bookmarkController.addBookmark);

// DELETE /api/bookmarks/:noteId (Authenticated - unsave a note)
router.delete('/:noteId', authenticateToken, bookmarkController.removeBookmark);

module.exports = router;
