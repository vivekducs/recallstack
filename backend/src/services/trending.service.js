// backend/src/services/trending.service.js
const prisma = require('../config/database');

class TrendingService {
  async getTrendingNotes(days = 7, limit = 20) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get analytics for the last X days and group by noteId
    const trendingData = await prisma.noteAnalyticsDaily.groupBy({
      by: ['noteId'],
      where: {
        date: {
          gte: cutoffDate
        }
      },
      _sum: {
        views: true
      },
      orderBy: {
        _sum: {
          views: 'desc'
        }
      },
      take: limit
    });

    if (trendingData.length === 0) {
      // Fallback: If no recent analytics data, just return most viewed overall
      return await prisma.note.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { views: 'desc' },
        take: limit,
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
    }

    // Fetch the actual notes
    const noteIds = trendingData.map(t => t.noteId);
    
    const notes = await prisma.note.findMany({
      where: {
        id: { in: noteIds },
        status: 'PUBLISHED'
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

    // Reorder notes according to the trendingData order
    const orderedNotes = trendingData
      .map(t => notes.find(n => n.id === t.noteId))
      .filter(n => n !== undefined); // Ensure only published notes that exist are returned

    return orderedNotes;
  }
}

module.exports = new TrendingService();
