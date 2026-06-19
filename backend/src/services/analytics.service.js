// backend/src/services/analytics.service.js
const prisma = require('../config/database');

class AnalyticsService {
  async getDashboard(authorId) {
    const notes = await prisma.note.findMany({
      where: { authorId },
      select: {
        status: true,
        views: true,
        helpfulCount: true,
        readingTime: true
      }
    });

    let draftCount = 0;
    let publishedCount = 0;
    let totalViews = 0;
    let totalHelpful = 0;
    let totalReadingTime = 0;

    notes.forEach(note => {
      if (note.status === 'PUBLISHED') publishedCount++;
      else draftCount++;
      totalViews += (note.views || 0);
      totalHelpful += (note.helpfulCount || 0);
      totalReadingTime += (note.readingTime || 0);
    });

    const mostRevised = await prisma.note.findMany({
      where: { authorId },
      orderBy: { revisionCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        revisionCount: true,
        lastRevised: true,
        topic: {
          select: {
            name: true,
            subject: {
              select: { name: true, slug: true }
            }
          }
        }
      }
    });

    const createdNotes = await prisma.note.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, createdAt: true, status: true }
    });

    const comments = await prisma.comment.findMany({
      where: { userId: authorId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, content: true, createdAt: true, note: { select: { id: true, title: true } } }
    });

    const revisions = await prisma.revisionHistory.findMany({
      where: { userId: authorId },
      orderBy: { revisedAt: 'desc' },
      take: 10,
      select: { id: true, revisedAt: true, note: { select: { id: true, title: true } } }
    });

    const timeline = [];

    createdNotes.forEach(note => {
      timeline.push({
        id: `create-note-${note.id}`,
        type: 'create_note',
        description: `Created note "${note.title}" as ${note.status.toLowerCase()}`,
        date: note.createdAt
      });
    });

    comments.forEach(comment => {
      if (comment.note) {
        const snippet = comment.content.length > 40 ? `${comment.content.substring(0, 40)}...` : comment.content;
        timeline.push({
          id: `comment-${comment.id}`,
          type: 'post_comment',
          description: `Commented on "${comment.note.title}": "${snippet}"`,
          date: comment.createdAt
        });
      }
    });

    revisions.forEach(rev => {
      if (rev.note) {
        timeline.push({
          id: `revision-${rev.id}`,
          type: 'revision',
          description: `Revised sections of "${rev.note.title}"`,
          date: rev.revisedAt
        });
      }
    });

    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTimeline = timeline.slice(0, 15);

    const bookmarksCount = await prisma.bookmark.count({
      where: { userId: authorId }
    });

    const topNotes = await prisma.note.findMany({
      where: { authorId, status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        helpfulCount: true,
        topic: { select: { subject: { select: { slug: true } }, slug: true } }
      }
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const dailyAnalytics = await prisma.noteAnalyticsDaily.findMany({
      where: {
        note: { authorId },
        date: { gte: startDate }
      },
      select: { date: true, views: true }
    });

    const dailyMap = {};
    dailyAnalytics.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!dailyMap[dateStr]) dailyMap[dateStr] = 0;
      dailyMap[dateStr] += record.views;
    });

    const dailyViews = Object.keys(dailyMap).sort().map(date => ({
      date,
      views: dailyMap[date]
    }));

    return {
      summary: {
        totalNotes: notes.length,
        draftNotes: draftCount,
        publishedNotes: publishedCount,
        totalViews,
        totalHelpful,
        totalReadingTime,
        bookmarksCount
      },
      mostRevised,
      topNotes,
      dailyViews,
      timeline: recentTimeline
    };
  }
}

module.exports = new AnalyticsService();
