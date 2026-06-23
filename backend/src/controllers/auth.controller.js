// backend/src/controllers/auth.controller.js
const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      res.cookie('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.status(201).json(data);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const data = await authService.login(req.body);
      res.cookie('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.json(data);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
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

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new AuthController();
