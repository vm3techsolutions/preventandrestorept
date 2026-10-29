const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler: h } = require('../lib/http');
const { TYPES } = require('../content/types');
const { createContentController } = require('../controllers/contentController');
const { createTaxonomyController } = require('../controllers/taxonomyController');
const media = require('../controllers/mediaController');
const admin = require('../controllers/adminController');
const adminUsers = require('../controllers/adminUsersController');
const { taxonomySchema, authorSchema } = require('../validators/schemas');

const router = express.Router();
router.use(requireAuth);

router.get('/dashboard', h(admin.dashboard));

for (const cfg of Object.values(TYPES)) {
  const c = createContentController(cfg);
  const r = express.Router();
  r.get('/', h(c.list));
  r.post('/', h(c.create));
  r.put('/reorder', h(c.reorder));
  r.get('/:id', h(c.get));
  r.put('/:id', h(c.update));
  r.delete('/:id', h(c.remove));
  r.get('/:id/preview', h(c.preview));
  r.post('/:id/publish', h(c.publish));
  r.post('/:id/unpublish', h(c.unpublish));
  r.post('/:id/archive', h(c.archive));
  r.post('/:id/restore', h(c.restore));
  router.use(`/${cfg.key}`, r);
}

const crud = (path, ctrl) => {
  router.get(path, h(ctrl.list));
  router.post(path, h(ctrl.create));
  router.put(`${path}/:id`, h(ctrl.update));
  router.delete(`${path}/:id`, h(ctrl.remove));
};
crud('/categories', createTaxonomyController({ model: 'blogCategory', label: 'Category', schema: taxonomySchema, activityType: 'categories' }));
crud('/tags', createTaxonomyController({ model: 'blogTag', label: 'Tag', schema: taxonomySchema, activityType: 'tags' }));
crud('/authors', createTaxonomyController({ model: 'author', label: 'Author', schema: authorSchema, activityType: 'authors' }));

router.get('/redirects', h(admin.listRedirects));
router.post('/redirects', h(admin.createRedirect));
router.put('/redirects/:id', h(admin.updateRedirect));
router.delete('/redirects/:id', h(admin.deleteRedirect));

router.get('/media/status', h(media.status));
router.get('/media', h(media.list));
router.post('/media', media.upload.single('file'), h(media.create));
router.delete('/media/:id', h(media.remove));

router.get('/admins', h(adminUsers.list));
router.post('/admins', h(adminUsers.create));
router.put('/admins/:id/status', h(adminUsers.setStatus));
router.put('/admins/:id/password', h(adminUsers.resetPassword));

router.get('/activity', h(admin.listActivity));

router.get('/settings', h(admin.getSettings));
router.put('/settings', h(admin.updateSettings));

module.exports = router;
