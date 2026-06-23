// backend/src/server.js
require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`RecallStack API running on port ${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async (err) => {
    if (err) {
      logger.error('Error closing HTTP server:', err);
      process.exit(1);
    }
    logger.info('HTTP server closed.');
    
    try {
      await prisma.$disconnect();
      logger.info('Database client disconnected.');
      process.exit(0);
    } catch (dbErr) {
      logger.error('Error disconnecting database client:', dbErr);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
