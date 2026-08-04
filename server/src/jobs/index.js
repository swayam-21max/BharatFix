const logger = require('../config/logger');
const { checkSLAViolations } = require('./sla.checker');

/**
 * Initialize all background jobs
 */
const initJobs = () => {
    logger.info('👷 Initializing background jobs...');

    // Run every 15 minutes
    setInterval(checkSLAViolations, 15 * 60 * 1000);

    logger.info('🚀 Background jobs initialized.');
};

module.exports = {
    initJobs
};
