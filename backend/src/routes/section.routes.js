// backend/src/routes/section.routes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { updateNoteReadingTime } = require('../utils/readingTime');

async function logNoteRevision(noteId, userId) {
  try {
    await prisma.$transaction([
      prisma.revisionHistory.create({
        data: {
          noteId,
          userId
        }
      }),
      prisma.note.update({
        where: { id: noteId },
        data: {
          revisionCount: { increment: 1 },
          lastRevised: new Date()
        }
      })
    ]);
  } catch (err) {
    console.error('Failed to log note revision:', err);
  }
}

// POST /api/notes/:noteId/sections (Authenticated)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { title, content, contentType, language } = req.body;

    if (!title || !content || !contentType) {
      return res.status(400).json({ error: 'title, content, contentType required' });
    }

    const validTypes = ['TEXT', 'CODE', 'EXAMPLE', 'IMAGE', 'DIAGRAM'];
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ error: `contentType must be one of: ${validTypes.join(', ')}` });
    }

    if (contentType === 'CODE' && !language) {
      return res.status(400).json({ error: 'language required for CODE sections' });
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot edit this note' });
    }

    // Get max order
    const lastSection = await prisma.section.findFirst({
      where: { noteId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastSection ? lastSection.order + 1 : 0;

    const section = await prisma.section.create({
      data: {
        title,
        content,
        contentType,
        language: language || null,
        noteId,
        order: nextOrder
      }
    });

    // Recalculate reading time for note
    await updateNoteReadingTime(noteId);

    // Log revision
    await logNoteRevision(noteId, req.user.userId);

    res.status(201).json(section);
  } catch (err) {
    next(err);
  }
});

// PUT /api/sections/:id (Owner or Admin)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, contentType, language } = req.body;

    const section = await prisma.section.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (section.note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot update this section' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (language !== undefined) updateData.language = language;

    const updated = await prisma.section.update({
      where: { id },
      data: updateData
    });

    // Recalculate reading time
    await updateNoteReadingTime(section.noteId);

    // Log revision
    await logNoteRevision(section.noteId, req.user.userId);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sections/:id (Owner or Admin)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const section = await prisma.section.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (section.note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot delete this section' });
    }

    await prisma.section.delete({ where: { id } });

    // Recalculate reading time
    await updateNoteReadingTime(section.noteId);

    // Log revision
    await logNoteRevision(section.noteId, req.user.userId);

    res.json({ deleted: true, id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/sections/:id/reorder (Owner or Admin)
router.patch('/:id/reorder', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body;

    if (newOrder === undefined || newOrder === null) {
      return res.status(400).json({ error: 'newOrder is required' });
    }

    const section = await prisma.section.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (section.note.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Cannot reorder this note' });
    }

    // Get all sections for note, sorted by order
    const sections = await prisma.section.findMany({
      where: { noteId: section.noteId },
      orderBy: { order: 'asc' }
    });

    if (newOrder < 0 || newOrder >= sections.length) {
      return res.status(400).json({ error: 'Invalid order value' });
    }

    // Rebuild order
    let reorderedSections = sections.filter(s => s.id !== id);
    reorderedSections.splice(newOrder, 0, section);

    // Update all orders in transaction
    const updates = reorderedSections.map((s, idx) =>
      prisma.section.update({
        where: { id: s.id },
        data: { order: idx }
      })
    );

    await prisma.$transaction(updates);

    // Log revision
    await logNoteRevision(section.noteId, req.user.userId);

    const updated = await prisma.section.findUnique({ where: { id } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
