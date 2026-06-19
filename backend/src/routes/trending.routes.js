// backend/src/routes/trending.routes.js
const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trending.controller');

// GET /api/trending (Public)
router.get('/', trendingController.getTrendingNotes);

module.exports = router;
