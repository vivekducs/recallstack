// backend/src/utils/logger.js

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const colors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m'
};

const getLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    // Structured JSON logging in production for log aggregators
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(meta && Object.keys(meta).length ? { meta } : {})
    });
  } else {
    // Human-readable color-coded logs in development
    const color = colors[level] || '';
    const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${color}[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}${colors.reset}`;
  }
};

const log = (level, message, meta) => {
  const currentLevel = getLevel();
  if (levels[level] <= levels[currentLevel]) {
    const formatted = formatMessage(level, message, meta);
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
};

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta)
};
