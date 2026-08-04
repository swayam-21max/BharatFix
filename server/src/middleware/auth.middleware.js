const { verifyToken } = require('../utils/jwt.helper');
const { isTokenBlacklisted } = require('../utils/token.blacklist');
const { AppError } = require('./error.handler');
const prisma = require('../config/prisma');

/**
 * Protect routes - ensures user is authenticated and token is valid
 */
const protect = async (req, res, next) => {
    try {
        // 1. Get token and check if it exists
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(
                new AppError('You are not logged in! Please log in to get access.', 401)
            );
        }

        // 2. Check if token is blacklisted (logged out)
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return next(
                new AppError('This token has been invalidated. Please log in again.', 401)
            );
        }

        // 3. Verify token
        const decoded = verifyToken(token);

        // 4. Check if user still exists
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!currentUser) {
            return next(
                new AppError(
                    'The user belonging to this token does no longer exist.',
                    401
                )
            );
        }

        // 5. Grant access to protected route
        req.user = currentUser;
        req.token = token; // Store token for logout
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token. Please log in again!', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired! Please log in again.', 401));
        }
        next(error);
    }
};

/**
 * Restrict access to specific roles
 * @param  {...string} roles 
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        // Additional check for Block Heads
        if (req.user.role === 'BLOCK_HEAD' && !req.user.isApproved) {
            return next(
                new AppError('Your account is pending approval by an administrator.', 403)
            );
        }

        next();
    };
};

module.exports = {
    protect,
    restrictTo,
};
