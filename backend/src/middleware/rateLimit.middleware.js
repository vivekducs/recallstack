// backend/src/middleware/rateLimit.middleware.js
const { redisClient, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

const rateLimitCache = new Map();

// Periodic garbage collection to prevent memory leaks from stale client IPs
const GC_INTERVAL = 5 * 60 * 1000; // Run GC every 5 minutes
const gcTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitCache.entries()) {
    const activeTimestamps = data.timestamps.filter(ts => now - ts < data.windowMs);
    if (activeTimestamps.length === 0) {
      rateLimitCache.delete(ip);
    } else {
      rateLimitCache.set(ip, { timestamps: activeTimestamps, windowMs: data.windowMs });
    }
  }
}, GC_INTERVAL);

// unref lets node process exit cleanly if no other tasks are running
if (gcTimer.unref) {
  gcTimer.unref();
}

function rateLimiter(limit = 100, windowMs = 15 * 60 * 1000) {
  return async (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    // Resolve client IP behind reverse proxies (like Render, AWS ALB, Vercel) safely
    const ip = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : req.ip || req.socket.remoteAddress;

    const now = Date.now();

    // Try Redis rate limiter if available
    if (isRedisAvailable()) {
      const key = `rate_limit:${ip}`;
      try {
        const pipeline = redisClient.multi();
        pipeline.zadd(key, now, now);
        pipeline.zremrangebyscore(key, 0, now - windowMs);
        pipeline.zcard(key);
        pipeline.pexpire(key, windowMs);
        
        const results = await pipeline.exec();
        // results is array of [err, result]. The zcard result is at index 2.
        const requestCount = results[2][1];

        if (requestCount > limit) {
          return res.status(429).json({
            error: 'Too many requests, please try again later.'
          });
        }
        return next();
      } catch (err) {
        logger.error('[RateLimiter] Redis rate limiting failed, falling back to memory:', err);
      }
    }

    // In-memory sliding window rate limiter fallback
    let clientRecord = rateLimitCache.get(ip);
    
    if (!clientRecord) {
      clientRecord = { timestamps: [], windowMs };
    }

    // Filter out old timestamps outside the sliding window
    const activeTimestamps = clientRecord.timestamps.filter(ts => now - ts < windowMs);

    if (activeTimestamps.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }

    activeTimestamps.push(now);
    rateLimitCache.set(ip, { timestamps: activeTimestamps, windowMs });
    next();
  };
}

module.exports = rateLimiter;
