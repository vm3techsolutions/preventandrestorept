const prisma = require('../lib/prisma');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { slugify, SLUG_RE } = require('../lib/slug');
const { logActivity, changedFields } = require('../services/activity');

const FIELDS = ['name', 'slug', 'description', 'credentials', 'bio', 'avatarUrl'];

// Shared CRUD for blog categories, blog tags and authors. Deletion is blocked while blogs reference the record.
function createTaxonomyController({ model, label, schema, activityType, countRelation = 'blogs', toData = (b) => b }) {
  const db = () => prisma[model];
  const log = (req, action, row, details) => logActivity(req, { action, entityType: activityType, entityId: row.id, entityLabel: row.name, details });

  async function resolve(body, id) {
    const slug = slugify(body.slug || body.name);
    if (!SLUG_RE.test(slug)) throw new HttpError(422, 'Slug must contain lowercase letters, numbers and hyphens only');
    const clash = await db().findFirst({ where: { slug, ...(id ? { NOT: { id } } : {}) } });
    if (clash) throw new HttpError(409, `${label} slug "${slug}" is already in use`);
    return slug;
  }

  async function list(req, res) {
    const p = pagination(req.query, 200);
    const where = req.query.search ? { name: { contains: String(req.query.search), mode: 'insensitive' } } : {};
    const [rows, total] = await Promise.all([
      db().findMany({ where, orderBy: { name: 'asc' }, skip: p.skip, take: p.limit, include: { _count: { select: { [countRelation]: true } } } }),
      db().count({ where }),
    ]);
    res.json(paged(rows.map(({ _count, ...r }) => ({ ...r, blogCount: _count[countRelation] })), total, p));
  }

  async function create(req, res) {
    const body = schema.parse(req.body);
    const row = await db().create({ data: { ...toData(body), slug: await resolve(body) } });
    await log(req, 'create', row);
    res.status(201).json({ data: { ...row, blogCount: 0 } });
  }

  async function update(req, res) {
    const id = parseId(req.params.id);
    const before = await db().findUnique({ where: { id } });
    if (!before) throw new HttpError(404, `${label} not found`);
    const body = schema.parse(req.body);
    const row = await db().update({ where: { id }, data: { ...toData(body), slug: await resolve(body, id) }, include: { _count: { select: { [countRelation]: true } } } });
    const { _count, ...rest } = row;
    await log(req, 'update', rest, { changed: changedFields(before, rest, FIELDS.filter((f) => f in before)) });
    res.json({ data: { ...rest, blogCount: _count[countRelation] } });
  }

  async function remove(req, res) {
    const id = parseId(req.params.id);
    const row = await db().findUnique({ where: { id }, include: { _count: { select: { [countRelation]: true } } } });
    if (!row) throw new HttpError(404, `${label} not found`);
    const used = row._count[countRelation];
    if (used > 0) throw new HttpError(409, `"${row.name}" is used by ${used} blog${used === 1 ? '' : 's'} (including drafts or trashed posts). Remove it from those blogs first.`);
    await db().delete({ where: { id } });
    await log(req, 'delete', row);
    res.json({ data: { id, deleted: true } });
  }

  return { list, create, update, remove };
}

module.exports = { createTaxonomyController };
