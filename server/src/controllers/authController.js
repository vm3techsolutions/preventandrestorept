const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/http');
const { loginSchema, setupSchema, changePasswordSchema } = require('../validators/schemas');
const { hashToken } = require('../services/setupToken');
const { issueSession, clearSession, publicAdmin } = require('../middleware/auth');
const { logActivity } = require('../services/activity');

const ROUNDS = 12;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy-password', ROUNDS);

async function setupStatus(_req, res) {
  res.json({ data: { setupRequired: (await prisma.admin.count()) === 0 } });
}

async function setup(req, res) {
  if ((await prisma.admin.count()) > 0) throw new HttpError(403, 'Setup has already been completed');
  const body = setupSchema.parse(req.body);
  const row = await prisma.setupToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw new HttpError(401, 'Setup token is invalid or has expired');
  const passwordHash = await bcrypt.hash(body.password, ROUNDS);
  const admin = await prisma.$transaction(async (tx) => {
    if ((await tx.admin.count()) > 0) throw new HttpError(403, 'Setup has already been completed');
    const created = await tx.admin.create({ data: { email: body.email, name: body.name, passwordHash, isOwner: true, lastLoginAt: new Date() } });
    await tx.setupToken.deleteMany({});
    return created;
  });
  const expiresAt = issueSession(res, admin);
  res.status(201).json({ data: { admin: publicAdmin(admin), expiresAt } });
}

async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const identifier = `${req.ip}|${email}`;
  const now = new Date();
  const attempt = await prisma.loginAttempt.findUnique({ where: { identifier } });
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    const mins = Math.ceil((attempt.lockedUntil - now) / 60000);
    throw new HttpError(429, `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`);
  }
  const admin = await prisma.admin.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
  if (!admin || !ok) {
    const prev = attempt && !(attempt.lockedUntil && attempt.lockedUntil <= now) ? attempt.count : 0;
    const count = prev + 1;
    const lockedUntil = count >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60000) : null;
    await prisma.loginAttempt.upsert({ where: { identifier }, update: { count, lockedUntil }, create: { identifier, count, lockedUntil } });
    throw new HttpError(401, 'Invalid email or password');
  }
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
  if (!admin.isActive) throw new HttpError(403, 'This account has been deactivated. Contact another administrator.');
  const updated = await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: now } });
  const expiresAt = issueSession(res, updated);
  res.json({ data: { admin: publicAdmin(updated), expiresAt } });
}

async function me(req, res) {
  res.json({ data: { admin: publicAdmin(req.admin), expiresAt: req.sessionExpiresAt } });
}

async function logout(_req, res) {
  clearSession(res);
  res.json({ data: { loggedOut: true } });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  if (!(await bcrypt.compare(currentPassword, req.admin.passwordHash))) throw new HttpError(401, 'Current password is incorrect');
  const updated = await prisma.admin.update({
    where: { id: req.admin.id },
    data: { passwordHash: await bcrypt.hash(newPassword, ROUNDS), sessionVersion: { increment: 1 } },
  });
  const expiresAt = issueSession(res, updated);
  await logActivity(req, { action: 'change_password', entityType: 'admins', entityId: updated.id, entityLabel: updated.email });
  res.json({ data: { admin: publicAdmin(updated), expiresAt } });
}

module.exports = { setupStatus, setup, login, me, logout, changePassword };
