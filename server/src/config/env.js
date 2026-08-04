const dotenv = require('dotenv');
const path = require('path');
const zod = require('zod');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = zod.object({
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('development'),
  PORT: zod.string().default('5000'),
  JWT_SECRET: zod.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: zod.string().default('1d'),
  DATABASE_URL: zod.string().url(),
  REDIS_URL: zod.string().url().default('redis://localhost:6379'),
  LOG_LEVEL: zod.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  // SMTP (optional — email notifications degrade gracefully)
  SMTP_HOST: zod.string().optional(),
  SMTP_PORT: zod.string().optional(),
  SMTP_USER: zod.string().optional(),
  SMTP_PASS: zod.string().optional(),
  SMTP_FROM: zod.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

module.exports = parsed.data;
