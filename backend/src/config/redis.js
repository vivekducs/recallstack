// backend/src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;

if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('[Redis] Connection failed repeatedly. Disabling Redis.');
          redisAvailable = false;
          return null;
        }
        return Math.min(times * 100, 2000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('[Redis] Connected successfully.');
      redisAvailable = true;
    });

    redisClient.on('error', (err) => {
      logger.error('[Redis] Error:', err);
      redisAvailable = false;
    });
  } catch (err) {
    logger.error('[Redis] Failed to initialize Redis client:', err);
    redisAvailable = false;
  }
}

module.exports = {
  redisClient,
  isRedisAvailable: () => redisAvailable && redisClient !== null
};
