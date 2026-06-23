// backend/src/controllers/note.controller.js
const noteService = require('../services/note.service');

class NoteController {
  async getNotesByTopic(req, res, next) {
    try {
      const notes = await noteService.getNotesByTopic(req.params.topicId);
      res.json(notes);
    } catch (err) {
      if (err.message === 'Topic not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async getMyNotes(req, res, next) {
    try {
      const { cursor, limit } = req.query;
      const notes = await noteService.getMyNotes(req.user.userId, cursor, limit);
      res.json(notes);
    } catch (err) {
      next(err);
    }
  }

  async getNoteById(req, res, next) {
    try {
      const note = await noteService.getNoteById(req.params.id, req.user);
      res.json(note);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async createNote(req, res, next) {
    try {
      const note = await noteService.createNote(req.user.userId, req.body);
      res.status(201).json(note);
    } catch (err) {
      if (err.message === 'Topic not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updateNote(req, res, next) {
    try {
      const updated = await noteService.updateNote(req.params.id, req.user.userId, req.user.role, req.body);
      res.json(updated);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async publishNote(req, res, next) {
    try {
      const note = await noteService.publishNote(req.params.id, req.user.userId, req.user.role);
      res.json(note);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const result = await noteService.deleteNote(req.params.id, req.user.userId, req.user.role);
      res.json(result);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getNoteAnalytics(req, res, next) {
    try {
      const data = await noteService.getNoteAnalytics(req.params.id, req.user.userId, req.user.role);
      res.json(data);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getNoteAnalyticsDaily(req, res, next) {
    try {
      const data = await noteService.getNoteAnalyticsDaily(req.params.id, req.user.userId, req.user.role, req.query.days);
      res.json(data);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getNoteRating(req, res, next) {
    try {
      const data = await noteService.getNoteRating(req.params.id, req.user ? req.user.userId : null);
      res.json(data);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async rateNote(req, res, next) {
    try {
      const data = await noteService.rateNote(req.params.id, req.user.userId, req.body.rating);
      res.json(data);
    } catch (err) {
      if (err.message === 'Note not found') return res.status(404).json({ error: err.message });
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteNoteRating(req, res, next) {
    try {
      const data = await noteService.deleteNoteRating(req.params.id, req.user.userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NoteController();
