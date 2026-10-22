const { blogSchema, serviceSchema, pageSchema } = require('../validators/schemas');
const { sanitizeBlocks, cleanText } = require('../lib/sanitize');
const { buildSeo } = require('../lib/seo');

const image = (url, alt, caption) => (url ? { url, alt: alt || '', caption: caption || '' } : null);
const isLive = (r) => r && r.status === 'PUBLISHED' && !r.deletedAt;
const seoData = (b) => ({ seoTitle: b.seoTitle, metaDescription: b.metaDescription, canonicalUrl: b.canonicalUrl, noindex: b.noindex });
const blocksOut = (list) => (list || []).map((b, i) => ({ type: b.type, data: b.data, position: b.position ?? i }));
const unique = (arr) => [...new Set(arr)];

function blockErrors(blocks) {
  return (blocks || []).flatMap((b, i) => {
    if (b.type === 'image' && (!b.data?.url || !b.data?.alt)) return [`Content block ${i + 1}: images need a file and alt text`];
    if (b.type === 'cta' && (!b.data?.buttonLabel || !b.data?.buttonUrl)) return [`Content block ${i + 1}: CTA needs a button label and URL`];
    return [];
  });
}

function publishErrors(r, blocks) {
  const errs = [];
  if (r.featuredImageUrl && !r.featuredImageAlt) errs.push('Featured image needs alt text');
  return errs.concat(blockErrors(blocks));
}

const relatedSelect = { select: { id: true, title: true, slug: true, status: true, deletedAt: true } };
const adminRef = { select: { id: true, name: true, email: true } };
const auditInclude = { createdBy: adminRef, updatedBy: adminRef };

const blogs = {
  key: 'blogs',
  model: 'blog',
  label: 'Blog',
  folder: 'blogs',
  newOnTop: true,
  audit: true,
  path: (slug) => `/blogs/${slug}`,
  schema: blogSchema,
  searchFields: ['title', 'slug', 'excerpt'],
  include: {
    ...auditInclude,
    author: true,
    blocks: { orderBy: { position: 'asc' } },
    categories: { include: { category: true } },
    tags: { include: { tag: true } },
    related: {
      orderBy: { position: 'asc' },
      include: { relatedBlog: { select: { id: true, title: true, slug: true, status: true, deletedAt: true, excerpt: true, featuredImageUrl: true, featuredImageAlt: true, publishedAt: true } } },
    },
  },
  listInclude: { ...auditInclude, author: true, categories: { include: { category: true } }, tags: { include: { tag: true } } },
  extraWhere(q) {
    const where = {};
    const by = (v) => (/^\d+$/.test(String(v)) ? { id: Number(v) } : { slug: String(v) });
    if (q.category) where.categories = { some: { category: by(q.category) } };
    if (q.tag) where.tags = { some: { tag: by(q.tag) } };
    if (q.author) where.author = by(q.author);
    return where;
  },
  toData: (b) => ({
    title: b.title,
    excerpt: b.excerpt,
    introduction: b.introduction,
    authorId: b.authorId ?? null,
    publishedAt: b.publishedAt ? new Date(b.publishedAt) : null,
    featuredImageUrl: b.featuredImageUrl,
    featuredImageAlt: b.featuredImageAlt,
    featuredImageCaption: b.featuredImageCaption,
    targetKeyword: b.targetKeyword,
    ...seoData(b),
  }),
  async afterSave(tx, id, b) {
    await tx.blogContentBlock.deleteMany({ where: { blogId: id } });
    const clean = sanitizeBlocks(b.blocks);
    if (clean.length) await tx.blogContentBlock.createMany({ data: clean.map((x, i) => ({ blogId: id, type: x.type, data: x.data, position: i })) });
    await tx.blogCategoryMapping.deleteMany({ where: { blogId: id } });
    if (b.categoryIds.length) await tx.blogCategoryMapping.createMany({ data: unique(b.categoryIds).map((categoryId) => ({ blogId: id, categoryId })) });
    await tx.blogTagMapping.deleteMany({ where: { blogId: id } });
    if (b.tagIds.length) await tx.blogTagMapping.createMany({ data: unique(b.tagIds).map((tagId) => ({ blogId: id, tagId })) });
    await tx.blogRelated.deleteMany({ where: { blogId: id } });
    const rel = unique(b.relatedBlogIds).filter((x) => x !== id);
    if (rel.length) await tx.blogRelated.createMany({ data: rel.map((relatedBlogId, position) => ({ blogId: id, relatedBlogId, position })) });
  },
  serializeAdmin(r) {
    const { blocks, categories, tags, related, relatedBy, author, ...rest } = r;
    return {
      ...rest,
      path: blogs.path(r.slug),
      author: author ? { id: author.id, name: author.name } : null,
      categories: (categories || []).map((m) => m.category),
      categoryIds: (categories || []).map((m) => m.categoryId),
      tags: (tags || []).map((m) => m.tag),
      tagIds: (tags || []).map((m) => m.tagId),
      relatedBlogs: (related || []).map((m) => m.relatedBlog),
      relatedBlogIds: (related || []).map((m) => m.relatedBlogId),
      ...(blocks ? { blocks: blocksOut(blocks) } : {}),
    };
  },
  publishErrors: (r) => publishErrors(r, r.blocks),
  publicSummary: (r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    path: blogs.path(r.slug),
    excerpt: r.excerpt,
    publishedAt: r.publishedAt,
    updatedAt: r.updatedAt,
    author: r.author ? { name: r.author.name, slug: r.author.slug, credentials: r.author.credentials } : null,
    featuredImage: image(r.featuredImageUrl, r.featuredImageAlt, r.featuredImageCaption),
    categories: (r.categories || []).map((m) => ({ name: m.category.name, slug: m.category.slug })),
    tags: (r.tags || []).map((m) => ({ name: m.tag.name, slug: m.tag.slug })),
  }),
  async publicDetail(r) {
    return {
      ...blogs.publicSummary(r),
      introduction: r.introduction,
      blocks: blocksOut(r.blocks),
      related: (r.related || []).map((m) => m.relatedBlog).filter(isLive).map((x) => ({
        title: x.title, slug: x.slug, path: blogs.path(x.slug), excerpt: x.excerpt, publishedAt: x.publishedAt, featuredImage: image(x.featuredImageUrl, x.featuredImageAlt),
      })),
      seo: await buildSeo({ ...r, fallbackDescription: r.excerpt || r.introduction, path: blogs.path(r.slug), image: r.featuredImageUrl, keyword: r.targetKeyword }),
    };
  },
};

function serviceLike({ key, model, label, folder, prefix, relation, relKey, relPrefix, relatedName }) {
  const cfg = {
    key,
    model,
    label,
    folder,
    audit: true,
    path: (slug) => `${prefix}/${slug}`,
    schema: serviceSchema,
    searchFields: ['title', 'slug', 'shortDescription'],
    include: { ...auditInclude, [relation]: { include: { [relKey]: relatedSelect } } },
    listInclude: { ...auditInclude, [relation]: { include: { [relKey]: relatedSelect } } },
    toData: (b) => ({
      title: b.title,
      shortDescription: b.shortDescription,
      content: sanitizeBlocks(b.content),
      featuredImageUrl: b.featuredImageUrl,
      featuredImageAlt: b.featuredImageAlt,
      iconName: b.iconName,
      faqs: b.faqs.map((f) => ({ question: cleanText(f.question), answer: cleanText(f.answer) })),
      ctaHeading: b.ctaHeading,
      ctaLabel: b.ctaLabel,
      ctaUrl: b.ctaUrl,
      ...seoData(b),
    }),
    async afterSave(tx, id, b) {
      const self = model === 'service' ? 'serviceId' : 'treatmentId';
      const other = model === 'service' ? 'treatmentId' : 'serviceId';
      await tx.serviceTreatment.deleteMany({ where: { [self]: id } });
      if (b.relatedIds.length) await tx.serviceTreatment.createMany({ data: unique(b.relatedIds).map((x) => ({ [self]: id, [other]: x })) });
    },
    serializeAdmin(r) {
      const { [relation]: rel, ...rest } = r;
      return { ...rest, path: cfg.path(r.slug), content: blocksOut(r.content), related: (rel || []).map((m) => m[relKey]), relatedIds: (rel || []).map((m) => m[relKey].id) };
    },
    publishErrors: (r) => publishErrors(r, r.content),
    publicSummary: (r) => ({
      id: r.id, title: r.title, slug: r.slug, path: cfg.path(r.slug), shortDescription: r.shortDescription,
      featuredImage: image(r.featuredImageUrl, r.featuredImageAlt), iconName: r.iconName, updatedAt: r.updatedAt,
    }),
    async publicDetail(r) {
      return {
        ...cfg.publicSummary(r),
        content: blocksOut(r.content),
        faqs: r.faqs || [],
        cta: r.ctaLabel && r.ctaUrl ? { heading: r.ctaHeading, label: r.ctaLabel, url: r.ctaUrl } : null,
        [relatedName]: (r[relation] || []).map((m) => m[relKey]).filter(isLive).map((x) => ({ title: x.title, slug: x.slug, path: `${relPrefix}/${x.slug}` })),
        seo: await buildSeo({ ...r, fallbackDescription: r.shortDescription, path: cfg.path(r.slug), image: r.featuredImageUrl }),
      };
    },
  };
  return cfg;
}

const services = serviceLike({ key: 'services', model: 'service', label: 'Service', folder: 'services', prefix: '/services', relation: 'treatments', relKey: 'treatment', relPrefix: '/what-we-treat', relatedName: 'relatedConditions' });
const conditions = serviceLike({ key: 'conditions', model: 'treatment', label: 'Condition', folder: 'treatments', prefix: '/what-we-treat', relation: 'services', relKey: 'service', relPrefix: '/services', relatedName: 'relatedServices' });

const pages = {
  key: 'pages',
  model: 'page',
  label: 'Page',
  folder: 'pages',
  isPage: true,
  path: (slug) => `/${slug}`,
  schema: pageSchema,
  searchFields: ['title', 'slug', 'excerpt'],
  include: undefined,
  listInclude: undefined,
  toData: (b) => ({
    title: b.title, excerpt: b.excerpt, content: sanitizeBlocks(b.content), featuredImageUrl: b.featuredImageUrl, featuredImageAlt: b.featuredImageAlt, ...seoData(b),
  }),
  serializeAdmin: (r) => ({ ...r, path: pages.path(r.slug), content: blocksOut(r.content) }),
  publishErrors: (r) => publishErrors(r, r.content),
  publicSummary: (r) => ({ id: r.id, title: r.title, slug: r.slug, path: pages.path(r.slug), excerpt: r.excerpt, featuredImage: image(r.featuredImageUrl, r.featuredImageAlt), updatedAt: r.updatedAt }),
  async publicDetail(r) {
    return { ...pages.publicSummary(r), content: blocksOut(r.content), publishedAt: r.publishedAt, seo: await buildSeo({ ...r, fallbackDescription: r.excerpt, path: pages.path(r.slug), image: r.featuredImageUrl }) };
  },
};

module.exports = { blogs, services, conditions, pages, TYPES: { blogs, services, conditions, pages } };
