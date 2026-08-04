const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const redisClient = require('./config/redis');
// Reload server with updated Prisma client
const { initJobs } = require('./jobs');
const { initSubscribers } = require('./events/subscribers');
const { initTransporter } = require('./notifications/email.provider');

const PORT = env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to Redis (non-blocking — app works without it)
        try {
            await redisClient.connect();
            logger.info('✅ Redis connection established');
        } catch (redisError) {
            logger.warn(`⚠️ Redis connection failed: ${redisError.message}. Running without Redis.`);
        }

        // Initialize Email Transport
        initTransporter();

        // Initialize Event Subscribers
        initSubscribers();

        // Initialize Background Jobs
        initJobs();

        const server = app.listen(PORT, () => {
            logger.info(`🌐 BHARATFIX Server running in ${env.NODE_ENV} mode on port ${PORT}`);
        });

        // Handle Unhandled Rejections
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
            logger.error(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle SIGTERM
        process.on('SIGTERM', () => {
            logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
            server.close(async () => {
                if (redisClient.isReady) {
                    await redisClient.quit();
                    logger.info('🔴 Redis disconnected');
                }
                logger.info('💥 Process terminated!');
            });
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
