import { uid } from './utils';

export const CONTENT_TYPES = {
  blogs: { key: 'blogs', kind: 'blog', label: 'Blog', plural: 'Blogs', adminPath: '/admin/blogs', publicPrefix: '/blogs/', folder: 'blogs', blocksField: 'blocks' },
  services: {
    key: 'services', kind: 'service', label: 'Service', plural: 'Services', adminPath: '/admin/services', publicPrefix: '/services/', folder: 'services',
    blocksField: 'content', relatedLabel: 'Related conditions', relatedResource: 'conditions',
  },
  conditions: {
    key: 'conditions', kind: 'service', label: 'Condition', plural: 'What We Treat', adminPath: '/admin/what-we-treat', publicPrefix: '/what-we-treat/', folder: 'treatments',
    blocksField: 'content', relatedLabel: 'Related services', relatedResource: 'services', sections: true,
  },
  pages: { key: 'pages', kind: 'page', label: 'Page', plural: 'Pages', adminPath: '/admin/pages', publicPrefix: '/', folder: 'pages', blocksField: 'content' },
  caseStudies: { key: 'caseStudies', kind: 'case', label: 'Case study', plural: 'Case Studies', adminPath: '/admin/case-studies', publicPrefix: '/case-studies/', folder: 'case-studies', blocksField: null },
};

const SEO = { seoTitle: '', metaDescription: '', canonicalUrl: '', noindex: false };

export function emptyForm(type) {
  const base = { title: '', slug: '', featuredImageUrl: '', featuredImageAlt: '', blocks: [], ...SEO };
  if (type.kind === 'blog') {
    return { ...base, excerpt: '', introduction: '', authorId: null, publishedAt: '', featuredImageCaption: '', targetKeyword: '', categoryIds: [], tagIds: [], relatedBlogIds: [] };
  }
  if (type.kind === 'service') return { ...base, shortDescription: '', iconName: '', faqs: [], ctaHeading: '', ctaLabel: '', ctaUrl: '', relatedIds: [], targetKeyword: '', needsReview: false, ...(type.sections ? { sections: [] } : {}) };
  if (type.kind === 'case') {
    return {
      ...base, summary: '', primaryConcern: '', patientGoal: '', careApproach: '', outcomeSummary: '', challenge: '', assessment: '', plan: '', progress: '', outcome: '', takeaways: '',
      clinician: '', showApproach: true, relatedServiceIds: [], relatedConditionIds: [], needsReview: false,
    };
  }
  return { ...base, excerpt: '' };
}

export function toForm(type, item) {
  const form = emptyForm(type);
  Object.keys(form).forEach((k) => {
    if (item[k] !== undefined && item[k] !== null) form[k] = item[k];
  });
  form.blocks = type.blocksField ? (item[type.blocksField] || []).map((b) => ({ uid: uid(), type: b.type, data: b.data })) : [];
  if (form.sections) form.sections = form.sections.map((s) => ({ ...s, id: s.id || uid(), imageUrl: s.imageUrl || '', imageAlt: s.imageAlt || '', faqs: s.faqs || [], relatedServiceIds: s.relatedServiceIds || [] }));
  if (type.kind === 'blog') form.publishedAt = item.publishedAt ? item.publishedAt.slice(0, 10) : '';
  return form;
}

export function toPayload(type, form) {
  const { blocks, ...rest } = form;
  if (!type.blocksField) return rest;
  const payload = { ...rest, [type.blocksField]: blocks.map(({ type: t, data }) => ({ type: t, data })) };
  if (type.kind === 'blog') payload.publishedAt = form.publishedAt || null;
  return payload;
}
