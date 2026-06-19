// backend/src/services/section.service.js
const prisma = require('../config/database');
const { updateNoteReadingTime } = require('../utils/readingTime');

class SectionService {
  async logNoteRevision(noteId, userId) {
    try {
      const currentSections = await prisma.section.findMany({
        where: { noteId },
        orderBy: { order: 'asc' }
      });

      await prisma.$transaction([
        prisma.revisionHistory.create({
          data: { 
            noteId, 
            userId,
            snapshot: JSON.parse(JSON.stringify(currentSections))
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

  async createSection(noteId, userId, role, data) {
    const { title, content, contentType, language } = data;

    if (!title || !content || !contentType) {
      const err = new Error('title, content, contentType required');
      err.status = 400;
      throw err;
    }

    const validTypes = ['TEXT', 'CODE', 'EXAMPLE', 'IMAGE', 'DIAGRAM'];
    if (!validTypes.includes(contentType)) {
      const err = new Error(`contentType must be one of: ${validTypes.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (contentType === 'CODE' && !language) {
      const err = new Error('language required for CODE sections');
      err.status = 400;
      throw err;
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      const err = new Error('Note not found');
      err.status = 404;
      throw err;
    }

    if (note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot edit this note');
      err.status = 403;
      throw err;
    }

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

    await updateNoteReadingTime(noteId);
    await this.logNoteRevision(noteId, userId);

    return section;
  }

  async updateSection(id, userId, role, data) {
    const { title, content, contentType, language } = data;

    const section = await prisma.section.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!section) {
      const err = new Error('Section not found');
      err.status = 404;
      throw err;
    }

    if (section.note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot update this section');
      err.status = 403;
      throw err;
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

    await updateNoteReadingTime(section.noteId);
    await this.logNoteRevision(section.noteId, userId);

    return updated;
  }

  async deleteSection(id, userId, role) {
    const section = await prisma.section.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!section) {
      const err = new Error('Section not found');
      err.status = 404;
      throw err;
    }

    if (section.note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot delete this section');
      err.status = 403;
      throw err;
    }

    await prisma.section.delete({ where: { id } });

    await updateNoteReadingTime(section.noteId);
    await this.logNoteRevision(section.noteId, userId);

    return { deleted: true, id };
  }

  async reorderSection(id, userId, role, newOrder) {
    if (newOrder === undefined || newOrder === null) {
      const err = new Error('newOrder is required');
      err.status = 400;
      throw err;
    }

    const section = await prisma.section.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!section) {
      const err = new Error('Section not found');
      err.status = 404;
      throw err;
    }

    if (section.note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot reorder this note');
      err.status = 403;
      throw err;
    }

    const sections = await prisma.section.findMany({
      where: { noteId: section.noteId },
      orderBy: { order: 'asc' }
    });

    if (newOrder < 0 || newOrder >= sections.length) {
      const err = new Error('Invalid order value');
      err.status = 400;
      throw err;
    }

    let reorderedSections = sections.filter(s => s.id !== id);
    reorderedSections.splice(newOrder, 0, section);

    const updates = reorderedSections.map((s, idx) =>
      prisma.section.update({
        where: { id: s.id },
        data: { order: idx }
      })
    );

    await prisma.$transaction(updates);
    await this.logNoteRevision(section.noteId, userId);

    return await prisma.section.findUnique({ where: { id } });
  }
}

module.exports = new SectionService();
