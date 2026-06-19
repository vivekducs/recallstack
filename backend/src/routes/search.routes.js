// backend/src/routes/search.routes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// GET /api/search (Public - search notes & sections with filters)
router.get('/', searchController.searchNotes);

// GET /api/search/sitemap (Public - helper endpoint for generating sitemap/RSS/llms.txt)
router.get('/sitemap', searchController.getSitemap);

module.exports = router;
