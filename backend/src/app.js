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

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`RecallStack API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

