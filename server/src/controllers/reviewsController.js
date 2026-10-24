const prisma = require('../lib/prisma');
const { HttpError, pagination, paged } = require('../lib/http');
const { reviewSchema } = require('../validators/schemas');
const { logActivity, changedFields } = require('../services/activity');

const FIELDS = ['reviewerName', 'text', 'rating', 'reviewDate', 'source', 'sourceUrl', 'isPublished', 'isFeatured', 'displayOrder'];
const ORDER = [{ displayOrder: 'asc' }, { reviewDate: 'desc' }, { id: 'desc' }];
const parseId = (v) => {
  const id = Number(v);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid id');
  return id;
};
const toData = (body) => {
  const d = reviewSchema.parse(body);
  return { ...d, rating: d.rating ?? null, reviewDate: d.reviewDate ? new Date(`${d.reviewDate}T00:00:00Z`) : null };
};
const log = (req, action, row, details) => logActivity(req, { action, entityType: 'reviews', entityId: row.id, entityLabel: row.reviewerName, details });

async function list(req, res) {
  const p = pagination(req.query);
  const s = req.query.search ? String(req.query.search) : '';
  const where = s ? { OR: [{ reviewerName: { contains: s, mode: 'insensitive' } }, { text: { contains: s, mode: 'insensitive' } }] } : {};
  const [rows, total] = await Promise.all([
    prisma.review.findMany({ where, orderBy: ORDER, skip: p.skip, take: p.limit, include: { updatedBy: { select: { id: true, name: true, email: true } } } }),
    prisma.review.count({ where }),
  ]);
  res.json(paged(rows, total, p));
}

async function create(req, res) {
  const row = await prisma.review.create({ data: { ...toData(req.body), createdById: req.admin.id, updatedById: req.admin.id } });
  await log(req, 'create', row);
  res.status(201).json({ data: row });
}

async function update(req, res) {
  const id = parseId(req.params.id);
  const before = await prisma.review.findUnique({ where: { id } });
  if (!before) throw new HttpError(404, 'Review not found');
  const row = await prisma.review.update({ where: { id }, data: { ...toData(req.body), updatedById: req.admin.id } });
  await log(req, 'update', row, { changed: changedFields(before, row, FIELDS) });
  res.json({ data: row });
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  const row = await prisma.review.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Review not found');
  await prisma.review.delete({ where: { id } });
  await log(req, 'delete', row);
  res.json({ data: { id, deleted: true } });
}

// Public: published reviews only, no audit fields.
async function publicList(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const where = { isPublished: true, ...(req.query.featured === 'true' ? { isFeatured: true } : {}) };
  const [rows, agg] = await Promise.all([
    prisma.review.findMany({ where, orderBy: ORDER, take: limit, select: { id: true, reviewerName: true, text: true, rating: true, reviewDate: true, source: true, sourceUrl: true, isFeatured: true } }),
    prisma.review.aggregate({ where: { isPublished: true }, _count: { _all: true } }),
  ]);
  res.json({ data: rows, meta: { total: agg._count._all } });
}

module.exports = { list, create, update, remove, publicList };
