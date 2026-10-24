const prisma = require('./prisma');
const { HttpError } = require('./http');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Routes owned by the developer-managed frontend; CMS pages may never claim them.
const RESERVED_PAGE_SLUGS = new Set([
  'home', 'index', 'about', 'about-us', 'blog', 'blogs', 'services', 'what-we-treat', 'conditions', 'contact',
  'privacy-policy', 'terms-and-conditions',
  'admin', 'api', 'login', 'logout', 'setup', 'preview', 'search', 'sitemap', 'sitemap-xml', 'robots',
  'robots-txt', 'favicon-ico', 'static', 'uploads', 'media', '_next', 'next', 'assets', 'public',
  'category', 'tag', 'author', 'feed', 'rss', 'contact', 'contact-us', '404', '500',
]);

function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
    .replace(/-+$/g, '');
}

async function uniqueSlug(model, base, excludeId) {
  const root = base || 'untitled';
  let slug = root;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma[model].findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

async function resolveSlug({ model, label, isPage }, requested, title, existing) {
  const explicit = requested !== undefined && requested !== null && String(requested).trim() !== '';
  const slug = explicit ? slugify(requested) : existing ? existing.slug : slugify(title);
  if (!SLUG_RE.test(slug)) throw new HttpError(422, 'Slug must contain lowercase letters, numbers and hyphens only');
  if (isPage) await assertPageSlugAllowed(slug);
  if (!explicit && !existing) return uniqueSlug(model, slug);
  const clash = await prisma[model].findFirst({ where: { slug, ...(existing ? { NOT: { id: existing.id } } : {}) } });
  if (clash) throw new HttpError(409, `Another ${label.toLowerCase()} already uses the slug "${slug}"`);
  return slug;
}

async function assertPageSlugAllowed(slug) {
  if (RESERVED_PAGE_SLUGS.has(slug)) throw new HttpError(422, `"/${slug}" is a reserved route managed by the developer`);
  const redirect = await prisma.urlRedirect.findUnique({ where: { fromPath: `/${slug}` } });
  if (redirect) throw new HttpError(409, `"/${slug}" is already used by a URL redirect to ${redirect.toPath}. Remove that redirect first.`);
}

module.exports = { slugify, uniqueSlug, resolveSlug, SLUG_RE, RESERVED_PAGE_SLUGS };
