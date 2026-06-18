// backend/src/middleware/rateLimit.middleware.js

const rateLimit = {};

function rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    // If in test environment, skip rate limiting
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimit[ip]) {
      rateLimit[ip] = [];
    }

    // Filter out timestamps outside the sliding window
    rateLimit[ip] = rateLimit[ip].filter(timestamp => now - timestamp < windowMs);

    if (rateLimit[ip].length >= limit) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }

    rateLimit[ip].push(now);
    next();
  };
}

module.exports = rateLimiter;
