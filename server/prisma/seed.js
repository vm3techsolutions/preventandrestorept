// Idempotent seed: only creates records that do not exist yet, never overwrites client edits.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const prisma = require('../src/lib/prisma');
const { slugify } = require('../src/lib/slug');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data/legacy.json'), 'utf8'));
const CTA = { ctaHeading: 'Want To Get Relief Faster?', ctaLabel: 'Request Appointment', ctaUrl: '/request-appointment/' };

async function createOnce(model, where, create) {
  const existing = await prisma[model].findUnique({ where });
  if (existing) return { row: existing, created: false };
  return { row: await prisma[model].create({ data: { ...where, ...create } }), created: true };
}

const plain = (blocks) => JSON.stringify(blocks).toLowerCase();

async function main() {
  const { row: author } = await createOnce('author', { slug: 'ray-waters' }, { name: 'Ray Waters', credentials: 'PT, DPT, CSCS, CEAS' });

  const catIds = {};
  const tagIds = {};
  for (const b of data.blogs) {
    for (const name of b.categories) catIds[name] = (await createOnce('blogCategory', { slug: slugify(name) }, { name })).row.id;
    for (const name of b.tags) tagIds[name] = (await createOnce('blogTag', { slug: slugify(name) }, { name })).row.id;
  }

  const services = [];
  for (const [i, s] of data.services.entries()) {
    const { row } = await createOnce('service', { slug: slugify(s.title) }, {
      title: s.title, shortDescription: s.shortDescription, content: s.blocks, status: 'PUBLISHED', publishedAt: new Date(), displayOrder: i + 1, ...CTA,
    });
    services.push(row);
  }

  for (const [i, c] of data.conditions.entries()) {
    const { row, created } = await createOnce('treatment', { slug: c.slug }, {
      title: c.title,
      shortDescription: c.shortDescription || null,
      content: c.blocks,
      featuredImageUrl: c.featuredImage?.url || null,
      featuredImageAlt: c.featuredImage?.alt || null,
      status: c.hasDedicatedPage ? 'PUBLISHED' : 'DRAFT',
      publishedAt: c.hasDedicatedPage ? new Date() : null,
      displayOrder: i + 1,
      ...CTA,
    });
    if (created) {
      const text = plain(c.blocks);
      const links = services.filter((s) => text.includes(s.title.toLowerCase())).map((s) => ({ serviceId: s.id, treatmentId: row.id }));
      if (links.length) await prisma.serviceTreatment.createMany({ data: links, skipDuplicates: true });
    }
  }

  const blogRows = [];
  const sorted = [...data.blogs].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  for (const [i, b] of sorted.entries()) {
    const { row, created } = await createOnce('blog', { slug: b.slug }, {
      title: b.title,
      excerpt: b.excerpt || null,
      introduction: b.introduction,
      authorId: b.author === 'Ray Waters' ? author.id : null,
      status: 'PUBLISHED',
      publishedAt: new Date(`${b.publishedAt}-04:00`),
      featuredImageUrl: b.featuredImage?.url || null,
      featuredImageAlt: b.featuredImage?.alt || null,
      displayOrder: i + 1,
      blocks: { create: b.blocks.map((x, position) => ({ type: x.type, data: x.data, position })) },
      categories: { create: b.categories.map((n) => ({ categoryId: catIds[n] })) },
      tags: { create: b.tags.map((n) => ({ tagId: tagIds[n] })) },
    });
    blogRows.push({ row, created });
  }
  if (blogRows.length === 2 && blogRows.every((x) => x.created)) {
    const [a, b] = blogRows.map((x) => x.row.id);
    await prisma.blogRelated.createMany({ data: [{ blogId: a, relatedBlogId: b }, { blogId: b, relatedBlogId: a }], skipDuplicates: true });
  }

  const legacy = [
    ...data.conditions.filter((c) => c.legacyPath).map((c) => [c.legacyPath, `/what-we-treat/${c.slug}`]),
    ...data.blogs.map((b) => [b.legacyPath, `/blog/${b.slug}`]),
    ['/physical-therapy-services/', '/services'],
    ['/other-conditions/', '/what-we-treat'],
  ];
  for (const [from, to] of legacy) {
    await createOnce('urlRedirect', { fromPath: from.replace(/\/+$/, '').toLowerCase() }, { toPath: to, statusCode: 301, note: 'Legacy WordPress URL' });
  }

  await createOnce('setting', { key: 'general' }, { value: { siteName: 'Prevent & Restore Physical Therapy', defaultMetaDescription: '', defaultOgImage: '' } });

  const counts = await Promise.all([prisma.blog.count(), prisma.service.count(), prisma.treatment.count(), prisma.urlRedirect.count()]);
  console.log(`[seed] blogs=${counts[0]} services=${counts[1]} conditions=${counts[2]} redirects=${counts[3]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
