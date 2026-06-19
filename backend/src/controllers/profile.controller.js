// backend/src/controllers/profile.controller.js
const profileService = require('../services/profile.service');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const currentUserId = req.user ? req.user.userId : null;
      const profile = await profileService.getProfile(req.params.username, currentUserId);
      res.json(profile);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async followUser(req, res, next) {
    try {
      const result = await profileService.followUser(req.user.userId, req.params.username);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const result = await profileService.unfollowUser(req.user.userId, req.params.username);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new ProfileController();
