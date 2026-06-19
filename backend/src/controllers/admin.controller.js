// backend/src/controllers/admin.controller.js
const adminService = require('../services/admin.service');
const noteService = require('../services/note.service');
const commentService = require('../services/comment.service');

class AdminController {
  async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const data = await adminService.getUsers(page, limit, search);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const result = await adminService.deleteUser(req.params.id, req.user.userId);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getNotes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const status = req.query.status || '';

      const data = await adminService.getNotes(page, limit, search, status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async unpublishNote(req, res, next) {
    try {
      const result = await adminService.unpublishNote(req.params.id);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const result = await noteService.deleteNote(req.params.id, req.user.userId, req.user.role);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getComments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || 'PENDING';

      const data = await adminService.getComments(page, limit, status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async approveComment(req, res, next) {
    try {
      const result = await commentService.updateCommentStatus(
        req.params.id,
        req.user.userId,
        req.user.role,
        'APPROVED'
      );
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async rejectComment(req, res, next) {
    try {
      const result = await commentService.updateCommentStatus(
        req.params.id,
        req.user.userId,
        req.user.role,
        'REJECTED'
      );
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const result = await commentService.deleteComment(req.params.id, req.user.userId, req.user.role);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const data = await adminService.getAnalytics();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
