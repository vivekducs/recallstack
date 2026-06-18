// backend/src/routes/search.routes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// GET /api/search (Public - search notes & sections with filters)
router.get('/', async (req, res, next) => {
  try {
    const { q, subject, topic, difficulty } = req.query;

    const where = {
      status: 'PUBLISHED'
    };

    // Filters
    if (subject) {
      where.topic = {
        subject: {
          slug: subject
        }
      };
    }

    if (topic) {
      if (!where.topic) {
        where.topic = {};
      }
      where.topic.slug = topic;
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    // Search query
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { sections: { some: { content: { contains: q, mode: 'insensitive' } } } }
      ];
    }

    const notes = await prisma.note.findMany({
      where,
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
        author: {
          select: {
            name: true,
            username: true
          }
        },
        topic: {
          select: {
            name: true,
            slug: true,
            subject: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/search/sitemap (Public - helper endpoint for generating sitemap/RSS/llms.txt)
router.get('/sitemap', async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            notes: {
              where: { status: 'PUBLISHED' },
              include: {
                author: { select: { name: true } }
              },
              orderBy: { publishedAt: 'desc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json(subjects);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
