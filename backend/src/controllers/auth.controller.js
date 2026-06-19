// backend/src/controllers/auth.controller.js
const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      res.status(201).json(data);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      res.json(data);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.userId);
      res.json(user);
    } catch (err) {
      if (err.message === 'User not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await authService.updateProfile(req.user.userId, req.body);
      res.json(updated);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const preferences = await authService.updatePreferences(req.user.userId, req.body);
      res.json(preferences);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
