const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const logger = require('./logger');

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_lbp2seUmv3wP@ep-cool-truth-axc2inlg-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const connectionString = process.env.DATABASE_URL || DEFAULT_NEON_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
    ],
});

prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('warn', (e) => {
    logger.warn(`Prisma Warning: ${e.message}`);
});

module.exports = prisma;
