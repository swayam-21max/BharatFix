const { AppError } = require('./error.handler');

const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join(', ');
            return next(new AppError(`Validation failed: ${message}`, 400));
        }

        // Replace req data with parsed data (handles defaults/transforms)
        req.body = result.data.body;
        req.query = result.data.query;
        req.params = result.data.params;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { validate };
