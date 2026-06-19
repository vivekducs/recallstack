// backend/src/routes/email.routes.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');

// POST /api/email/send-digest (Trigger digest job)
router.post('/send-digest', async (req, res, next) => {
  try {
    const result = await emailService.sendDailyDigest();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
