const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler: h } = require('../lib/http');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { message: 'Too many requests, please try again later.' } } });

router.get('/setup/status', h(auth.setupStatus));
router.post('/setup', limiter, h(auth.setup));
router.post('/login', limiter, h(auth.login));
router.post('/logout', h(auth.logout));
router.get('/me', requireAuth, h(auth.me));
router.put('/password', requireAuth, limiter, h(auth.changePassword));

module.exports = router;
