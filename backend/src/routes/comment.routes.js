// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const emailService = require('../services/email.service');

// GET /api/notes/:noteId/comments (Public/Optional Auth - get comment tree)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const where = { noteId };

    // Filter comments based on auth status
    if (!req.user || req.user.role !== 'ADMIN') {
      where.OR = [
        { status: 'APPROVED' },
        ...(req.user ? [
          { userId: req.user.userId },
          { note: { authorId: req.user.userId } }
        ] : [])
      ];
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Build comment tree in memory
    const commentMap = {};
    const rootComments = [];

    comments.forEach(c => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    comments.forEach(c => {
      const mapped = commentMap[c.id];
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(mapped);
      } else {
        rootComments.push(mapped);
      }
    });

    res.json(rootComments);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes/:noteId/comments (Authenticated - post a comment or reply)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { content, parentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    // Verify note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { author: true }
    });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // If parentId provided, verify parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    // Determine initial status:
    // Auto-approve if user is note author, admin, or in development mode
    let initialStatus = 'PENDING';
    if (
      req.user.userId === note.authorId ||
      req.user.role === 'ADMIN' ||
      process.env.NODE_ENV === 'development'
    ) {
      initialStatus = 'APPROVED';
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        parentId: parentId || null,
        noteId,
        userId: req.user.userId,
        status: initialStatus
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Trigger email notification (don't block response)
    if (req.user.userId !== note.authorId) {
      emailService.sendCommentNotification(
        note.author,
        comment.user,
        note.title,
        comment.content
      ).catch(err => console.error('Email failed:', err));
    }

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// PUT /api/comments/:id (Authenticated - edit comment content)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Authorization check (owner or admin)
    if (comment.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot edit this comment' });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id (Authenticated - delete comment)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Authorization check (owner of comment, note author, or admin)
    if (
      comment.userId !== req.user.userId &&
      comment.note.authorId !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ error: 'Cannot delete this comment' });
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/comments/:id/status (Authenticated - approve/reject comment)
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Authorization check (note author or admin only)
    if (comment.note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Moderation requires note ownership or admin role' });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
