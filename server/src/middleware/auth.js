const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('./error.handler');

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Add user to request (placeholder for actual user fetch)
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid token. Please log in again!', 401));
    }
};

module.exports = { protect };
