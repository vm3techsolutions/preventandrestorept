// Idempotent, non-destructive: restructures What We Treat into 11 body-region pages and aligns the 8 services.
require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { applySlugChange } = require('../src/services/redirects');
const { REGIONS, NEW_SERVICES, RENAMES, SERVICE_ORDER } = require('../prisma/seed-data/body-regions');

const NOTE = 'Draft copy for client review. Please verify before relying on it.';
const now = new Date();

async function services(tx) {
  for (const r of RENAMES) {
    const row = await tx.service.findFirst({ where: { OR: [{ slug: r.from }, { slug: r.slug }], deletedAt: null } });
    if (!row || row.slug === r.slug) continue;
    await tx.service.update({ where: { id: row.id }, data: { slug: r.slug, title: r.title, seoTitle: `${r.title} | Prevent & Restore PT` } });
    if (row.status === 'PUBLISHED') await applySlugChange(tx, `/services/${r.from}`, `/services/${r.slug}`);
  }
  for (const s of NEW_SERVICES) {
    if (await tx.service.findUnique({ where: { slug: s.slug } })) continue;
    await tx.service.create({ data: { ...s, status: 'PUBLISHED', publishedAt: now, needsReview: true, seoTitle: `${s.title} | Prevent & Restore PT`, metaDescription: s.shortDescription.replace(/ \[.*\]$/, '').slice(0, 160), content: [{ type: 'disclaimer', data: { text: NOTE } }] } });
  }
  const all = await tx.service.findMany({ where: { deletedAt: null }, orderBy: { displayOrder: 'asc' } });
  const ordered = [...SERVICE_ORDER.map((slug) => all.find((x) => x.slug === slug)).filter(Boolean), ...all.filter((x) => !SERVICE_ORDER.includes(x.slug))];
  for (const [i, x] of ordered.entries()) await tx.service.update({ where: { id: x.id }, data: { displayOrder: i + 1 } });
  return Object.fromEntries(all.map((x) => [x.slug, x.id]));
}

async function regions(tx, svc) {
  const ids = [];
  for (const [i, r] of REGIONS.entries()) {
    const sections = r.sections.map((s, j) => ({
      id: `${r.slug}-${j}`, heading: s.heading, description: s.description, symptoms: s.symptoms, howPtHelps: s.howPtHelps,
      imageUrl: null, imageAlt: null, faqs: [], relatedServiceIds: s.services.map((x) => svc[x]).filter(Boolean), ctaLabel: null, ctaUrl: null,
    }));
    const data = { title: r.title, shortDescription: r.intro, seoTitle: r.seoTitle, metaDescription: r.meta, sections, needsReview: true, displayOrder: i + 1, status: 'PUBLISHED' };
    let row = await tx.treatment.findFirst({ where: { slug: { in: [r.slug, r.reuse].filter(Boolean) }, deletedAt: null } });
    if (row?.slug === r.slug && Array.isArray(row.sections) && row.sections.length) { ids.push(row.id); continue; }
    if (row) {
      const wasLive = row.status === 'PUBLISHED';
      row = await tx.treatment.update({ where: { id: row.id }, data: { ...data, slug: r.slug, publishedAt: row.publishedAt || now } });
      if (wasLive && r.reuse !== r.slug) await applySlugChange(tx, `/what-we-treat/${r.reuse}`, `/what-we-treat/${r.slug}`);
    } else {
      row = await tx.treatment.create({ data: { ...data, slug: r.slug, publishedAt: now, content: [] } });
    }
    await tx.urlRedirect.deleteMany({ where: { fromPath: `/what-we-treat/${r.slug}` } });
    const rel = [...new Set(sections.flatMap((s) => s.relatedServiceIds))];
    await tx.serviceTreatment.deleteMany({ where: { treatmentId: row.id } });
    if (rel.length) await tx.serviceTreatment.createMany({ data: rel.map((serviceId) => ({ serviceId, treatmentId: row.id })) });
    ids.push(row.id);
  }
  // Sports Injuries is archived (kept) and redirected to Muscle Strains.
  const sports = await tx.treatment.findUnique({ where: { slug: 'sports-injuries' } });
  if (sports && sports.status === 'PUBLISHED') {
    await tx.treatment.update({ where: { id: sports.id }, data: { status: 'ARCHIVED', displayOrder: 100 } });
    await applySlugChange(tx, '/what-we-treat/sports-injuries', '/what-we-treat/muscle-strains');
  }
  const rest = await tx.treatment.findMany({ where: { id: { notIn: ids } }, orderBy: { displayOrder: 'asc' } });
  for (const [i, x] of rest.entries()) await tx.treatment.update({ where: { id: x.id }, data: { displayOrder: 20 + i } });
}

(async () => {
  await prisma.$transaction(async (tx) => {
    const svc = await services(tx);
    await regions(tx, svc);
  }, { timeout: 60000 });
  const redirects = await prisma.urlRedirect.findMany({ where: { OR: [{ toPath: { startsWith: '/what-we-treat' } }, { toPath: { startsWith: '/services/' } }] }, orderBy: { fromPath: 'asc' } });
  redirects.forEach((r) => console.log(`${r.fromPath} -> ${r.toPath}`));
  await prisma.$disconnect();
})();
