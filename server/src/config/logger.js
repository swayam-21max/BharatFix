const winston = require('winston');
const env = require('./env');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const transports = [
    new winston.transports.Console()
];

// File logging only in local dev environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
        const fs = require('fs');
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs', { recursive: true });
        }
        transports.push(
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/all.log' })
        );
    } catch (err) {
        // Read-only environment, console transport handles output
    }
}

const logger = winston.createLogger({
    level: env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
});

module.exports = logger;
