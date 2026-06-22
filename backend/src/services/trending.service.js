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

    // Extract set of active note IDs to filter database queries
    const activeNoteIds = new Set([
      ...viewsData.map(v => v.noteId),
      ...ratingsData.map(r => r.noteId)
    ]);

    // 3. Fetch only published notes that have activity or helpful status
    const notes = await prisma.note.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { id: { in: [...activeNoteIds] } },
          { helpfulCount: { gt: 0 } }
        ]
      },
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

    // Convert arrays into lookup Maps for O(1) performance
    const viewsMap = new Map(viewsData.map(v => [v.noteId, v._sum.views || 0]));
    const ratingsMap = new Map(ratingsData.map(r => [
      r.noteId,
      { count: r._count.rating || 0, avg: r._avg.rating || 0 }
    ]));

    // 4. Calculate score for each note based on weighting
    const scoredNotes = notes.map(note => {
      const viewsCount = viewsMap.get(note.id) || 0;
      const ratingsEntry = ratingsMap.get(note.id) || { count: 0, avg: 0 };
      const ratingCount = ratingsEntry.count;
      const avgRating = ratingsEntry.avg;

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
