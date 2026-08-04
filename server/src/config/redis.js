const { createClient } = require('redis');
const env = require('./env');
const logger = require('./logger');

const redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 2) {
                return false; // Stop retrying quickly if Redis is not running locally
            }
            return 300;
        },
    },
});

redisClient.on('connect', () => {
    logger.info('🔴 Redis connected successfully');
});

redisClient.on('error', (err) => {
    logger.error(`❌ Redis error: ${err.message}`);
});

redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis reconnecting...');
});

/**
 * Check if Redis is currently connected
 */
const isReady = () => redisClient.isReady;

module.exports = redisClient;
module.exports.isReady = isReady;
