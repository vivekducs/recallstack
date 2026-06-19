// backend/src/routes/email.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const emailService = require('../services/email.service');

// POST /api/email/send-digest (Trigger digest job - Admin Only)
router.post('/send-digest', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const result = await emailService.sendDailyDigest();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
