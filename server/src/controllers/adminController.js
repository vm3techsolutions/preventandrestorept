const prisma = require('../lib/prisma');
const env = require('../config/env');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { redirectSchema, settingsSchema } = require('../validators/schemas');
const { normalizePath, validateRedirect } = require('../services/redirects');
const { getGeneralSettings, saveGeneralSettings } = require('../services/settings');
const { storageMode } = require('../services/storage');
const { logActivity, changedFields } = require('../services/activity');

const redirectLabel = (r) => `${r.fromPath} → ${r.toPath}`;
const logRedirect = (req, action, r, details) => logActivity(req, { action, entityType: 'redirects', entityId: r.id, entityLabel: redirectLabel(r), details });

async function dashboard(_req, res) {
  const nd = { deletedAt: null };
  const [blogsTotal, blogsPublished, blogsDraft, blogsArchived, services, servicesPublished, treatments, treatmentsPublished, pages, pagesPublished, redirects, categories, tags, recent] = await Promise.all([
    prisma.blog.count({ where: nd }),
    prisma.blog.count({ where: { ...nd, status: 'PUBLISHED' } }),
    prisma.blog.count({ where: { ...nd, status: 'DRAFT' } }),
    prisma.blog.count({ where: { ...nd, status: 'ARCHIVED' } }),
    prisma.service.count({ where: nd }),
    prisma.service.count({ where: { ...nd, status: 'PUBLISHED' } }),
    prisma.treatment.count({ where: nd }),
    prisma.treatment.count({ where: { ...nd, status: 'PUBLISHED' } }),
    prisma.page.count({ where: nd }),
    prisma.page.count({ where: { ...nd, status: 'PUBLISHED' } }),
    prisma.urlRedirect.count({ where: { isActive: true } }),
    prisma.blogCategory.count(),
    prisma.blogTag.count(),
    prisma.blog.findMany({ where: nd, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true, publishedAt: true } }),
  ]);
  res.json({
    data: {
      blogs: { total: blogsTotal, published: blogsPublished, draft: blogsDraft, archived: blogsArchived },
      services: { total: services, published: servicesPublished },
      treatments: { total: treatments, published: treatmentsPublished },
      pages: { total: pages, published: pagesPublished },
      redirects, categories, tags, recentBlogs: recent,
    },
  });
}

async function listRedirects(req, res) {
  const p = pagination(req.query);
  const s = req.query.search ? String(req.query.search) : '';
  const where = s ? { OR: [{ fromPath: { contains: s, mode: 'insensitive' } }, { toPath: { contains: s, mode: 'insensitive' } }] } : {};
  const [rows, total] = await Promise.all([
    prisma.urlRedirect.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: p.skip, take: p.limit }),
    prisma.urlRedirect.count({ where }),
  ]);
  res.json(paged(rows, total, p));
}

async function parseRedirect(body, id) {
  const data = redirectSchema.parse(body);
  data.fromPath = normalizePath(data.fromPath);
  data.toPath = normalizePath(data.toPath, { allowAbsolute: true });
  if (data.isActive) await validateRedirect({ ...data, id });
  const clash = await prisma.urlRedirect.findFirst({ where: { fromPath: data.fromPath, ...(id ? { NOT: { id } } : {}) } });
  if (clash) throw new HttpError(409, `A redirect from ${data.fromPath} already exists`);
  return data;
}

async function createRedirect(req, res) {
  const data = await parseRedirect(req.body);
  const row = await prisma.urlRedirect.create({ data });
  await logRedirect(req, 'create', row);
  res.status(201).json({ data: row });
}

async function updateRedirect(req, res) {
  const id = parseId(req.params.id);
  const before = await prisma.urlRedirect.findUnique({ where: { id } });
  if (!before) throw new HttpError(404, 'Redirect not found');
  const data = await parseRedirect(req.body, id);
  const row = await prisma.urlRedirect.update({ where: { id }, data });
  await logRedirect(req, 'update', row, { changed: changedFields(before, row, ['fromPath', 'toPath', 'statusCode', 'isActive', 'note']) });
  res.json({ data: row });
}

async function deleteRedirect(req, res) {
  const id = parseId(req.params.id);
  const row = await prisma.urlRedirect.delete({ where: { id } });
  await logRedirect(req, 'delete', row);
  res.json({ data: { id, deleted: true } });
}

async function getSettings(_req, res) {
  res.json({
    data: {
      general: await getGeneralSettings(),
      system: { siteUrl: env.siteUrl, storage: storageMode(), s3Configured: env.s3Enabled, sessionTtlHours: env.sessionTtlHours },
    },
  });
}

async function updateSettings(req, res) {
  const before = await getGeneralSettings();
  const general = await saveGeneralSettings(settingsSchema.parse(req.body));
  await logActivity(req, { action: 'update', entityType: 'settings', entityLabel: 'SEO defaults', details: { changed: changedFields(before, general, Object.keys(general)) } });
  res.json({ data: { general } });
}

const ACTIVITY_FILTERS = ['action', 'entityType'];

async function listActivity(req, res) {
  const p = pagination(req.query);
  const q = req.query;
  const where = {};
  if (q.adminId) where.adminId = parseId(q.adminId);
  ACTIVITY_FILTERS.forEach((k) => { if (q[k]) where[k] = String(q[k]); });
  const range = {};
  const offsetMin = Number.isFinite(Number(q.tzOffset)) ? Math.max(-840, Math.min(840, Number(q.tzOffset))) : 0;
  for (const [k, v, endOfDay] of [['gte', q.from, false], ['lte', q.to, true]]) {
    if (!v) continue;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v));
    const utc = m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
    if (!m || new Date(utc).toISOString().slice(0, 10) !== v) throw new HttpError(422, 'Dates must be real calendar dates in YYYY-MM-DD format');
    // Day boundaries follow the admin's local timezone (tzOffset = minutes from Date#getTimezoneOffset).
    range[k] = new Date(utc + offsetMin * 60000 + (endOfDay ? 86400000 - 1 : 0));
  }
  if (range.gte && range.lte && range.gte > range.lte) throw new HttpError(422, '"From" date must be on or before the "To" date');
  if (Object.keys(range).length) where.createdAt = range;
  if (q.search) {
    const s = { contains: String(q.search), mode: 'insensitive' };
    where.OR = [{ entityLabel: s }, { adminName: s }, { adminEmail: s }];
  }
  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
    prisma.activityLog.count({ where }),
  ]);
  res.json(paged(rows, total, p));
}

module.exports = { dashboard, listRedirects, createRedirect, updateRedirect, deleteRedirect, getSettings, updateSettings, listActivity };
