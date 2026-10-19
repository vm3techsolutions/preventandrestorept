const prisma = require('../lib/prisma');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { resolveSlug } = require('../lib/slug');
const { applySlugChange } = require('../services/redirects');
const { reorderSchema } = require('../validators/schemas');

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

function adminWhere(cfg, q) {
  const where = {};
  if (q.status === 'TRASHED') where.deletedAt = { not: null };
  else {
    where.deletedAt = null;
    if (STATUSES.includes(q.status)) where.status = q.status;
  }
  if (q.search) where.OR = cfg.searchFields.map((f) => ({ [f]: { contains: String(q.search), mode: 'insensitive' } }));
  return { ...where, ...(cfg.extraWhere ? cfg.extraWhere(q) : {}) };
}

function orderBy(sort) {
  if (sort === 'updated') return [{ updatedAt: 'desc' }];
  if (sort === 'published') return [{ publishedAt: { sort: 'desc', nulls: 'last' } }];
  if (sort === 'title') return [{ title: 'asc' }];
  return [{ displayOrder: 'asc' }, { id: 'desc' }];
}

function createContentController(cfg) {
  const db = () => prisma[cfg.model];
  const load = async (id) => {
    const item = await db().findUnique({ where: { id }, include: cfg.include });
    if (!item) throw new HttpError(404, `${cfg.label} not found`);
    return item;
  };
  const respond = async (res, id, status = 200) => res.status(status).json({ data: cfg.serializeAdmin(await load(id)) });

  async function list(req, res) {
    const p = pagination(req.query);
    const where = adminWhere(cfg, req.query);
    const [rows, total] = await Promise.all([
      db().findMany({ where, include: cfg.listInclude, orderBy: orderBy(req.query.sort), skip: p.skip, take: p.limit }),
      db().count({ where }),
    ]);
    res.json(paged(rows.map(cfg.serializeAdmin), total, p));
  }

  const get = async (req, res) => respond(res, parseId(req.params.id));

  async function create(req, res) {
    const body = cfg.schema.parse(req.body);
    const slug = await resolveSlug(cfg, body.slug, body.title, null);
    const agg = await db().aggregate({ _max: { displayOrder: true }, _min: { displayOrder: true } });
    const displayOrder = cfg.newOnTop ? (agg._min.displayOrder ?? 1) - 1 : (agg._max.displayOrder ?? 0) + 1;
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx[cfg.model].create({ data: { ...cfg.toData(body), slug, status: 'DRAFT', displayOrder } });
      if (cfg.afterSave) await cfg.afterSave(tx, created.id, body);
      return created;
    });
    await respond(res, row.id, 201);
  }

  async function update(req, res) {
    const existing = await load(parseId(req.params.id));
    if (existing.deletedAt) throw new HttpError(409, `Restore this ${cfg.label.toLowerCase()} from the trash before editing`);
    const body = cfg.schema.parse(req.body);
    const slug = await resolveSlug(cfg, body.slug, body.title, existing);
    const slugChanged = slug !== existing.slug && existing.status === 'PUBLISHED';
    await prisma.$transaction(async (tx) => {
      await tx[cfg.model].update({ where: { id: existing.id }, data: { ...cfg.toData(body), slug } });
      if (cfg.afterSave) await cfg.afterSave(tx, existing.id, body);
      if (slugChanged) await applySlugChange(tx, cfg.path(existing.slug), cfg.path(slug));
    });
    res.set('X-Redirect-Created', slugChanged ? `${cfg.path(existing.slug)} -> ${cfg.path(slug)}` : '');
    await respond(res, existing.id);
  }

  const setStatus = (status) => async (req, res) => {
    const existing = await load(parseId(req.params.id));
    if (existing.deletedAt) throw new HttpError(409, `This ${cfg.label.toLowerCase()} is in the trash`);
    if (status === 'PUBLISHED') {
      const errors = cfg.publishErrors(existing);
      if (errors.length) throw new HttpError(422, `Cannot publish: ${errors.join('; ')}`, errors);
    }
    const data = { status };
    if (status === 'PUBLISHED' && !existing.publishedAt) data.publishedAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx[cfg.model].update({ where: { id: existing.id }, data });
      // A live item takes precedence over any redirect from its own URL (prevents loops).
      if (status === 'PUBLISHED' && !cfg.isPage) await tx.urlRedirect.deleteMany({ where: { fromPath: cfg.path(existing.slug) } });
    });
    await respond(res, existing.id);
  };

  async function remove(req, res) {
    const id = parseId(req.params.id);
    await load(id);
    await db().update({ where: { id }, data: { deletedAt: new Date() } });
    res.json({ data: { id, deleted: true } });
  }

  async function restore(req, res) {
    const id = parseId(req.params.id);
    await load(id);
    await db().update({ where: { id }, data: { deletedAt: null, status: 'DRAFT' } });
    await respond(res, id);
  }

  async function reorder(req, res) {
    const { ids } = reorderSchema.parse(req.body);
    const rows = await db().findMany({ where: { id: { in: ids } }, select: { id: true, displayOrder: true } });
    if (rows.length !== new Set(ids).size) throw new HttpError(404, `One or more ${cfg.key} were not found`);
    const orders = rows.map((r) => r.displayOrder).sort((a, b) => a - b);
    for (let i = 1; i < orders.length; i += 1) if (orders[i] <= orders[i - 1]) orders[i] = orders[i - 1] + 1;
    await prisma.$transaction(ids.map((id, i) => db().update({ where: { id }, data: { displayOrder: orders[i] } })));
    res.json({ data: ids.map((id, i) => ({ id, displayOrder: orders[i] })) });
  }

  async function preview(req, res) {
    const item = await load(parseId(req.params.id));
    res.json({ data: { ...(await cfg.publicDetail(item)), status: item.status, isPreview: true } });
  }

  return {
    list, get, create, update, remove, restore, reorder, preview,
    publish: setStatus('PUBLISHED'), unpublish: setStatus('DRAFT'), archive: setStatus('ARCHIVED'),
  };
}

module.exports = { createContentController };
