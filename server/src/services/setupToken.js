const crypto = require('crypto');
const prisma = require('../lib/prisma');
const env = require('../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function createSetupToken() {
  if ((await prisma.admin.count()) > 0) return null;
  await prisma.setupToken.deleteMany({});
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + env.setupTokenTtlHours * 3600 * 1000);
  await prisma.setupToken.create({ data: { tokenHash: hashToken(token), expiresAt } });
  return { token, expiresAt };
}

async function ensureSetupTokenOnBoot() {
  if ((await prisma.admin.count()) > 0) return;
  const valid = await prisma.setupToken.findFirst({ where: { usedAt: null, expiresAt: { gt: new Date() } } });
  if (valid) {
    console.log('[setup] No admin yet. A setup token is active (expires %s). Run `yarn setup:token` to issue a new one.', valid.expiresAt.toISOString());
    return;
  }
  const { token, expiresAt } = await createSetupToken();
  console.log(`[setup] No admin account exists. One-time setup token (expires ${expiresAt.toISOString()}):\n[setup] ${token}\n[setup] Open /admin/setup in the admin app and paste this token.`);
}

module.exports = { hashToken, createSetupToken, ensureSetupTokenOnBoot };
