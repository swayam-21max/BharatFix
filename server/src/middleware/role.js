const { AppError } = require('./error.handler');

const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'supervisor', 'resident']. req.user.role is expected from auth middleware
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

module.exports = { restrictTo };
