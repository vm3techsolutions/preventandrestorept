const multer = require('multer');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const { MIME_EXT, FOLDERS, sniffMime, putObject, deleteObject, storageMode } = require('../services/storage');
const { logActivity } = require('../services/activity');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => (MIME_EXT[file.mimetype] ? cb(null, true) : cb(new HttpError(415, 'Only JPEG, PNG, WebP, GIF or AVIF images are allowed'))),
});

async function create(req, res) {
  if (!req.file) throw new HttpError(400, 'No file uploaded (use form field "file")');
  if (sniffMime(req.file.buffer) !== req.file.mimetype) throw new HttpError(415, 'File contents do not match its image type');
  const folder = FOLDERS.includes(req.body.folder) ? req.body.folder : 'general';
  const stored = await putObject({ buffer: req.file.buffer, mimeType: req.file.mimetype, folder });
  const media = await prisma.media.create({
    data: {
      ...stored,
      folder,
      mimeType: req.file.mimetype,
      size: req.file.size,
      originalName: req.file.originalname.slice(0, 250),
      alt: req.body.alt ? String(req.body.alt).slice(0, 300) : null,
      caption: req.body.caption ? String(req.body.caption).slice(0, 500) : null,
    },
  });
  await logActivity(req, { action: 'upload', entityType: 'media', entityId: media.id, entityLabel: media.originalName, details: { folder, size: media.size } });
  res.status(201).json({ data: media });
}

async function list(req, res) {
  const p = pagination(req.query);
  const where = FOLDERS.includes(req.query.folder) ? { folder: req.query.folder } : {};
  const [rows, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
    prisma.media.count({ where }),
  ]);
  res.json(paged(rows, total, p));
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new HttpError(404, 'Media not found');
  await deleteObject(media);
  await prisma.media.delete({ where: { id } });
  await logActivity(req, { action: 'delete', entityType: 'media', entityId: id, entityLabel: media.originalName });
  res.json({ data: { id, deleted: true } });
}

function status(_req, res) {
  res.json({
    data: {
      storage: storageMode(),
      s3Configured: env.s3Enabled,
      bucket: env.s3Enabled ? env.aws.bucket : null,
      region: env.s3Enabled ? env.aws.region : null,
      maxUploadMb: env.maxUploadBytes / 1024 / 1024,
      allowedTypes: Object.keys(MIME_EXT),
    },
  });
}

module.exports = { upload, create, list, remove, status };
