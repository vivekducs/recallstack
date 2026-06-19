// backend/src/controllers/comment.controller.js
const commentService = require('../services/comment.service');

class CommentController {
  async getCommentsByNote(req, res, next) {
    try {
      const comments = await commentService.getCommentsByNote(req.params.noteId, req.user);
      res.json(comments);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async createComment(req, res, next) {
    try {
      const comment = await commentService.createComment(req.params.noteId, req.user.userId, req.user.role, req.body);
      res.status(201).json(comment);
    } catch (err) {
      if (err.message === 'Note not found' || err.message === 'Parent comment not found') {
        return res.status(404).json({ error: err.message });
      }
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updateComment(req, res, next) {
    try {
      const comment = await commentService.updateComment(req.params.id, req.user.userId, req.user.role, req.body);
      res.json(comment);
    } catch (err) {
      if (err.message === 'Comment not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const result = await commentService.deleteComment(req.params.id, req.user.userId, req.user.role);
      res.json(result);
    } catch (err) {
      if (err.message === 'Comment not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updateCommentStatus(req, res, next) {
    try {
      const comment = await commentService.updateCommentStatus(req.params.id, req.user.userId, req.user.role, req.body.status);
      res.json(comment);
    } catch (err) {
      if (err.message === 'Comment not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new CommentController();
