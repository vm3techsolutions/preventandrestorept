const express = require('express');
const rateLimit = require('express-rate-limit');
const { asyncHandler: h } = require('../lib/http');
const { TYPES } = require('../content/types');
const pub = require('../controllers/publicController');
const treatmentPdf = require('../controllers/treatmentPdfController');

const router = express.Router();
const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { message: 'Too many requests, please try again later.' } } });

router.use((_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});

router.get('/blogs/categories', h((req, res) => pub.taxonomyList('blogCategory', req, res)));
router.get('/blogs/tags', h((req, res) => pub.taxonomyList('blogTag', req, res)));

router.post('/conditions/:slug/pdf-leads', leadLimiter, h(treatmentPdf.publicSubmit));
router.get('/treatment-pdf/:token', h(treatmentPdf.publicDownload));

for (const cfg of Object.values(TYPES)) {
  const c = pub.createPublicController(cfg);
  router.get(`/${cfg.key}`, h(c.list));
  router.get(`/${cfg.key}/:slug`, h(c.detail));
}

router.get('/redirects/resolve', h(pub.resolveRedirect));
router.get('/redirects', h(pub.listRedirects));
router.get('/sitemap.xml', h(pub.sitemapXml));
router.get('/sitemap', h(pub.sitemapJson));
router.get('/settings', h(pub.settings));
router.get('/reviews', h(require('../controllers/reviewsController').publicList));

module.exports = router;
