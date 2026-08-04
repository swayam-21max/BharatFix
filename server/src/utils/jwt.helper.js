const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign JWT Token
 * @param {Object} payload 
 * @returns {string} token
 */
const signToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

/**
 * Verify JWT Token
 * @param {string} token 
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

module.exports = { signToken, verifyToken };
