// backend/src/services/bookmark.service.js
const prisma = require('../config/database');

class BookmarkService {
  async getBookmarks(userId) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
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
    return bookmarks.map(b => b.note);
  }

  async addBookmark(userId, noteId) {
    if (!noteId) {
      const err = new Error('noteId required');
      err.status = 400;
      throw err;
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      const err = new Error('Note not found');
      err.status = 404;
      throw err;
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_noteId: { userId, noteId } }
    });

    if (existing) return existing;

    return await prisma.bookmark.create({
      data: { userId, noteId }
    });
  }

  async removeBookmark(userId, noteId) {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_noteId: { userId, noteId } }
    });

    if (!existing) {
      const err = new Error('Bookmark not found');
      err.status = 404;
      throw err;
    }

    await prisma.bookmark.delete({
      where: { userId_noteId: { userId, noteId } }
    });

    return { deleted: true, noteId };
  }
}

module.exports = new BookmarkService();
