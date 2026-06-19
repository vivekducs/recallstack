// backend/src/services/section.service.js
const prisma = require('../config/database');
const sectionRepository = require('../repositories/section.repository');
const noteRepository = require('../repositories/note.repository');
const revisionRepository = require('../repositories/revision.repository');
const { updateNoteReadingTime } = require('../utils/readingTime');

class SectionService {
  async logNoteRevision(noteId, userId) {
    try {
      const currentSections = await sectionRepository.findMany({
        where: { noteId },
        orderBy: { order: 'asc' }
      });

      await prisma.$transaction([
        revisionRepository.create({
          noteId, 
          userId,
          snapshot: JSON.parse(JSON.stringify(currentSections))
        }),
        noteRepository.update(noteId, {
          revisionCount: { increment: 1 },
          lastRevised: new Date()
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

    const note = await noteRepository.findById(noteId);
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

    const lastSection = await sectionRepository.findFirst({
      where: { noteId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastSection ? lastSection.order + 1 : 0;

    const section = await sectionRepository.create({
      title,
      content,
      contentType,
      language: language || null,
      noteId,
      order: nextOrder
    });

    await updateNoteReadingTime(noteId);
    await this.logNoteRevision(noteId, userId);

    return section;
  }

  async updateSection(id, userId, role, data) {
    const { title, content, contentType, language } = data;

    const section = await sectionRepository.findById(id, { note: true });

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

    const updated = await sectionRepository.update(id, updateData);

    await updateNoteReadingTime(section.noteId);
    await this.logNoteRevision(section.noteId, userId);

    return updated;
  }

  async deleteSection(id, userId, role) {
    const section = await sectionRepository.findById(id, { note: true });

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

    await sectionRepository.delete(id);

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

    const section = await sectionRepository.findById(id, { note: true });

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

    const sections = await sectionRepository.findMany({
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

    return await sectionRepository.findById(id);
  }
}

module.exports = new SectionService();
