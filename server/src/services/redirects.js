const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/http');

const ABSOLUTE = /^https?:\/\//i;
const BLOCKED_PREFIXES = ['/api', '/admin', '/_next'];

function normalizePath(input, { allowAbsolute = false } = {}) {
  let p = String(input || '').trim();
  if (!p) throw new HttpError(422, 'Path is required');
  if (ABSOLUTE.test(p)) {
    if (!allowAbsolute) {
      try {
        p = new URL(p).pathname;
      } catch {
        throw new HttpError(422, 'Invalid URL');
      }
    } else {
      try {
        return new URL(p).toString();
      } catch {
        throw new HttpError(422, 'Invalid destination URL');
      }
    }
  }
  p = p.split('#')[0];
  if (!allowAbsolute) p = p.split('?')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '').replace(/\/+\?/, '?');
  return allowAbsolute ? p : p.toLowerCase();
}

async function validateRedirect({ fromPath, toPath, id }) {
  if (BLOCKED_PREFIXES.some((x) => fromPath === x || fromPath.startsWith(`${x}/`))) {
    throw new HttpError(422, `Redirects cannot start with ${fromPath.split('/').slice(0, 2).join('/')}`);
  }
  if (fromPath === '/') throw new HttpError(422, 'The home page cannot be redirected');
  const destPath = ABSOLUTE.test(toPath) ? null : toPath.split('?')[0].toLowerCase();
  if (destPath === fromPath) throw new HttpError(422, 'Redirect loop: the old path and destination are the same');
  const notSelf = id ? { NOT: { id } } : {};
  if (destPath) {
    const next = await prisma.urlRedirect.findFirst({ where: { fromPath: destPath, isActive: true, ...notSelf } });
    if (next) {
      const loop = next.toPath.toLowerCase() === fromPath;
      throw new HttpError(422, loop
        ? `Redirect loop: ${destPath} already redirects back to ${fromPath}`
        : `Redirect chain: ${destPath} already redirects to ${next.toPath}. Point directly to ${next.toPath} instead.`);
    }
  }
  const incoming = await prisma.urlRedirect.findFirst({ where: { toPath: fromPath, isActive: true, ...notSelf } });
  if (incoming) {
    throw new HttpError(422, `Redirect chain: ${incoming.fromPath} already redirects to ${fromPath}. Update that redirect to point to the new destination instead.`);
  }
}

// Called inside a transaction when a published item's URL changes. Flattens existing redirects so no chains form.
async function applySlugChange(tx, oldPath, newPath) {
  await tx.urlRedirect.deleteMany({ where: { fromPath: newPath } });
  await tx.urlRedirect.updateMany({ where: { toPath: oldPath }, data: { toPath: newPath } });
  await tx.urlRedirect.upsert({
    where: { fromPath: oldPath },
    update: { toPath: newPath, statusCode: 301, isActive: true, note: 'Auto-created after slug change' },
    create: { fromPath: oldPath, toPath: newPath, statusCode: 301, note: 'Auto-created after slug change' },
  });
}

module.exports = { normalizePath, validateRedirect, applySlugChange };
