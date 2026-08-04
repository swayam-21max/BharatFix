const dotenv = require('dotenv');
const path = require('path');
const zod = require('zod');

// Load .env file safely if available
dotenv.config();
try {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {
    // Ignore .env missing error in serverless environments
}

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_lbp2seUmv3wP@ep-cool-truth-axc2inlg-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const DEFAULT_JWT_SECRET = "aea48f2c0be2da02ff022b913af5ca49cdd75e052df36b59239ed4bfb73fec15";

const envSchema = zod.object({
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('production'),
  PORT: zod.string().default('5000'),
  JWT_SECRET: zod.string().default(DEFAULT_JWT_SECRET),
  JWT_EXPIRES_IN: zod.string().default('1d'),
  DATABASE_URL: zod.string().default(DEFAULT_NEON_URL),
  REDIS_URL: zod.string().optional().default('redis://localhost:6379'),
  LOG_LEVEL: zod.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  SMTP_HOST: zod.string().optional(),
  SMTP_PORT: zod.string().optional(),
  SMTP_USER: zod.string().optional(),
  SMTP_PASS: zod.string().optional(),
  SMTP_FROM: zod.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Environment variable validation notice:', parsed.error.format());
}

module.exports = parsed.success ? parsed.data : {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '5000',
    JWT_SECRET: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_NEON_URL,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
