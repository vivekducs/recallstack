// backend/src/services/search.service.js
const prisma = require('../config/database');
const { redisClient, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

let localSitemapCache = null;
let localSitemapCacheExpiry = 0;
const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const SITEMAP_CACHE_TTL_SEC = 3600; // 1 hour

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
    const cacheKey = 'cache:sitemap';

    // 1. Try Redis cache
    if (isRedisAvailable()) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          logger.info('[SearchService] Sitemap fetched from Redis cache');
          return JSON.parse(cachedData);
        }
      } catch (err) {
        logger.error('[SearchService] Redis sitemap cache get failed:', err);
      }
    } else {
      // 2. Try in-memory cache fallback
      const now = Date.now();
      if (localSitemapCache && now < localSitemapCacheExpiry) {
        logger.info('[SearchService] Sitemap fetched from in-memory cache');
        return localSitemapCache;
      }
    }

    // Cache miss: query the database with optimal fields select
    logger.info('[SearchService] Sitemap cache miss. Querying database...');
    const data = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        updatedAt: true,
        order: true,
        topics: {
          select: {
            id: true,
            name: true,
            slug: true,
            updatedAt: true,
            order: true,
            notes: {
              where: { status: 'PUBLISHED' },
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                publishedAt: true,
                updatedAt: true,
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

    // 3. Save cache
    if (isRedisAvailable()) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(data), 'EX', SITEMAP_CACHE_TTL_SEC);
      } catch (err) {
        logger.error('[SearchService] Redis sitemap cache set failed:', err);
      }
    } else {
      localSitemapCache = data;
      localSitemapCacheExpiry = Date.now() + SITEMAP_CACHE_TTL_MS;
    }

    return data;
  }
}

module.exports = new SearchService();
