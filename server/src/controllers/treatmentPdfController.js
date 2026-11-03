const multer = require('multer');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { putPrivate, readPrivate, deletePrivate } = require('../services/storage');
const { logActivity } = require('../services/activity');

const PDF_MIME = 'application/pdf';
const TOKEN_AUDIENCE = 'treatment-pdf';
const TOKEN_TTL = '10m';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => (file.mimetype === PDF_MIME && /\.pdf$/i.test(file.originalname)
    ? cb(null, true) : cb(new HttpError(415, 'Only PDF files are allowed'))),
});

const isPdf = (buf) => buf.length > 5 && buf.slice(0, 5).toString('ascii') === '%PDF-';

function safeFileName(name) {
  const base = String(name || 'treatment-guide').replace(/\.pdf$/i, '').normalize('NFKD')
    .replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 120);
  return `${base || 'treatment-guide'}.pdf`;
}

const pdfInfo = (t) => ({
  pdfFileName: t.pdfFileName, pdfSize: t.pdfSize, pdfLabel: t.pdfLabel, pdfUploadedAt: t.pdfUploadedAt, hasPdf: !!t.pdfKey,
});

async function findTreatment(id) {
  const t = await prisma.treatment.findUnique({ where: { id } });
  if (!t || t.deletedAt) throw new HttpError(404, 'Condition not found');
  return t;
}

// Removes the old file; a storage failure is logged but must not undo the DB change.
async function dropFile(t) {
  if (!t.pdfKey) return;
  try { await deletePrivate({ key: t.pdfKey, storage: t.pdfStorage }); } catch (e) { console.error('[pdf] cleanup failed:', e.message); }
}

async function adminUpload(req, res) {
  const t = await findTreatment(parseId(req.params.id));
  if (!req.file) throw new HttpError(400, 'No file uploaded (use form field "file")');
  if (!isPdf(req.file.buffer)) throw new HttpError(415, 'File contents are not a valid PDF');
  const stored = await putPrivate({ buffer: req.file.buffer, mimeType: PDF_MIME, ext: 'pdf', folder: 'treatment-pdfs' });
  const updated = await prisma.treatment.update({
    where: { id: t.id },
    data: { pdfKey: stored.key, pdfStorage: stored.storage, pdfFileName: safeFileName(req.file.originalname), pdfSize: req.file.size, pdfUploadedAt: new Date(), updatedById: req.admin.id },
  });
  await dropFile(t);
  await logActivity(req, { action: 'update', entityType: 'conditions', entityId: t.id, entityLabel: t.title, details: { pdf: t.pdfKey ? 'replaced' : 'uploaded', file: updated.pdfFileName } });
  res.status(201).json({ data: pdfInfo(updated) });
}

async function adminRemove(req, res) {
  const t = await findTreatment(parseId(req.params.id));
  if (!t.pdfKey) throw new HttpError(404, 'This condition has no PDF');
  const updated = await prisma.treatment.update({
    where: { id: t.id },
    data: { pdfKey: null, pdfStorage: null, pdfFileName: null, pdfSize: null, pdfUploadedAt: null, updatedById: req.admin.id },
  });
  await dropFile(t);
  await logActivity(req, { action: 'update', entityType: 'conditions', entityId: t.id, entityLabel: t.title, details: { pdf: 'removed', file: t.pdfFileName } });
  res.json({ data: pdfInfo(updated) });
}

async function streamPdf(res, t, disposition) {
  const body = await readPrivate({ key: t.pdfKey, storage: t.pdfStorage });
  res.set({
    'Content-Type': PDF_MIME,
    'Content-Disposition': `${disposition}; filename="${t.pdfFileName}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  body.on('error', () => { if (!res.headersSent) res.status(404).end(); else res.destroy(); });
  body.pipe(res);
}

async function adminOpen(req, res) {
  const t = await findTreatment(parseId(req.params.id));
  if (!t.pdfKey) throw new HttpError(404, 'This condition has no PDF');
  await streamPdf(res, t, 'inline');
}

async function adminLeads(req, res) {
  const p = pagination(req.query);
  const s = String(req.query.search || '').trim().slice(0, 100);
  const where = s ? { OR: ['fullName', 'email', 'phone', 'treatmentName', 'location'].map((f) => ({ [f]: { contains: s, mode: 'insensitive' } })) } : {};
  const [rows, total] = await Promise.all([
    prisma.pdfLead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit, include: { treatment: { select: { id: true, slug: true } } } }),
    prisma.pdfLead.count({ where }),
  ]);
  res.json(paged(rows.map(({ pdfKey, ...r }) => r), total, p));
}

const PHONE = /^\+?[\d\s().-]{7,25}$/;
const leadSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.string().trim().max(200).pipe(z.email('Please enter a valid email address')),
  phone: z.string().trim().max(25).refine((v) => PHONE.test(v) && v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 15, 'Please enter a valid phone number'),
  location: z.string().trim().max(120).optional().nullable().transform((v) => v || null),
  website: z.string().max(200).optional(),
});

async function publicSubmit(req, res) {
  res.set('Cache-Control', 'no-store');
  const body = leadSchema.parse(req.body || {});
  // Honeypot: bots fill hidden fields. Pretend success without saving or returning a file.
  if (body.website) return res.status(201).json({ data: { ok: true } });
  const t = await prisma.treatment.findUnique({ where: { slug: String(req.params.slug) } });
  if (!t || t.deletedAt || t.status !== 'PUBLISHED' || !t.pdfKey) throw new HttpError(404, 'This treatment guide is not available');
  const lead = await prisma.pdfLead.create({
    data: { fullName: body.fullName, email: body.email.toLowerCase(), phone: body.phone, location: body.location, treatmentId: t.id, treatmentName: t.title, pdfKey: t.pdfKey, pdfFileName: t.pdfFileName },
  });
  const token = jwt.sign({ t: t.id, k: t.pdfKey, l: lead.id }, env.sessionSecret, { expiresIn: TOKEN_TTL, audience: TOKEN_AUDIENCE });
  res.status(201).json({ data: { ok: true, downloadUrl: `/public/treatment-pdf/${token}`, fileName: t.pdfFileName } });
}

async function publicDownload(req, res) {
  let claim;
  try { claim = jwt.verify(String(req.params.token), env.sessionSecret, { audience: TOKEN_AUDIENCE }); } catch { throw new HttpError(410, 'This download link has expired. Please request the guide again.'); }
  const t = await prisma.treatment.findUnique({ where: { id: claim.t } });
  if (!t || t.deletedAt || t.status !== 'PUBLISHED' || !t.pdfKey || t.pdfKey !== claim.k) throw new HttpError(410, 'This guide has changed. Please request it again.');
  await prisma.pdfLead.updateMany({ where: { id: claim.l, downloadedAt: null }, data: { downloadedAt: new Date() } });
  await streamPdf(res, t, 'attachment');
}

module.exports = { upload, adminUpload, adminRemove, adminOpen, adminLeads, publicSubmit, publicDownload };
