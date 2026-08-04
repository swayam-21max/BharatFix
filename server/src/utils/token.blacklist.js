const redisClient = require('../config/redis');
const logger = require('../config/logger');

// In-memory fallback cache for environments without Redis
const memoryBlacklist = new Map();

/**
 * Clean up expired tokens from memory fallback
 */
setInterval(() => {
    const now = Date.now();
    for (const [token, expiry] of memoryBlacklist.entries()) {
        if (expiry <= now) {
            memoryBlacklist.delete(token);
        }
    }
}, 60000); // Clean every minute

/**
 * Blacklist a JWT token (used on logout)
 * @param {string} token - The JWT token to blacklist
 * @param {number} ttlSeconds - Time-to-live in seconds (match token expiry)
 */
const blacklistToken = async (token, ttlSeconds) => {
    try {
        if (redisClient.isReady) {
            await redisClient.set(`bl:${token}`, '1', { EX: ttlSeconds });
            return true;
        }
        
        // Memory fallback
        const expiry = Date.now() + (ttlSeconds * 1000);
        memoryBlacklist.set(token, expiry);
        logger.info('🔐 Token blacklisted in memory fallback');
        return true;
    } catch (error) {
        logger.error('❌ Failed to blacklist token:', error.message);
        return false;
    }
};

/**
 * Check if a token is blacklisted
 * @param {string} token
 * @returns {boolean}
 */
const isTokenBlacklisted = async (token) => {
    try {
        if (redisClient.isReady) {
            const result = await redisClient.get(`bl:${token}`);
            return result !== null;
        }

        // Memory fallback check
        const expiry = memoryBlacklist.get(token);
        if (!expiry) return false;

        if (expiry <= Date.now()) {
            memoryBlacklist.delete(token);
            return false;
        }
        return true;
    } catch (error) {
        logger.error('❌ Failed to check token blacklist:', error.message);
        return false;
    }
};

module.exports = { blacklistToken, isTokenBlacklisted };
