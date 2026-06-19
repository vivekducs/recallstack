// backend/src/services/revision.service.js
const prisma = require('../config/database');

class RevisionService {
  async getRevisions(noteId, user) {
    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!note) throw new Error('Note not found');

    if (note.status === 'DRAFT') {
      if (!user || (user.userId !== note.authorId && user.role !== 'ADMIN')) {
        const err = new Error('Cannot view draft note revisions');
        err.status = 403;
        throw err;
      }
    }

    return await prisma.revisionHistory.findMany({
      where: { noteId },
      include: {
        user: {
          select: { name: true, username: true, avatar: true }
        }
      },
      orderBy: { revisedAt: 'desc' },
      // Exclude snapshot array from the list view to save bandwidth
      select: {
        id: true,
        noteId: true,
        userId: true,
        revisedAt: true,
        user: { select: { name: true, username: true, avatar: true } }
      }
    });
  }

  async getRevisionSnapshot(noteId, revisionId, user) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new Error('Note not found');

    if (note.status === 'DRAFT') {
      if (!user || (user.userId !== note.authorId && user.role !== 'ADMIN')) {
        const err = new Error('Cannot view draft note revisions');
        err.status = 403;
        throw err;
      }
    }

    const revision = await prisma.revisionHistory.findUnique({
      where: { id: revisionId }
    });

    if (!revision || revision.noteId !== noteId) {
      const err = new Error('Revision not found');
      err.status = 404;
      throw err;
    }

    return revision;
  }

  async restoreRevision(noteId, revisionId, user) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new Error('Note not found');

    if (note.authorId !== user.userId && user.role !== 'ADMIN') {
      const err = new Error('Cannot restore this note');
      err.status = 403;
      throw err;
    }

    const revision = await prisma.revisionHistory.findUnique({
      where: { id: revisionId }
    });

    if (!revision || revision.noteId !== noteId) {
      const err = new Error('Revision not found');
      err.status = 404;
      throw err;
    }

    if (!revision.snapshot) {
      const err = new Error('No snapshot data available for this revision');
      err.status = 400;
      throw err;
    }

    const snapshotData = revision.snapshot; // Expected to be an array of sections

    // Transaction to replace current sections
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing sections
      await tx.section.deleteMany({
        where: { noteId }
      });

      // 2. Insert snapshot sections
      if (Array.isArray(snapshotData) && snapshotData.length > 0) {
        const newSections = snapshotData.map(s => ({
          noteId,
          title: s.title,
          content: s.content,
          contentType: s.contentType,
          language: s.language,
          order: s.order
        }));
        await tx.section.createMany({
          data: newSections
        });
      }

      // 3. Log a new revision of this restore action
      const currentSections = await tx.section.findMany({
        where: { noteId },
        orderBy: { order: 'asc' }
      });

      await tx.revisionHistory.create({
        data: {
          noteId,
          userId: user.userId,
          snapshot: JSON.parse(JSON.stringify(currentSections))
        }
      });

      // 4. Update note metadata
      await tx.note.update({
        where: { id: noteId },
        data: {
          revisionCount: { increment: 1 },
          lastRevised: new Date()
        }
      });
    });

    return { success: true, message: 'Note restored successfully' };
  }
}

module.exports = new RevisionService();
