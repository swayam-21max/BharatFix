const { PrismaClient } = require('@prisma/client');

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_lbp2seUmv3wP@ep-cool-truth-axc2inlg.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
const connectionString = process.env.DATABASE_URL || DEFAULT_NEON_URL;

// Global singleton instance for PrismaClient (prevents connection pool exhaustion in Vercel serverless)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: connectionString
        }
    }
});

globalForPrisma.prisma = prisma;

module.exports = prisma;
