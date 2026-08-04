const { Pool } = require('pg');
const env = require('./env');
const logger = require('./logger');

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    // PostGIS support can be added via schema migrations later
});

pool.on('connect', () => {
    logger.info('🐘 PostgreSQL Database connected successfully');
});

pool.on('error', (err) => {
    logger.error('❌ PostgreSQL Database connection error:', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
