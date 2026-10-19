const prisma = require('../lib/prisma');
const { HttpError, pagination, paged } = require('../lib/http');
const { TYPES } = require('../content/types');
const { normalizePath } = require('../services/redirects');
const { getGeneralSettings } = require('../services/settings');
const env = require('../config/env');

const liveWhere = (cfg) => ({
  status: 'PUBLISHED',
  deletedAt: null,
  ...(cfg.key === 'blogs' ? { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] } : {}),
});

function createPublicController(cfg) {
  async function list(req, res) {
    const p = pagination(req.query, 50);
    const where = { ...liveWhere(cfg), noindex: false, ...(cfg.extraWhere ? cfg.extraWhere(req.query) : {}) };
    if (req.query.search) {
      where.AND = [{ OR: cfg.searchFields.map((f) => ({ [f]: { contains: String(req.query.search), mode: 'insensitive' } })) }];
    }
    const orderBy = cfg.key === 'blogs' && req.query.sort === 'latest'
      ? [{ publishedAt: 'desc' }]
      : [{ displayOrder: 'asc' }, { id: 'desc' }];
    const [rows, total] = await Promise.all([
      prisma[cfg.model].findMany({ where, include: cfg.listInclude, orderBy, skip: p.skip, take: p.limit }),
      prisma[cfg.model].count({ where }),
    ]);
    res.json(paged(rows.map(cfg.publicSummary), total, p));
  }

  async function detail(req, res) {
    const row = await prisma[cfg.model].findFirst({ where: { slug: String(req.params.slug), ...liveWhere(cfg) }, include: cfg.include });
    if (!row) throw new HttpError(404, `${cfg.label} not found`);
    res.json({ data: await cfg.publicDetail(row) });
  }

  return { list, detail };
}

async function taxonomyList(model, req, res) {
  const p = pagination(req.query, 100);
  const live = { blog: liveWhere(TYPES.blogs) };
  const where = { blogs: { some: live } };
  const [rows, total] = await Promise.all([
    prisma[model].findMany({ where, orderBy: { name: 'asc' }, skip: p.skip, take: p.limit, include: { _count: { select: { blogs: { where: live } } } } }),
    prisma[model].count({ where }),
  ]);
  res.json(paged(rows.map((r) => ({ name: r.name, slug: r.slug, description: r.description, blogCount: r._count.blogs })), total, p));
}

async function resolveRedirect(req, res) {
  const path = normalizePath(req.query.path);
  const r = await prisma.urlRedirect.findFirst({ where: { fromPath: path, isActive: true } });
  if (!r) throw new HttpError(404, 'No redirect for this path');
  res.json({ data: { fromPath: r.fromPath, toPath: r.toPath, statusCode: r.statusCode } });
}

async function listRedirects(req, res) {
  const p = pagination(req.query, 1000);
  const where = { isActive: true };
  const [rows, total] = await Promise.all([
    prisma.urlRedirect.findMany({ where, orderBy: { fromPath: 'asc' }, skip: p.skip, take: p.limit, select: { fromPath: true, toPath: true, statusCode: true } }),
    prisma.urlRedirect.count({ where }),
  ]);
  res.json(paged(rows, total, p));
}

const STATIC_ROUTES = ['/', '/blog', '/services', '/what-we-treat'];

async function sitemapEntries() {
  const entries = STATIC_ROUTES.map((path) => ({ loc: `${env.siteUrl}${path === '/' ? '' : path}` || env.siteUrl, lastmod: null }));
  for (const cfg of Object.values(TYPES)) {
    // eslint-disable-next-line no-await-in-loop
    const rows = await prisma[cfg.model].findMany({
      where: { ...liveWhere(cfg), noindex: false },
      select: { slug: true, updatedAt: true, canonicalUrl: true },
      orderBy: { displayOrder: 'asc' },
    });
    for (const r of rows) {
      const loc = `${env.siteUrl}${cfg.path(r.slug)}`;
      if (!r.canonicalUrl || r.canonicalUrl.replace(/\/$/, '') === loc) entries.push({ loc, lastmod: r.updatedAt.toISOString() });
    }
  }
  return entries;
}

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function sitemapXml(_req, res) {
  const entries = await sitemapEntries();
  const body = entries.map((e) => `  <url><loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

async function sitemapJson(_req, res) {
  res.json({ data: await sitemapEntries() });
}

async function settings(_req, res) {
  res.json({ data: { ...(await getGeneralSettings()), siteUrl: env.siteUrl } });
}

module.exports = { createPublicController, taxonomyList, resolveRedirect, listRedirects, sitemapXml, sitemapJson, settings };
