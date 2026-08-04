/**
 * Standard API Response Formatter
 */
const successResponse = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};

module.exports = { successResponse };
