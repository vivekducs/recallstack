// backend/src/routes/note.routes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// GET /api/topics/:topicId/notes (Public)
router.get('/', async (req, res, next) => {
  try {
    const { topicId } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const notes = await prisma.note.findMany({
      where: { topicId, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        difficulty: true,
        readingTime: true,
        tags: true,
        author: { select: { id: true, name: true } },
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' }
    });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id (Public for published, owner/admin for drafts)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, username: true } },
        sections: { orderBy: { order: 'asc' } },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
            subject: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check authorization for drafts
    if (note.status === 'DRAFT') {
      if (!req.user || (req.user.userId !== note.authorId && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Cannot view draft notes' });
      }
    }

    // Increment view count for published notes
    if (note.status === 'PUBLISHED') {
      await prisma.note.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
    }

    res.json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes (Authenticated users)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, topicId, excerpt, difficulty, tags } = req.body;

    if (!title || !topicId) {
      return res.status(400).json({ error: 'title and topicId required' });
    }

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

    const note = await prisma.note.create({
      data: {
        title,
        slug,
        excerpt,
        difficulty: difficulty || 'MEDIUM',
        tags: tags || [],
        topicId,
        authorId: req.user.userId,
        status: 'DRAFT',
        readingTime: 0
      }
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id (Owner or Admin)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, excerpt, difficulty, tags } = req.body;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot update this note' });
    }

    const updateData = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 80);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (tags !== undefined) updateData.tags = tags;

    const updated = await prisma.note.update({
      where: { id },
      data: updateData
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notes/:id/publish (Owner or Admin)
router.patch('/:id/publish', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id },
      include: { topic: { select: { subjectId: true } } }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot publish this note' });
    }

    if (note.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Note already published' });
    }

    // Publish note and increment counts in transaction
    const result = await prisma.$transaction([
      prisma.note.update({
        where: { id },
        data: { status: 'PUBLISHED', publishedAt: new Date() }
      }),
      prisma.topic.update({
        where: { id: note.topicId },
        data: { notesCount: { increment: 1 }, lastUpdated: new Date() }
      }),
      prisma.subject.update({
        where: { id: note.topic.subjectId },
        data: { notesCount: { increment: 1 } }
      })
    ]);

    res.json(result[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id (Owner or Admin)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id },
      include: { topic: { select: { subjectId: true } } }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot delete this note' });
    }

    // If published, decrement counts
    const updateQueries = [prisma.note.delete({ where: { id } })];

    if (note.status === 'PUBLISHED') {
      updateQueries.push(
        prisma.topic.update({
          where: { id: note.topicId },
          data: { notesCount: { decrement: 1 } }
        }),
        prisma.subject.update({
          where: { id: note.topic.subjectId },
          data: { notesCount: { decrement: 1 } }
        })
      );
    }

    await prisma.$transaction(updateQueries);
    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/user/my-notes (Authenticated - get user's own notes)
router.get('/user/my-notes', authenticateToken, async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { authorId: req.user.userId },
      include: {
        topic: {
          select: {
            name: true,
            slug: true,
            subject: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
