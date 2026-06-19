// backend/src/controllers/bookmark.controller.js
const bookmarkService = require('../services/bookmark.service');

class BookmarkController {
  async getBookmarks(req, res, next) {
    try {
      const bookmarks = await bookmarkService.getBookmarks(req.user.userId);
      res.json(bookmarks);
    } catch (err) {
      next(err);
    }
  }

  async addBookmark(req, res, next) {
    try {
      const bookmark = await bookmarkService.addBookmark(req.user.userId, req.body.noteId);
      // Status is usually 201 for created, 200 for existing. The service doesn't differentiate but let's just use json.
      // Wait, service returns existing directly if found.
      // For simplicity, we just use res.json which defaults to 200, but let's set 201 if it has a newly created feel.
      // Actually, standard express handles this. We'll just do res.json(bookmark). Wait, the original route did res.status(201).json(bookmark);
      res.status(201).json(bookmark);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async removeBookmark(req, res, next) {
    try {
      const result = await bookmarkService.removeBookmark(req.user.userId, req.params.noteId);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new BookmarkController();
