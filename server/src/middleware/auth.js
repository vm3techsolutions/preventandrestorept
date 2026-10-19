const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const { HttpError } = require('../lib/http');

const COOKIE_NAME = 'pr_admin_session';

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'lax',
  path: '/',
  maxAge: env.sessionTtlHours * 3600 * 1000,
});

function issueSession(res, admin) {
  const token = jwt.sign({ sub: admin.id, v: admin.sessionVersion }, env.sessionSecret, { expiresIn: `${env.sessionTtlHours}h` });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return new Date(Date.now() + env.sessionTtlHours * 3600 * 1000).toISOString();
}

function clearSession(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
}

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = req.cookies?.[COOKIE_NAME] || (header.startsWith('Bearer ') ? header.slice(7) : null);
    if (!token) throw new HttpError(401, 'Authentication required');
    let payload;
    try {
      payload = jwt.verify(token, env.sessionSecret);
    } catch (e) {
      throw new HttpError(401, e.name === 'TokenExpiredError' ? 'Session expired. Please sign in again.' : 'Invalid session');
    }
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin || admin.sessionVersion !== payload.v) throw new HttpError(401, 'Session is no longer valid');
    req.admin = admin;
    req.sessionExpiresAt = new Date(payload.exp * 1000).toISOString();
    next();
  } catch (e) {
    next(e);
  }
}

// Rejects state-changing requests coming from origins other than the configured admin client(s).
function originGuard(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !env.clientOrigins.includes(origin.replace(/\/$/, ''))) return next(new HttpError(403, 'Origin not allowed'));
  return next();
}

const publicAdmin = (a) => ({ id: a.id, email: a.email, name: a.name, lastLoginAt: a.lastLoginAt, createdAt: a.createdAt });

module.exports = { requireAuth, originGuard, issueSession, clearSession, publicAdmin, COOKIE_NAME };
