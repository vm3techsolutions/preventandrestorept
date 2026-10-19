const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const { originGuard } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, !origin || env.clientOrigins.includes(origin)), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));

app.use('/api/uploads', express.static(env.uploadDir, {
  fallthrough: false,
  maxAge: '30d',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

const api = express.Router();
api.get('/health', (_req, res) => res.json({ status: 'ok', version: 'v1' }));
api.use(originGuard);
api.use('/auth', require('./routes/auth'));
api.use('/admin', require('./routes/admin'));
api.use('/public', require('./routes/public'));

app.use('/api/v1', api);
app.use('/api', api);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
