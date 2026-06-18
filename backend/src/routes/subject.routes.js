// backend/src/routes/subject.routes.js

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, adminOnly } = require('../middleware/auth.middleware');

// GET /api/subjects (Public)
router.get('/', async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        topicsCount: true,
        notesCount: true
      },
      orderBy: { order: 'asc' }
    });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
});

// GET /api/subjects/:id (Public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support lookup by ID or slug
    const subject = await prisma.subject.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        topics: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            notesCount: true,
            lastUpdated: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

// POST /api/subjects (Admin Only)
router.post('/', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { name, slug, description, icon, color } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug required' });
    }

    // Validate slug format (lowercase, hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' });
    }

    // Check uniqueness
    const existing = await prisma.subject.findFirst({
      where: { OR: [{ name }, { slug }] }
    });
    if (existing) {
      return res.status(409).json({ error: 'Subject name or slug already exists' });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        topicsCount: 0,
        notesCount: 0
      }
    });
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
});

// PUT /api/subjects/:id (Admin Only)
router.put('/:id', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, order } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;

    const subject = await prisma.subject.update({
      where: { id },
      data: updateData
    });
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subjects/:id (Admin Only)
router.delete('/:id', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
