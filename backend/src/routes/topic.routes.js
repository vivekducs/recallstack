// backend/src/routes/topic.routes.js

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :subjectId
const prisma = require('../config/database');
const { authenticateToken, adminOnly } = require('../middleware/auth.middleware');

// GET /api/subjects/:subjectId/topics (Public)
router.get('/', async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    // Support lookup by ID or slug
    const subject = await prisma.subject.findFirst({
      where: {
        OR: [{ id: subjectId }, { slug: subjectId }]
      }
    });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const topics = await prisma.topic.findMany({
      where: { subjectId: subject.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        notesCount: true,
        lastUpdated: true
      },
      orderBy: { order: 'asc' }
    });
    res.json(topics);
  } catch (err) {
    next(err);
  }
});

// POST /api/subjects/:subjectId/topics (Admin Only)
router.post('/', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug required' });
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Check slug uniqueness within subject
    const existing = await prisma.topic.findFirst({
      where: { subjectId, slug }
    });
    if (existing) {
      return res.status(409).json({ error: 'Topic slug already exists in this subject' });
    }

    // Create topic AND increment subject count in transaction
    const result = await prisma.$transaction([
      prisma.topic.create({
        data: {
          name,
          slug,
          description,
          subjectId,
          notesCount: 0
        }
      }),
      prisma.subject.update({
        where: { id: subjectId },
        data: { topicsCount: { increment: 1 } }
      })
    ]);

    res.status(201).json(result[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/topics/:id (Admin Only)
router.put('/:id', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, order } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;

    const topic = await prisma.topic.update({
      where: { id },
      data: updateData
    });
    res.json(topic);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/topics/:id (Admin Only)
router.delete('/:id', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id }
    });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Delete topic and decrement subject count in transaction
    await prisma.$transaction([
      prisma.topic.delete({ where: { id } }),
      prisma.subject.update({
        where: { id: topic.subjectId },
        data: {
          topicsCount: { decrement: 1 },
          notesCount: { decrement: topic.notesCount }
        }
      })
    ]);

    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
