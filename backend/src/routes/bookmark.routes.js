// backend/src/routes/bookmark.routes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

// GET /api/bookmarks (Authenticated - list user's bookmarked notes)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.userId },
      include: {
        note: {
          include: {
            author: { select: { id: true, name: true } },
            topic: {
              select: {
                name: true,
                slug: true,
                subject: { select: { name: true, slug: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookmarks.map(b => b.note));
  } catch (err) {
    next(err);
  }
});

// POST /api/bookmarks (Authenticated - save a note)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: 'noteId required' });
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_noteId: {
          userId: req.user.userId,
          noteId
        }
      }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: req.user.userId,
        noteId
      }
    });

    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:noteId (Authenticated - unsave a note)
router.delete('/:noteId', authenticateToken, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_noteId: {
          userId: req.user.userId,
          noteId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await prisma.bookmark.delete({
      where: {
        userId_noteId: {
          userId: req.user.userId,
          noteId
        }
      }
    });

    res.json({ deleted: true, noteId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
