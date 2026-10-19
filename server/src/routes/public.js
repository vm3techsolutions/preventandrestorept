const express = require('express');
const { asyncHandler: h } = require('../lib/http');
const { TYPES } = require('../content/types');
const pub = require('../controllers/publicController');

const router = express.Router();

router.use((_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});

router.get('/blogs/categories', h((req, res) => pub.taxonomyList('blogCategory', req, res)));
router.get('/blogs/tags', h((req, res) => pub.taxonomyList('blogTag', req, res)));

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

module.exports = router;
