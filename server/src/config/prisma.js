const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_lbp2seUmv3wP@ep-cool-truth-axc2inlg.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
const connectionString = process.env.DATABASE_URL || DEFAULT_NEON_URL;

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: connectionString
            }
        }
    });
} else {
    if (!global.prismaInstance) {
        global.prismaInstance = new PrismaClient({
            datasources: {
                db: {
                    url: connectionString
                }
            }
        });
    }
    prisma = global.prismaInstance;
}

module.exports = prisma;
