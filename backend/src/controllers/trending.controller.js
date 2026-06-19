// backend/src/controllers/trending.controller.js
const trendingService = require('../services/trending.service');

class TrendingController {
  async getTrendingNotes(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 7;
      const limit = parseInt(req.query.limit) || 20;
      
      const notes = await trendingService.getTrendingNotes(days, limit);
      res.json(notes);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new TrendingController();
