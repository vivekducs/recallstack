// backend/src/services/note.service.js
const prisma = require('../config/database');
const noteRepository = require('../repositories/note.repository');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
const slugify = require('../utils/slugify');

class NoteService {
  async getNotesByTopic(topicId) {
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new Error('Topic not found');

    return await noteRepository.findMany({
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
  }

  async getMyNotes(userId, cursor, limit = 20) {
    const limitNum = parseInt(limit) || 20;
    
    const options = {
      where: { authorId: userId },
      take: limitNum + 1,
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
    };

    if (cursor) {
      options.cursor = { id: cursor };
      options.skip = 1;
    }

    const notes = await noteRepository.findMany(options);
    
    let nextCursor = null;
    if (notes.length > limitNum) {
      const nextItem = notes.pop();
      nextCursor = nextItem.id;
    }

    return {
      results: notes,
      nextCursor,
      limit: limitNum
    };
  }

  async getNoteBySlugs(subjectSlug, topicSlug, noteSlug, user) {
    const note = await prisma.note.findFirst({
      where: {
        slug: noteSlug,
        topic: {
          slug: topicSlug,
          subject: {
            slug: subjectSlug
          }
        }
      },
      include: {
        author: { select: { id: true, name: true, username: true } },
        sections: { orderBy: { order: 'asc' } },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
            subject: { select: { id: true, name: true, slug: true } }
          }
        }
      }
    });

    if (!note) throw new Error('Note not found');

    // Check authorization for drafts
    if (note.status === 'DRAFT') {
      if (!user || (user.userId !== note.authorId && user.role !== 'ADMIN')) {
        const err = new Error('Cannot view draft notes');
        err.status = 403;
        throw err;
      }
    }

    // Increment view count for published notes in the background
    if (note.status === 'PUBLISHED') {
      const id = note.id;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      prisma.$transaction([
        noteRepository.update(id, { views: { increment: 1 } }),
        prisma.noteAnalyticsDaily.upsert({
          where: { noteId_date: { noteId: id, date: today } },
          update: { views: { increment: 1 } },
          create: { noteId: id, date: today, views: 1 }
        })
      ]).catch(err => console.error('Failed to increment views in background:', err));
    }

    return note;
  }

  async getNoteById(id, user) {
    const note = await noteRepository.findById(id, {
      author: { select: { id: true, name: true, username: true } },
      sections: { orderBy: { order: 'asc' } },
      topic: {
        select: {
          id: true,
          name: true,
          slug: true,
          subject: { select: { id: true, name: true, slug: true } }
        }
      }
    });

    if (!note) throw new Error('Note not found');

    // Check authorization for drafts
    if (note.status === 'DRAFT') {
      if (!user || (user.userId !== note.authorId && user.role !== 'ADMIN')) {
        const err = new Error('Cannot view draft notes');
        err.status = 403;
        throw err;
      }
    }

    // Increment view count for published notes in the background
    if (note.status === 'PUBLISHED') {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      prisma.$transaction([
        noteRepository.update(id, { views: { increment: 1 } }),
        prisma.noteAnalyticsDaily.upsert({
          where: { noteId_date: { noteId: id, date: today } },
          update: { views: { increment: 1 } },
          create: { noteId: id, date: today, views: 1 }
        })
      ]).catch(err => console.error('Failed to increment views in background:', err));
    }

    return note;
  }

  async createNote(userId, data) {
    const { title, topicId, excerpt, difficulty, tags } = data;
    if (!title || !topicId) {
      const err = new Error('title and topicId required');
      err.status = 400;
      throw err;
    }

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new Error('Topic not found');

    const slug = slugify(title);

    return await noteRepository.create({
      title,
      slug,
      excerpt,
      difficulty: difficulty || 'MEDIUM',
      tags: tags || [],
      topicId,
      authorId: userId,
      status: 'DRAFT',
      readingTime: 0
    });
  }

  async updateNote(id, userId, role, data) {
    const note = await noteRepository.findById(id);
    if (!note) throw new Error('Note not found');
    if (note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot update this note');
      err.status = 403;
      throw err;
    }

    const updateData = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = slugify(data.title);
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.tags !== undefined) updateData.tags = data.tags;

    return await noteRepository.update(id, updateData);
  }

  async publishNote(id, userId, role) {
    const note = await noteRepository.findById(id, {
      topic: { select: { subjectId: true } }
    });

    if (!note) throw new Error('Note not found');
    if (note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot publish this note');
      err.status = 403;
      throw err;
    }
    if (note.status === 'PUBLISHED') {
      const err = new Error('Note already published');
      err.status = 400;
      throw err;
    }

    const result = await prisma.$transaction([
      noteRepository.update(id, { status: 'PUBLISHED', publishedAt: new Date() }),
      prisma.topic.update({
        where: { id: note.topicId },
        data: { notesCount: { increment: 1 }, lastUpdated: new Date() }
      }),
      prisma.subject.update({
        where: { id: note.topic.subjectId },
        data: { notesCount: { increment: 1 } }
      })
    ]);

    return result[0];
  }

  async deleteNote(id, userId, role) {
    const note = await noteRepository.findById(id, {
      topic: { select: { subjectId: true } }
    });

    if (!note) throw new Error('Note not found');
    if (note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot delete this note');
      err.status = 403;
      throw err;
    }

    const updateQueries = [noteRepository.delete(id)];

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
    return { deleted: true, id };
  }

  async getNoteAnalytics(id, userId, role) {
    const note = await noteRepository.findById(id, {
      _count: { select: { comments: true } }
    });

    if (!note) throw new Error('Note not found');
    if (note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot view analytics for this note');
      err.status = 403;
      throw err;
    }

    return {
      views: note.views,
      helpfulCount: note.helpfulCount,
      commentsCount: note._count.comments,
      status: note.status,
      publishedAt: note.publishedAt
    };
  }

  async getNoteAnalyticsDaily(id, userId, role, days = 30) {
    const note = await noteRepository.findById(id);

    if (!note) throw new Error('Note not found');
    if (note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot view analytics for this note');
      err.status = 403;
      throw err;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    return await prisma.noteAnalyticsDaily.findMany({
      where: {
        noteId: id,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
  }

  async getNoteRating(id, userId) {
    const note = await noteRepository.findById(id);
    if (!note) throw new Error('Note not found');

    let userRating = null;
    if (userId) {
      const existing = await prisma.noteRating.findUnique({
        where: { userId_noteId: { userId, noteId: id } }
      });
      if (existing) userRating = existing.rating;
    }

    return {
      averageRating: note.averageRating,
      ratingCount: note.ratingCount,
      userRating
    };
  }

  async rateNote(id, userId, rating) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      const err = new Error('Rating must be an integer between 1 and 5');
      err.status = 400;
      throw err;
    }

    const note = await noteRepository.findById(id, { author: true });
    if (!note) throw new Error('Note not found');

    const rater = await userRepository.findById(userId);

    await prisma.noteRating.upsert({
      where: { userId_noteId: { userId, noteId: id } },
      update: { rating },
      create: { rating, userId, noteId: id }
    });

    const aggregations = await prisma.noteRating.aggregate({
      where: { noteId: id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const newAverage = aggregations._avg.rating || 0;
    const newCount = aggregations._count.rating || 0;

    const updatedNote = await noteRepository.update(id, {
      averageRating: newAverage,
      ratingCount: newCount
    }, {
      averageRating: true,
      ratingCount: true
    });

    if (rater && note.authorId !== userId) {
      emailService.sendRatingNotification(note.author, rater, note.title, rating)
        .catch(err => console.error('Rating email failed:', err));
    }

    return {
      averageRating: updatedNote.averageRating,
      ratingCount: updatedNote.ratingCount,
      userRating: rating
    };
  }

  async deleteNoteRating(id, userId) {
    await prisma.noteRating.deleteMany({
      where: { userId, noteId: id }
    });

    const aggregations = await prisma.noteRating.aggregate({
      where: { noteId: id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const newAverage = aggregations._avg.rating || 0;
    const newCount = aggregations._count.rating || 0;

    const updatedNote = await noteRepository.update(id, {
      averageRating: newAverage,
      ratingCount: newCount
    }, {
      averageRating: true,
      ratingCount: true
    });

    return {
      deleted: true,
      averageRating: updatedNote.averageRating,
      ratingCount: updatedNote.ratingCount,
      userRating: null
    };
  }
}

module.exports = new NoteService();
