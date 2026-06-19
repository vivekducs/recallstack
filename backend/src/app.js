// backend/src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler.middleware');
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const topicRoutes = require('./routes/topic.routes');
const noteRoutes = require('./routes/note.routes');
const sectionRoutes = require('./routes/section.routes');
const searchRoutes = require('./routes/search.routes');
const revisionRoutes = require('./routes/revision.routes');
const commentRoutes = require('./routes/comment.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const emailRoutes = require('./routes/email.routes');
const profileRoutes = require('./routes/profile.routes');
const trendingRoutes = require('./routes/trending.routes');
const adminRoutes = require('./routes/admin.routes');
const rateLimiter = require('./middleware/rateLimit.middleware');
const securityHeaders = require('./middleware/cors.middleware');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://recallstack.vercel.app'
];
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(securityHeaders);
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate Limiting
const apiLimiter = rateLimiter(150, 15 * 60 * 1000);
const authLimiter = rateLimiter(10, 15 * 60 * 1000);

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/email/send-digest', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/subjects/:subjectId/topics', topicRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/topics/:topicId/notes', noteRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notes/:noteId/sections', sectionRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notes/:noteId/revisions', revisionRoutes);
app.use('/api/notes/:noteId/comments', commentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;

