// backend/src/routes/analytics.routes.js

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

// GET /api/analytics/dashboard (Authenticated)
router.get('/dashboard', authenticateToken, async (req, res, next) => {
  try {
    const authorId = req.user.userId;

    // Fetch all notes of the author to aggregate metrics
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
      if (note.status === 'PUBLISHED') {
        publishedCount++;
      } else {
        draftCount++;
      }
      totalViews += (note.views || 0);
      totalHelpful += (note.helpfulCount || 0);
      totalReadingTime += (note.readingTime || 0);
    });

    // Fetch Top 5 most revised notes
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
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    // Fetch recent note creations
    const createdNotes = await prisma.note.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true
      }
    });

    // Fetch recent comments posted
    const comments = await prisma.comment.findMany({
      where: { userId: authorId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        content: true,
        createdAt: true,
        note: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Fetch recent revisions logged
    const revisions = await prisma.revisionHistory.findMany({
      where: { userId: authorId },
      orderBy: { revisedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        revisedAt: true,
        note: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Build activities list
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
        const snippet = comment.content.length > 40
          ? `${comment.content.substring(0, 40)}...`
          : comment.content;
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

    // Sort descending chronologically
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit to top 15 timeline events
    const recentTimeline = timeline.slice(0, 15);

    // Bookmarked notes count
    const bookmarksCount = await prisma.bookmark.count({
      where: { userId: authorId }
    });

    res.json({
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
      timeline: recentTimeline
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
