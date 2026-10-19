const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const REQUIRED = ['PORT', 'DATABASE_URL', 'CLIENT_URL', 'SESSION_SECRET'];
for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.SESSION_SECRET.length < 32 || process.env.SESSION_SECRET.startsWith('replace_with')) {
  throw new Error('SESSION_SECRET must be a random string of at least 32 characters');
}

const isPlaceholder = (v) => !v || v.startsWith('replace_with');
const clientOrigins = process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
const aws = {
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_S3_BUCKET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  publicBaseUrl: (process.env.AWS_S3_PUBLIC_BASE_URL || '').replace(/\/$/, ''),
};

module.exports = {
  port: Number(process.env.PORT),
  isProduction: process.env.NODE_ENV === 'production',
  clientOrigins,
  siteUrl: (process.env.SITE_URL || clientOrigins[0]).replace(/\/$/, ''),
  sessionSecret: process.env.SESSION_SECRET,
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS || 8),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  setupTokenTtlHours: Number(process.env.SETUP_TOKEN_TTL_HOURS || 24),
  aws,
  s3Enabled: ![aws.region, aws.bucket, aws.accessKeyId, aws.secretAccessKey].some(isPlaceholder),
  uploadDir: path.join(__dirname, '../../uploads'),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024,
};
