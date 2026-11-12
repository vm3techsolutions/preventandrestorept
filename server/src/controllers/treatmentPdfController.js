// const multer = require('multer');
// const jwt = require('jsonwebtoken');
// const { z } = require('zod');
// const prisma = require('../lib/prisma');
// const env = require('../config/env');
// const { HttpError, pagination, paged, parseId } = require('../lib/http');
// const { putPrivate, readPrivate, deletePrivate } = require('../services/storage');
// const { logActivity } = require('../services/activity');

// const PDF_MIME = 'application/pdf';
// const TOKEN_AUDIENCE = 'treatment-pdf';
// const TOKEN_TTL = '10m';

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: env.maxUploadBytes, files: 1 },
//   fileFilter: (_req, file, cb) => (file.mimetype === PDF_MIME && /\.pdf$/i.test(file.originalname)
//     ? cb(null, true) : cb(new HttpError(415, 'Only PDF files are allowed'))),
// });

// const isPdf = (buf) => buf.length > 5 && buf.slice(0, 5).toString('ascii') === '%PDF-';

// function safeFileName(name) {
//   const base = String(name || 'treatment-guide').replace(/\.pdf$/i, '').normalize('NFKD')
//     .replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 120);
//   return `${base || 'treatment-guide'}.pdf`;
// }

// const pdfInfo = (t) => ({
//   pdfFileName: t.pdfFileName, pdfSize: t.pdfSize, pdfLabel: t.pdfLabel, pdfUploadedAt: t.pdfUploadedAt, hasPdf: !!t.pdfKey,
// });

// async function findTreatment(id) {
//   const t = await prisma.treatment.findUnique({ where: { id } });
//   if (!t || t.deletedAt) throw new HttpError(404, 'Condition not found');
//   return t;
// }

// // Removes the old file; a storage failure is logged but must not undo the DB change.
// async function dropFile(t) {
//   if (!t.pdfKey) return;
//   try { await deletePrivate({ key: t.pdfKey, storage: t.pdfStorage }); } catch (e) { console.error('[pdf] cleanup failed:', e.message); }
// }

// async function adminUpload(req, res) {
//   const t = await findTreatment(parseId(req.params.id));
//   if (!req.file) throw new HttpError(400, 'No file uploaded (use form field "file")');
//   if (!isPdf(req.file.buffer)) throw new HttpError(415, 'File contents are not a valid PDF');
//   const stored = await putPrivate({ buffer: req.file.buffer, mimeType: PDF_MIME, ext: 'pdf', folder: 'treatment-pdfs' });
//   const updated = await prisma.treatment.update({
//     where: { id: t.id },
//     data: { pdfKey: stored.key, pdfStorage: stored.storage, pdfFileName: safeFileName(req.file.originalname), pdfSize: req.file.size, pdfUploadedAt: new Date(), updatedById: req.admin.id },
//   });
//   await dropFile(t);
//   await logActivity(req, { action: 'update', entityType: 'conditions', entityId: t.id, entityLabel: t.title, details: { pdf: t.pdfKey ? 'replaced' : 'uploaded', file: updated.pdfFileName } });
//   res.status(201).json({ data: pdfInfo(updated) });
// }

// async function adminRemove(req, res) {
//   const t = await findTreatment(parseId(req.params.id));
//   if (!t.pdfKey) throw new HttpError(404, 'This condition has no PDF');
//   const updated = await prisma.treatment.update({
//     where: { id: t.id },
//     data: { pdfKey: null, pdfStorage: null, pdfFileName: null, pdfSize: null, pdfUploadedAt: null, updatedById: req.admin.id },
//   });
//   await dropFile(t);
//   await logActivity(req, { action: 'update', entityType: 'conditions', entityId: t.id, entityLabel: t.title, details: { pdf: 'removed', file: t.pdfFileName } });
//   res.json({ data: pdfInfo(updated) });
// }

// async function streamPdf(res, t, disposition) {
//   const body = await readPrivate({ key: t.pdfKey, storage: t.pdfStorage });
//   res.set({
//     'Content-Type': PDF_MIME,
//     'Content-Disposition': `${disposition}; filename="${t.pdfFileName}"`,
//     'Cache-Control': 'private, no-store',
//     'X-Content-Type-Options': 'nosniff',
//   });
//   body.on('error', () => { if (!res.headersSent) res.status(404).end(); else res.destroy(); });
//   body.pipe(res);
// }

// async function adminOpen(req, res) {
//   const t = await findTreatment(parseId(req.params.id));
//   if (!t.pdfKey) throw new HttpError(404, 'This condition has no PDF');
//   await streamPdf(res, t, 'inline');
// }

// async function adminLeads(req, res) {
//   const p = pagination(req.query);
//   const s = String(req.query.search || '').trim().slice(0, 100);
//   const where = s ? { OR: ['fullName', 'email', 'phone', 'treatmentName', 'location'].map((f) => ({ [f]: { contains: s, mode: 'insensitive' } })) } : {};
//   const [rows, total] = await Promise.all([
//     prisma.pdfLead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit, include: { treatment: { select: { id: true, slug: true } } } }),
//     prisma.pdfLead.count({ where }),
//   ]);
//   res.json(paged(rows.map(({ pdfKey, ...r }) => r), total, p));
// }

// const PHONE = /^\+?[\d\s().-]{7,25}$/;
// const leadSchema = z.object({
//   fullName: z.string().trim().min(2, 'Please enter your full name').max(120),
//   email: z.string().trim().max(200).pipe(z.email('Please enter a valid email address')),
//   phone: z.string().trim().max(25).refine((v) => PHONE.test(v) && v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 15, 'Please enter a valid phone number'),
//   location: z.string().trim().max(120).optional().nullable().transform((v) => v || null),
//   website: z.string().max(200).optional(),
// });

// async function publicSubmit(req, res) {
//   res.set('Cache-Control', 'no-store');
//   const body = leadSchema.parse(req.body || {});
//   // Honeypot: bots fill hidden fields. Pretend success without saving or returning a file.
//   if (body.website) return res.status(201).json({ data: { ok: true } });
//   const t = await prisma.treatment.findUnique({ where: { slug: String(req.params.slug) } });
//   if (!t || t.deletedAt || t.status !== 'PUBLISHED' || !t.pdfKey) throw new HttpError(404, 'This treatment guide is not available');
//   const lead = await prisma.pdfLead.create({
//     data: { fullName: body.fullName, email: body.email.toLowerCase(), phone: body.phone, location: body.location, treatmentId: t.id, treatmentName: t.title, pdfKey: t.pdfKey, pdfFileName: t.pdfFileName },
//   });
//   const token = jwt.sign({ t: t.id, k: t.pdfKey, l: lead.id }, env.sessionSecret, { expiresIn: TOKEN_TTL, audience: TOKEN_AUDIENCE });
//   res.status(201).json({ data: { ok: true, downloadUrl: `/public/treatment-pdf/${token}`, fileName: t.pdfFileName } });
// }

// async function publicDownload(req, res) {
//   let claim;
//   try { claim = jwt.verify(String(req.params.token), env.sessionSecret, { audience: TOKEN_AUDIENCE }); } catch { throw new HttpError(410, 'This download link has expired. Please request the guide again.'); }
//   const t = await prisma.treatment.findUnique({ where: { id: claim.t } });
//   if (!t || t.deletedAt || t.status !== 'PUBLISHED' || !t.pdfKey || t.pdfKey !== claim.k) throw new HttpError(410, 'This guide has changed. Please request it again.');
//   await prisma.pdfLead.updateMany({ where: { id: claim.l, downloadedAt: null }, data: { downloadedAt: new Date() } });
//   await streamPdf(res, t, 'attachment');
// }

// module.exports = { upload, adminUpload, adminRemove, adminOpen, adminLeads, publicSubmit, publicDownload };
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const { HttpError, pagination, paged, parseId } = require('../lib/http');
const {
  putPrivate,
  readPrivate,
  deletePrivate,
} = require('../services/storage');
const { logActivity } = require('../services/activity');

const PDF_MIME = 'application/pdf';
const TOKEN_AUDIENCE = 'treatment-pdf';
const TOKEN_TTL = '10m';

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;

const IMAGE_TYPES = {
  '.jpg': { mime: 'image/jpeg', ext: 'jpg' },
  '.jpeg': { mime: 'image/jpeg', ext: 'jpg' },
  '.png': { mime: 'image/png', ext: 'png' },
  '.webp': { mime: 'image/webp', ext: 'webp' },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadBytes,
    files: 2,
  },
  fileFilter: (req, file, cb) => {
    const name = String(file.originalname || '').toLowerCase();

    if (file.fieldname === 'file') {
      if (
        file.mimetype === PDF_MIME &&
        /\.pdf$/i.test(name)
      ) {
        return cb(null, true);
      }

      return cb(new HttpError(415, 'Only PDF files are allowed'));
    }

    if (file.fieldname === 'thumbnail') {
      const ext = name.slice(name.lastIndexOf('.'));
      const imageType = IMAGE_TYPES[ext];

      if (imageType && file.mimetype === imageType.mime) {
        return cb(null, true);
      }

      return cb(
        new HttpError(415, 'Thumbnail must be JPG, PNG, or WebP'),
      );
    }

    return cb(new HttpError(400, 'Unexpected file field'));
  },
});

const isPdf = (buf) =>
  buf.length > 5 && buf.slice(0, 5).toString('ascii') === '%PDF-';

function getImageType(buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
  ) {
    return 'image/png';
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

function safeFileName(name) {
  const base = String(name || 'treatment-guide')
    .replace(/\.pdf$/i, '')
    .normalize('NFKD')
    .replace(/[^\w\- ]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 120);

  return `${base || 'treatment-guide'}.pdf`;
}

function safeThumbnailFileName(name) {
  const original = String(name || 'treatment-thumbnail');
  const dotIndex = original.lastIndexOf('.');
  const originalExt = dotIndex >= 0
    ? original.slice(dotIndex).toLowerCase()
    : '';

  const imageType = IMAGE_TYPES[originalExt];

  if (!imageType) {
    throw new HttpError(415, 'Unsupported thumbnail format');
  }

  const base = original
    .slice(0, dotIndex)
    .normalize('NFKD')
    .replace(/[^\w\- ]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 120);

  return `${base || 'treatment-thumbnail'}.${imageType.ext}`;
}

const pdfInfo = (t) => ({
  pdfFileName: t.pdfFileName,
  pdfSize: t.pdfSize,
  pdfLabel: t.pdfLabel,
  pdfUploadedAt: t.pdfUploadedAt,
  hasPdf: !!t.pdfKey,

  thumbnailFileName: t.pdfThumbnailFileName,
  thumbnailUploadedAt: t.pdfThumbnailUploadedAt,
  hasThumbnail: !!t.pdfThumbnailKey,
});

async function findTreatment(id) {
  const t = await prisma.treatment.findUnique({
    where: { id },
  });

  if (!t || t.deletedAt) {
    throw new HttpError(404, 'Condition not found');
  }

  return t;
}

async function dropFile(t) {
  if (!t.pdfKey) return;

  try {
    await deletePrivate({
      key: t.pdfKey,
      storage: t.pdfStorage,
    });
  } catch (e) {
    console.error('[pdf] cleanup failed:', e.message);
  }
}

async function dropThumbnail(t) {
  if (!t.pdfThumbnailKey) return;

  try {
    await deletePrivate({
      key: t.pdfThumbnailKey,
      storage: t.pdfThumbnailStorage,
    });
  } catch (e) {
    console.error('[pdf thumbnail] cleanup failed:', e.message);
  }
}

async function adminUpload(req, res) {
  const t = await findTreatment(parseId(req.params.id));

  const pdfFile = req.files?.file?.[0] || null;
  const thumbnailFile = req.files?.thumbnail?.[0] || null;

  if (!pdfFile && !thumbnailFile) {
    throw new HttpError(
      400,
      'Please upload a PDF or a thumbnail',
    );
  }

  // A new treatment guide must have a PDF.
  // An existing guide can have its thumbnail updated independently.
  if (!pdfFile && !t.pdfKey) {
    throw new HttpError(
      400,
      'Upload the PDF before adding a thumbnail',
    );
  }

  if (pdfFile && !isPdf(pdfFile.buffer)) {
    throw new HttpError(415, 'File contents are not a valid PDF');
  }

  if (thumbnailFile) {
    if (thumbnailFile.size > MAX_THUMBNAIL_BYTES) {
      throw new HttpError(
        413,
        'Thumbnail must not exceed 2 MB',
      );
    }

    const detectedMime = getImageType(thumbnailFile.buffer);

    if (
      !detectedMime ||
      detectedMime !== thumbnailFile.mimetype
    ) {
      throw new HttpError(
        415,
        'Thumbnail contents are not a valid JPG, PNG, or WebP image',
      );
    }
  }

  let newPdf = null;
  let newThumbnail = null;
  let dbUpdated = false;

  try {
    if (pdfFile) {
      newPdf = await putPrivate({
        buffer: pdfFile.buffer,
        mimeType: PDF_MIME,
        ext: 'pdf',
        folder: 'treatment-pdfs',
      });
    }

    if (thumbnailFile) {
      const mimeType = getImageType(thumbnailFile.buffer);
      const ext = mimeType === 'image/jpeg'
        ? 'jpg'
        : mimeType === 'image/png'
          ? 'png'
          : 'webp';

      newThumbnail = await putPrivate({
        buffer: thumbnailFile.buffer,
        mimeType,
        ext,
        folder: 'treatment-thumbnails',
      });
    }

    const data = {
      updatedById: req.admin.id,
    };

    if (newPdf) {
      data.pdfKey = newPdf.key;
      data.pdfStorage = newPdf.storage;
      data.pdfFileName = safeFileName(pdfFile.originalname);
      data.pdfSize = pdfFile.size;
      data.pdfUploadedAt = new Date();
    }

    if (newThumbnail) {
      data.pdfThumbnailKey = newThumbnail.key;
      data.pdfThumbnailStorage = newThumbnail.storage;
      data.pdfThumbnailFileName = safeThumbnailFileName(
        thumbnailFile.originalname,
      );
      data.pdfThumbnailUploadedAt = new Date();
    }

    const updated = await prisma.treatment.update({
      where: { id: t.id },
      data,
    });
    dbUpdated = true;

    // Clean up replaced files only after the database update succeeds.
    if (newPdf && t.pdfKey) {
      await dropFile(t);
    }

    if (newThumbnail && t.pdfThumbnailKey) {
      await dropThumbnail(t);
    }

    await logActivity(req, {
      action: 'update',
      entityType: 'conditions',
      entityId: t.id,
      entityLabel: t.title,
      details: {
        pdf: newPdf
          ? (t.pdfKey ? 'replaced' : 'uploaded')
          : 'unchanged',
        thumbnail: newThumbnail
          ? (t.pdfThumbnailKey ? 'replaced' : 'uploaded')
          : 'unchanged',
        file: updated.pdfFileName,
        thumbnailFile: updated.pdfThumbnailFileName,
      },
    });

    res.status(201).json({
      data: pdfInfo(updated),
    });
    } catch (error) {
    // Clean up newly uploaded files only if the database update failed.
    if (!dbUpdated) {
      if (newPdf) {
        try {
          await deletePrivate({
            key: newPdf.key,
            storage: newPdf.storage,
          });
        } catch (cleanupError) {
          console.error(
            '[pdf] new file cleanup failed:',
            cleanupError.message,
          );
        }
      }

      if (newThumbnail) {
        try {
          await deletePrivate({
            key: newThumbnail.key,
            storage: newThumbnail.storage,
          });
        } catch (cleanupError) {
          console.error(
            '[pdf thumbnail] new file cleanup failed:',
            cleanupError.message,
          );
        }
      }
    }

    throw error;
  }
}

async function adminRemove(req, res) {
  const t = await findTreatment(parseId(req.params.id));

  if (!t.pdfKey) {
    throw new HttpError(404, 'This condition has no PDF');
  }

  const updated = await prisma.treatment.update({
    where: { id: t.id },
    data: {
      pdfKey: null,
      pdfStorage: null,
      pdfFileName: null,
      pdfSize: null,
      pdfLabel: null,
      pdfUploadedAt: null,

      pdfThumbnailKey: null,
      pdfThumbnailStorage: null,
      pdfThumbnailFileName: null,
      pdfThumbnailUploadedAt: null,

      updatedById: req.admin.id,
    },
  });

  await dropFile(t);
  await dropThumbnail(t);

  await logActivity(req, {
    action: 'update',
    entityType: 'conditions',
    entityId: t.id,
    entityLabel: t.title,
    details: {
      pdf: 'removed',
      thumbnail: t.pdfThumbnailKey ? 'removed' : 'none',
      file: t.pdfFileName,
    },
  });

  res.json({
    data: pdfInfo(updated),
  });
}

async function adminRemoveThumbnail(req, res) {
  const t = await findTreatment(parseId(req.params.id));

  if (!t.pdfThumbnailKey) {
    throw new HttpError(404, 'This condition has no thumbnail');
  }

  const updated = await prisma.treatment.update({
    where: { id: t.id },
    data: {
      pdfThumbnailKey: null,
      pdfThumbnailStorage: null,
      pdfThumbnailFileName: null,
      pdfThumbnailUploadedAt: null,
      updatedById: req.admin.id,
    },
  });

  await dropThumbnail(t);

  await logActivity(req, {
    action: 'update',
    entityType: 'conditions',
    entityId: t.id,
    entityLabel: t.title,
    details: {
      thumbnail: 'removed',
      file: t.pdfThumbnailFileName,
    },
  });

  res.json({
    data: pdfInfo(updated),
  });
}

async function streamPdf(res, t, disposition) {
  const body = await readPrivate({
    key: t.pdfKey,
    storage: t.pdfStorage,
  });

  res.set({
    'Content-Type': PDF_MIME,
    'Content-Disposition': `${disposition}; filename="${t.pdfFileName}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  body.on('error', () => {
    if (!res.headersSent) {
      res.status(404).end();
    } else {
      res.destroy();
    }
  });

  body.pipe(res);
}

async function streamThumbnail(res, t, { publicCache = false } = {}) {
  const body = await readPrivate({
    key: t.pdfThumbnailKey,
    storage: t.pdfThumbnailStorage,
  });

  const name = String(t.pdfThumbnailFileName || '').toLowerCase();

  const mimeType = name.endsWith('.png')
    ? 'image/png'
    : name.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

  res.set({
    'Content-Type': mimeType,
    'Content-Disposition': `inline; filename="${t.pdfThumbnailFileName}"`,
    'Cache-Control': publicCache
      ? 'public, max-age=60, stale-while-revalidate=300'
      : 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  body.on('error', () => {
    if (!res.headersSent) {
      res.status(404).end();
    } else {
      res.destroy();
    }
  });

  body.pipe(res);
}

async function adminOpen(req, res) {
  const t = await findTreatment(parseId(req.params.id));

  if (!t.pdfKey) {
    throw new HttpError(404, 'This condition has no PDF');
  }

  await streamPdf(res, t, 'inline');
}

async function adminThumbnailOpen(req, res) {
  const t = await findTreatment(parseId(req.params.id));

  if (!t.pdfThumbnailKey) {
    throw new HttpError(404, 'This condition has no thumbnail');
  }

  await streamThumbnail(res, t);
}

async function adminLeads(req, res) {
  const p = pagination(req.query);
  const s = String(req.query.search || '').trim().slice(0, 100);

  const where = s
    ? {
        OR: [
          'fullName',
          'email',
          'phone',
          'treatmentName',
          'location',
        ].map((f) => ({
          [f]: {
            contains: s,
            mode: 'insensitive',
          },
        })),
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.pdfLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.limit,
      include: {
        treatment: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    }),
    prisma.pdfLead.count({ where }),
  ]);

  res.json(
    paged(
      rows.map(({ pdfKey, ...r }) => r),
      total,
      p,
    ),
  );
}

const PHONE = /^\+?[\d\s().-]{7,25}$/;

const leadSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.string().trim().max(200).pipe(
    z.email('Please enter a valid email address'),
  ),
  phone: z.string().trim().max(25).refine(
    (v) =>
      PHONE.test(v) &&
      v.replace(/\D/g, '').length >= 10 &&
      v.replace(/\D/g, '').length <= 15,
    'Please enter a valid phone number',
  ),
  location: z.string().trim().max(120).optional().nullable().transform(
    (v) => v || null,
  ),
  website: z.string().max(200).optional(),
});

async function publicSubmit(req, res) {
  res.set('Cache-Control', 'no-store');

  const body = leadSchema.parse(req.body || {});

  // Honeypot: bots fill hidden fields. Pretend success without saving or returning a file.
  if (body.website) {
    return res.status(201).json({
      data: { ok: true },
    });
  }

  const t = await prisma.treatment.findUnique({
    where: { slug: String(req.params.slug) },
  });

  if (
    !t ||
    t.deletedAt ||
    t.status !== 'PUBLISHED' ||
    !t.pdfKey
  ) {
    throw new HttpError(
      404,
      'This treatment guide is not available',
    );
  }

  const lead = await prisma.pdfLead.create({
    data: {
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      location: body.location,
      treatmentId: t.id,
      treatmentName: t.title,
      pdfKey: t.pdfKey,
      pdfFileName: t.pdfFileName,
    },
  });

  const token = jwt.sign(
    {
      t: t.id,
      k: t.pdfKey,
      l: lead.id,
    },
    env.sessionSecret,
    {
      expiresIn: TOKEN_TTL,
      audience: TOKEN_AUDIENCE,
    },
  );

  res.status(201).json({
    data: {
      ok: true,
      downloadUrl: `/public/treatment-pdf/${token}`,
      fileName: t.pdfFileName,
    },
  });
}

async function publicDownload(req, res) {
  let claim;

  try {
    claim = jwt.verify(
      String(req.params.token),
      env.sessionSecret,
      { audience: TOKEN_AUDIENCE },
    );
  } catch {
    throw new HttpError(
      410,
      'This download link has expired. Please request the guide again.',
    );
  }

  const t = await prisma.treatment.findUnique({
    where: { id: claim.t },
  });

  if (
    !t ||
    t.deletedAt ||
    t.status !== 'PUBLISHED' ||
    !t.pdfKey ||
    t.pdfKey !== claim.k
  ) {
    throw new HttpError(
      410,
      'This guide has changed. Please request it again.',
    );
  }

  await prisma.pdfLead.updateMany({
    where: {
      id: claim.l,
      downloadedAt: null,
    },
    data: {
      downloadedAt: new Date(),
    },
  });

  await streamPdf(res, t, 'attachment');
}

async function publicThumbnail(req, res) {
  const t = await prisma.treatment.findFirst({
    where: {
      slug: String(req.params.slug),
      status: 'PUBLISHED',
      deletedAt: null,
    },
  });

  if (!t?.pdfKey || !t.pdfThumbnailKey) {
    throw new HttpError(404, 'This treatment thumbnail is not available');
  }

  await streamThumbnail(res, t, { publicCache: true });
}

module.exports = {
  upload,
  adminUpload,
  adminRemove,
  adminOpen,
  adminThumbnailOpen,
  adminRemoveThumbnail,
  adminLeads,
  publicSubmit,
  publicDownload,
  publicThumbnail,
};