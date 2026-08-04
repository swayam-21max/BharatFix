const logger = require('../config/logger');

/**
 * App Error Class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (err.status === 'fail' ? 400 : 500);
    const message = err.message || 'An internal server error occurred';

    console.error(`💥 [${req.method} ${req.originalUrl || req.url}] Error ${statusCode}:`, err);

    return res.status(statusCode).json({
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        message: message
    });
};

module.exports = {
    AppError,
    errorHandler,
};
