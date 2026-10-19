const { ZodError } = require('zod');
const multer = require('multer');
const { HttpError } = require('../lib/http');

function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let status = 500;
  let message = 'Internal server error';
  let details;
  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 422;
    message = err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).slice(0, 5).join('; ');
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
  } else if (err?.code === 'P2002') {
    status = 409;
    message = `A record with this ${(err.meta?.target || ['value']).join(', ')} already exists`;
  } else if (err?.code === 'P2025') {
    status = 404;
    message = 'Record not found';
  } else if (err?.code === 'P2003') {
    status = 409;
    message = 'Operation would break a related record (invalid or in-use reference)';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  } else if (err?.status && err.status < 500) {
    status = err.status;
    message = err.status === 404 ? 'Not found' : err.message;
  }
  if (status >= 500) console.error(err);
  res.status(status).json({ error: { message, ...(details ? { details } : {}) } });
}

module.exports = { notFound, errorHandler };
