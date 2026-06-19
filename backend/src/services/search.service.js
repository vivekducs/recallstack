// backend/src/services/search.service.js
const prisma = require('../config/database');

class SearchService {
  async searchNotes(query) {
    const { q, subject, topic, difficulty, sort, limit, page } = query;

    const where = { status: 'PUBLISHED' };

    if (subject) {
      where.topic = { subject: { slug: subject } };
    }

    if (topic) {
      if (!where.topic) where.topic = {};
      where.topic.slug = topic;
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { sections: { some: { content: { contains: q, mode: 'insensitive' } } } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    let orderBy = { publishedAt: 'desc' };
    if (sort === 'popular') {
      orderBy = { views: 'desc' };
    } else if (sort === 'relevance') {
      orderBy = { publishedAt: 'desc' }; 
    }

    const [total, notes] = await prisma.$transaction([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          difficulty: true,
          readingTime: true,
          tags: true,
          publishedAt: true,
          updatedAt: true,
          views: true,
          helpfulCount: true,
          averageRating: true,
          ratingCount: true,
          author: {
            select: { name: true, username: true }
          },
          topic: {
            select: {
              name: true,
              slug: true,
              subject: { select: { name: true, slug: true } }
            }
          }
        },
        orderBy
      })
    ]);

    return {
      results: notes,
      total,
      page: pageNum,
      limit: limitNum
    };
  }

  async getSitemap() {
    return await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            notes: {
              where: { status: 'PUBLISHED' },
              include: { author: { select: { name: true } } },
              orderBy: { publishedAt: 'desc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  }
}

module.exports = new SearchService();
