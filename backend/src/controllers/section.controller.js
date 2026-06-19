// backend/src/controllers/section.controller.js
const sectionService = require('../services/section.service');

class SectionController {
  async createSection(req, res, next) {
    try {
      const section = await sectionService.createSection(req.params.noteId, req.user.userId, req.user.role, req.body);
      res.status(201).json(section);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updateSection(req, res, next) {
    try {
      const updated = await sectionService.updateSection(req.params.id, req.user.userId, req.user.role, req.body);
      res.json(updated);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteSection(req, res, next) {
    try {
      const result = await sectionService.deleteSection(req.params.id, req.user.userId, req.user.role);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async reorderSection(req, res, next) {
    try {
      const updated = await sectionService.reorderSection(req.params.id, req.user.userId, req.user.role, req.body.newOrder);
      res.json(updated);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new SectionController();
