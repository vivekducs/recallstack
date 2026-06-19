// backend/src/controllers/analytics.controller.js
const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const data = await analyticsService.getDashboard(req.user.userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
