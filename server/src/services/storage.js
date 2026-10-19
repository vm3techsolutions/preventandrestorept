const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');

const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
const FOLDERS = ['blogs', 'services', 'treatments', 'pages', 'general'];

const s3 = env.s3Enabled
  ? new S3Client({ region: env.aws.region, credentials: { accessKeyId: env.aws.accessKeyId, secretAccessKey: env.aws.secretAccessKey } })
  : null;

function sniffMime(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.slice(0, 4).toString('ascii') === 'GIF8') return 'image/gif';
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.slice(4, 12).toString('ascii').startsWith('ftypavi')) return 'image/avif';
  return null;
}

function publicUrlFor(key) {
  if (s3) return env.aws.publicBaseUrl ? `${env.aws.publicBaseUrl}/${key}` : `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
  return `/api/uploads/${key}`;
}

async function putObject({ buffer, mimeType, folder }) {
  const now = new Date();
  const key = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${MIME_EXT[mimeType]}`;
  if (s3) {
    await s3.send(new PutObjectCommand({ Bucket: env.aws.bucket, Key: key, Body: buffer, ContentType: mimeType, CacheControl: 'public, max-age=31536000, immutable' }));
  } else {
    const dest = path.join(env.uploadDir, key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buffer);
  }
  return { key, url: publicUrlFor(key), storage: s3 ? 's3' : 'local' };
}

async function deleteObject({ key, storage }) {
  if (storage === 's3') {
    if (!s3) throw new Error('S3 is not configured; cannot delete S3 object');
    await s3.send(new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key }));
  } else {
    await fs.rm(path.join(env.uploadDir, key), { force: true });
  }
}

module.exports = { MIME_EXT, FOLDERS, sniffMime, putObject, deleteObject, storageMode: () => (s3 ? 's3' : 'local') };
