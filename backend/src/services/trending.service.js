// backend/src/services/trending.service.js
const prisma = require('../config/database');

class TrendingService {
  async getTrendingNotes(days = 7, limit = 20) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // 1. Fetch daily views for all notes within the time period
    const viewsData = await prisma.noteAnalyticsDaily.groupBy({
      by: ['noteId'],
      where: {
        date: {
          gte: cutoffDate
        }
      },
      _sum: {
        views: true
      }
    });

    // 2. Fetch all ratings created within the time period
    const ratingsData = await prisma.noteRating.groupBy({
      by: ['noteId'],
      where: {
        createdAt: {
          gte: cutoffDate
        }
      },
      _count: {
        rating: true
      },
      _avg: {
        rating: true
      }
    });

    // 3. Fetch all published notes to get their helpfulCount and overall fields
    const notes = await prisma.note.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: { select: { name: true, username: true } },
        topic: {
          select: {
            name: true,
            slug: true,
            subject: { select: { name: true, slug: true } }
          }
        }
      }
    });

    // 4. Calculate score for each note based on weighting:
    // views (40%) + ratings (40%) + helpful (20%)
    const scoredNotes = notes.map(note => {
      const viewsEntry = viewsData.find(v => v.noteId === note.id);
      const viewsCount = viewsEntry ? (viewsEntry._sum.views || 0) : 0;

      const ratingsEntry = ratingsData.find(r => r.noteId === note.id);
      const ratingCount = ratingsEntry ? (ratingsEntry._count.rating || 0) : 0;
      const avgRating = ratingsEntry ? (ratingsEntry._avg.rating || 0) : 0;

      // Score calculation formula:
      // score = (viewsCount * 0.4) + ((avgRating * ratingCount) * 0.4) + (note.helpfulCount * 0.2)
      const score = (viewsCount * 0.4) + ((avgRating * ratingCount) * 0.4) + (note.helpfulCount * 0.2);

      return { note, score };
    });

    // Sort descending by score
    scoredNotes.sort((a, b) => b.score - a.score);

    // Return the top notes, mapping the trendingScore in the response
    return scoredNotes.slice(0, limit).map(sn => ({
      ...sn.note,
      trendingScore: parseFloat(sn.score.toFixed(2))
    }));
  }
}

module.exports = new TrendingService();
