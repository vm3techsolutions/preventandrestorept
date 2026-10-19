const prisma = require('../lib/prisma');
const env = require('../config/env');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { redirectSchema, settingsSchema } = require('../validators/schemas');
const { normalizePath, validateRedirect } = require('../services/redirects');
const { getGeneralSettings, saveGeneralSettings } = require('../services/settings');
const { storageMode } = require('../services/storage');

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
  res.status(201).json({ data: await prisma.urlRedirect.create({ data }) });
}

async function updateRedirect(req, res) {
  const id = parseId(req.params.id);
  if (!(await prisma.urlRedirect.findUnique({ where: { id } }))) throw new HttpError(404, 'Redirect not found');
  const data = await parseRedirect(req.body, id);
  res.json({ data: await prisma.urlRedirect.update({ where: { id }, data }) });
}

async function deleteRedirect(req, res) {
  const id = parseId(req.params.id);
  await prisma.urlRedirect.delete({ where: { id } });
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
  res.json({ data: { general: await saveGeneralSettings(settingsSchema.parse(req.body)) } });
}

module.exports = { dashboard, listRedirects, createRedirect, updateRedirect, deleteRedirect, getSettings, updateSettings };
