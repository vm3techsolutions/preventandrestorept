class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function pagination(query, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function paged(items, total, { page, limit }) {
  return { data: items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

function parseId(value) {
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid id');
  return id;
}

module.exports = { HttpError, asyncHandler, pagination, paged, parseId };
