// backend/src/routes/subject.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const subjectController = require('../controllers/subject.controller');

// GET /api/subjects (Public)
router.get('/', subjectController.getSubjects);

// GET /api/subjects/:id (Public)
router.get('/:id', subjectController.getSubjectById);

// POST /api/subjects (Admin Only)
router.post('/', authenticateToken, adminOnly, subjectController.createSubject);

// PUT /api/subjects/:id (Admin Only)
router.put('/:id', authenticateToken, adminOnly, subjectController.updateSubject);

// DELETE /api/subjects/:id (Admin Only)
router.delete('/:id', authenticateToken, adminOnly, subjectController.deleteSubject);

module.exports = router;
