// backend/src/routes/revision.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../config/database');
const { optionalAuth } = require('../middleware/auth.middleware');

// GET /api/notes/:noteId/revisions (Public for published, owner/admin for drafts)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check authorization for drafts
    if (note.status === 'DRAFT') {
      if (!req.user || (req.user.userId !== note.authorId && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Cannot view draft note revisions' });
      }
    }

    const revisions = await prisma.revisionHistory.findMany({
      where: { noteId },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { revisedAt: 'desc' }
    });

    res.json(revisions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
