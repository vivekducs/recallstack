// backend/src/controllers/roadmap.controller.js
const roadmapService = require('../services/roadmap.service');

class RoadmapController {
  // === Progress ===
  async getProgress(req, res, next) {
    try {
      const userId = req.user.userId;
      const progress = await roadmapService.getProgress(userId);
      res.json(progress);
    } catch (err) {
      next(err);
    }
  }

  async upsertProgress(req, res, next) {
    try {
      const userId = req.user.userId;
      const { itemId, completed, needsRevision } = req.body;
      const result = await roadmapService.upsertProgress(userId, itemId, completed, needsRevision);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  // === Private Notes ===
  async getNotes(req, res, next) {
    try {
      const userId = req.user.userId;
      const notes = await roadmapService.getNotes(userId);
      res.json(notes);
    } catch (err) {
      next(err);
    }
  }

  async upsertNote(req, res, next) {
    try {
      const userId = req.user.userId;
      const { itemId, content } = req.body;
      const result = await roadmapService.upsertNote(userId, itemId, content);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const userId = req.user.userId;
      const { itemId } = req.params;
      const result = await roadmapService.deleteNote(userId, itemId);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  // === Resources ===
  async getResources(req, res, next) {
    try {
      const resources = await roadmapService.getResources();
      res.json(resources);
    } catch (err) {
      next(err);
    }
  }

  async addResource(req, res, next) {
    try {
      const { itemId, title, url, type } = req.body;
      const result = await roadmapService.addResource(itemId, title, url, type);
      res.status(201).json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async deleteResource(req, res, next) {
    try {
      const { id } = req.params;
      const result = await roadmapService.deleteResource(id);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new RoadmapController();
