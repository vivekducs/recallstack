// backend/src/controllers/search.controller.js
const searchService = require('../services/search.service');

class SearchController {
  async searchNotes(req, res, next) {
    try {
      const data = await searchService.searchNotes(req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getSitemap(req, res, next) {
    try {
      const data = await searchService.getSitemap();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
