// backend/src/routes/topic.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken, adminOnly } = require('../middleware/auth.middleware');
const topicController = require('../controllers/topic.controller');

// GET /api/subjects/:subjectId/topics (Public)
router.get('/', topicController.getTopics);

// POST /api/subjects/:subjectId/topics (Admin Only)
router.post('/', authenticateToken, adminOnly, topicController.createTopic);

// PUT /api/topics/:id (Admin Only)
router.put('/:id', authenticateToken, adminOnly, topicController.updateTopic);

// DELETE /api/topics/:id (Admin Only)
router.delete('/:id', authenticateToken, adminOnly, topicController.deleteTopic);

module.exports = router;
