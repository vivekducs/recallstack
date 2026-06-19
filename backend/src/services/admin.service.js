// backend/src/services/admin.service.js
const prisma = require('../config/database');

class AdminService {
  async getUsers(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { notes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        noteCount: u._count.notes
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      const err = new Error('You cannot delete your own admin account');
      err.status = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // Cascade deletes (follows, notes, comments, bookmarks, ratings) are handled automatically by DB schema relations.
    await prisma.user.delete({ where: { id } });
    return { success: true, id };
  }

  async getNotes(page = 1, limit = 10, search = '', status = '') {
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, username: true } },
          topic: { select: { id: true, name: true, subject: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.note.count({ where })
    ]);

    return {
      notes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async unpublishNote(id) {
    const note = await prisma.note.findUnique({
      where: { id },
      include: { topic: true }
    });

    if (!note) {
      const err = new Error('Note not found');
      err.status = 404;
      throw err;
    }

    if (note.status !== 'PUBLISHED') {
      const err = new Error('Note is not published');
      err.status = 400;
      throw err;
    }

    await prisma.$transaction([
      prisma.note.update({
        where: { id },
        data: { status: 'DRAFT', publishedAt: null }
      }),
      prisma.topic.update({
        where: { id: note.topicId },
        data: { notesCount: { decrement: 1 } }
      }),
      prisma.subject.update({
        where: { id: note.topic.subjectId },
        data: { notesCount: { decrement: 1 } }
      })
    ]);

    return { success: true, id };
  }

  async getComments(page = 1, limit = 10, status = 'PENDING') {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { status },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
          note: { select: { id: true, title: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.comment.count({ where: { status } })
    ]);

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAnalytics() {
    const totalUsers = await prisma.user.count();
    const totalNotes = await prisma.note.count();
    const totalComments = await prisma.comment.count();
    const totalBookmarks = await prisma.bookmark.count();

    const publishedNotes = await prisma.note.count({ where: { status: 'PUBLISHED' } });
    const draftNotes = await prisma.note.count({ where: { status: 'DRAFT' } });
    const archivedNotes = await prisma.note.count({ where: { status: 'ARCHIVED' } });

    // Estimation of active users who did anything in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { notes: { some: { updatedAt: { gte: sevenDaysAgo } } } },
          { comments: { some: { createdAt: { gte: sevenDaysAgo } } } }
        ]
      }
    });

    const averageNotesPerUser = totalUsers > 0 ? parseFloat((totalNotes / totalUsers).toFixed(2)) : 0;

    // Top authors ordered by note count
    const topAuthorsRaw = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        _count: {
          select: { notes: true }
        }
      },
      orderBy: {
        notes: {
          _count: 'desc'
        }
      }
    });

    const topAuthors = topAuthorsRaw.map(author => ({
      id: author.id,
      name: author.name,
      username: author.username,
      email: author.email,
      noteCount: author._count.notes
    }));

    return {
      totalUsers,
      activeUsers,
      totalNotes,
      publishedNotes,
      draftNotes,
      archivedNotes,
      totalComments,
      totalBookmarks,
      averageNotesPerUser,
      topAuthors
    };
  }
}

module.exports = new AdminService();
