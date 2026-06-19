// backend/src/middleware/errorHandler.middleware.js
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} - Code: ${err.code || 'N/A'} - Message: ${err.message}`, {
    stack: err.stack,
    code: err.code
  });

  // Prisma unique constraint violation (Conflict)
  if (err.code === 'P2002') {
    const fields = err.meta && err.meta.target ? ` (${err.meta.target.join(', ')})` : '';
    return res.status(409).json({ error: `A record with this unique value already exists${fields}` });
  }

  // Prisma foreign key constraint violation (Bad Request)
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Database relationship constraint failed. Invalid foreign key reference.' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: err.meta && err.meta.cause ? err.meta.cause : 'Record not found' });
  }

  // Prisma null constraint violation / missing field value
  if (err.code === 'P2011' || err.code === 'P2012') {
    return res.status(400).json({ error: 'Required database column constraint violation' });
  }

  // Prisma input value type validation error
  if (err.code === 'P2019') {
    return res.status(400).json({ error: 'Database invalid type format received' });
  }

  // Express JSON parser body error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request payload format' });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? err.message 
      : (statusCode === 500 ? 'Internal server error' : err.message)
  });
}

module.exports = errorHandler;
