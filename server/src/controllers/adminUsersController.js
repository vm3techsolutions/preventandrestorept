const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { adminCreateSchema, adminStatusSchema } = require('../validators/schemas');

const SELECT = { id: true, name: true, email: true, isActive: true, createdAt: true, lastLoginAt: true, createdById: true };

async function list(req, res) {
  const p = pagination(req.query);
  const s = req.query.search ? String(req.query.search) : '';
  const where = s ? { OR: [{ name: { contains: s, mode: 'insensitive' } }, { email: { contains: s, mode: 'insensitive' } }] } : {};
  const [rows, total] = await Promise.all([
    prisma.admin.findMany({ where, select: SELECT, orderBy: { id: 'asc' }, skip: p.skip, take: p.limit }),
    prisma.admin.count({ where }),
  ]);
  res.json(paged(rows, total, p));
}

async function create(req, res) {
  const body = adminCreateSchema.parse(req.body);
  if (await prisma.admin.findUnique({ where: { email: body.email } })) throw new HttpError(409, 'An admin with this email address already exists');
  const admin = await prisma.admin.create({
    data: { name: body.name, email: body.email, passwordHash: await bcrypt.hash(body.password, 12), createdById: req.admin.id },
    select: SELECT,
  });
  res.status(201).json({ data: admin });
}

async function setStatus(req, res) {
  const id = parseId(req.params.id);
  const { isActive } = adminStatusSchema.parse(req.body);
  if (id === req.admin.id) throw new HttpError(422, 'You cannot change the status of your own account');
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) throw new HttpError(404, 'Admin not found');
  const admin = await prisma.$transaction(async (tx) => {
    if (!isActive && target.isActive && (await tx.admin.count({ where: { isActive: true } })) <= 1) {
      throw new HttpError(422, 'At least one active admin is required');
    }
    return tx.admin.update({
      where: { id },
      data: { isActive, ...(isActive ? {} : { sessionVersion: { increment: 1 } }) },
      select: SELECT,
    });
  }, { isolationLevel: 'Serializable' });
  res.json({ data: admin });
}

module.exports = { list, create, setStatus };
