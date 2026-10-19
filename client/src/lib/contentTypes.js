import { uid } from './utils';

export const CONTENT_TYPES = {
  blogs: { key: 'blogs', kind: 'blog', label: 'Blog', plural: 'Blogs', adminPath: '/admin/blogs', publicPrefix: '/blog/', folder: 'blogs', blocksField: 'blocks' },
  services: {
    key: 'services', kind: 'service', label: 'Service', plural: 'Services', adminPath: '/admin/services', publicPrefix: '/services/', folder: 'services',
    blocksField: 'content', relatedLabel: 'Related conditions', relatedResource: 'conditions',
  },
  conditions: {
    key: 'conditions', kind: 'service', label: 'Condition', plural: 'What We Treat', adminPath: '/admin/what-we-treat', publicPrefix: '/what-we-treat/', folder: 'treatments',
    blocksField: 'content', relatedLabel: 'Related services', relatedResource: 'services',
  },
  pages: { key: 'pages', kind: 'page', label: 'Page', plural: 'Pages', adminPath: '/admin/pages', publicPrefix: '/', folder: 'pages', blocksField: 'content' },
};

const SEO = { seoTitle: '', metaDescription: '', canonicalUrl: '', noindex: false };

export function emptyForm(type) {
  const base = { title: '', slug: '', featuredImageUrl: '', featuredImageAlt: '', blocks: [], ...SEO };
  if (type.kind === 'blog') {
    return { ...base, excerpt: '', introduction: '', authorId: null, publishedAt: '', featuredImageCaption: '', targetKeyword: '', categoryIds: [], tagIds: [], relatedBlogIds: [] };
  }
  if (type.kind === 'service') return { ...base, shortDescription: '', iconName: '', faqs: [], ctaHeading: '', ctaLabel: '', ctaUrl: '', relatedIds: [] };
  return { ...base, excerpt: '' };
}

export function toForm(type, item) {
  const form = emptyForm(type);
  Object.keys(form).forEach((k) => {
    if (item[k] !== undefined && item[k] !== null) form[k] = item[k];
  });
  form.blocks = (item[type.blocksField] || []).map((b) => ({ uid: uid(), type: b.type, data: b.data }));
  if (type.kind === 'blog') form.publishedAt = item.publishedAt ? item.publishedAt.slice(0, 10) : '';
  return form;
}

export function toPayload(type, form) {
  const { blocks, ...rest } = form;
  const payload = { ...rest, [type.blocksField]: blocks.map(({ type: t, data }) => ({ type: t, data })) };
  if (type.kind === 'blog') payload.publishedAt = form.publishedAt || null;
  return payload;
}
