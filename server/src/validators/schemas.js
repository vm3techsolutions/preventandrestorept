const { z } = require('zod');

const str = (max) => z.string().max(max);
const SAFE_URL = /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i;
const safeUrl = (max) => z.string().trim().max(max).refine((v) => !v || SAFE_URL.test(v), 'URL must start with https://, http://, /, mailto: or tel:');
const optStr = (max) => z.string().max(max).optional().nullable().transform((v) => (v === undefined || v === null || v.trim() === '' ? null : v.trim()));
const urlOrPath = optStr(2000).refine((v) => !v || /^(https?:\/\/|\/(?!\/))/i.test(v) || /^(mailto|tel):/i.test(v), 'Must be a URL or a path starting with /');
const absUrl = optStr(2000).refine((v) => !v || /^https?:\/\//i.test(v), 'Canonical URL must be an absolute http(s) URL');
const ids = z.array(z.coerce.number().int().positive()).max(200).default([]);

const block = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), data: z.object({ level: z.coerce.number().int().min(2).max(3), text: str(300) }) }),
  z.object({ type: z.literal('paragraph'), data: z.object({ html: str(20000) }) }),
  z.object({ type: z.literal('list'), data: z.object({ style: z.enum(['ordered', 'unordered']), items: z.array(str(5000)).max(200) }) }),
  z.object({ type: z.literal('image'), data: z.object({ url: safeUrl(2000), alt: str(300).default(''), caption: str(500).default('') }) }),
  z.object({ type: z.literal('quote'), data: z.object({ text: str(3000), cite: str(300).default('') }) }),
  z.object({
    type: z.literal('cta'),
    data: z.object({ heading: str(300).default(''), text: str(2000).default(''), buttonLabel: str(120), buttonUrl: safeUrl(2000) }),
  }),
  z.object({ type: z.literal('disclaimer'), data: z.object({ text: str(3000) }) }),
]);
const blocks = z.array(block).max(500).default([]);

const seo = {
  seoTitle: optStr(200),
  metaDescription: optStr(500),
  canonicalUrl: absUrl,
  noindex: z.boolean().default(false),
};

const base = { title: z.string().trim().min(1, 'Title is required').max(250), slug: optStr(200) };

const blogSchema = z.object({
  ...base,
  ...seo,
  excerpt: optStr(1000),
  introduction: optStr(10000),
  authorId: z.coerce.number().int().positive().nullable().optional(),
  publishedAt: z.union([z.string().datetime({ offset: true }), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).nullable().optional(),
  featuredImageUrl: urlOrPath,
  featuredImageAlt: optStr(300),
  featuredImageCaption: optStr(500),
  targetKeyword: optStr(120),
  categoryIds: ids,
  tagIds: ids,
  relatedBlogIds: ids,
  blocks,
});

const faq = z.object({ question: z.string().trim().min(1).max(500), answer: z.string().trim().min(1).max(5000) });
const serviceLike = {
  ...base,
  ...seo,
  shortDescription: optStr(2000),
  content: blocks,
  featuredImageUrl: urlOrPath,
  featuredImageAlt: optStr(300),
  iconName: optStr(60),
  faqs: z.array(faq).max(50).default([]),
  ctaHeading: optStr(200),
  ctaLabel: optStr(120),
  ctaUrl: urlOrPath,
  relatedIds: ids,
};
const serviceSchema = z.object(serviceLike);

const pageSchema = z.object({
  ...base,
  ...seo,
  excerpt: optStr(1000),
  content: blocks,
  featuredImageUrl: urlOrPath,
  featuredImageAlt: optStr(300),
});

const taxonomySchema = z.object({ name: z.string().trim().min(1).max(120), slug: optStr(120), description: optStr(1000) });
const authorSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: optStr(120),
  credentials: optStr(200),
  bio: optStr(5000),
  avatarUrl: urlOrPath,
});
const redirectSchema = z.object({
  fromPath: z.string().trim().min(1).max(1000),
  toPath: z.string().trim().min(1).max(2000),
  statusCode: z.coerce.number().int().refine((v) => [301, 302, 307, 308].includes(v), 'Status must be 301, 302, 307 or 308').default(301),
  isActive: z.boolean().default(true),
  note: optStr(500),
});
const reorderSchema = z.object({ ids: z.array(z.coerce.number().int().positive()).min(1).max(500) });

const password = z.string().min(10, 'Password must be at least 10 characters').max(200)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Password must include letters and numbers');
const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });
const setupSchema = z.object({ token: z.string().trim().min(10).max(200), email: z.string().trim().toLowerCase().email(), name: optStr(120), password });
const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: password });
const adminCreateSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password,
});
const adminStatusSchema = z.object({ isActive: z.boolean() });
const settingsSchema = z.object({ siteName: z.string().trim().min(1).max(120), defaultMetaDescription: z.string().max(500).default(''), defaultOgImage: z.string().max(2000).default('') });

module.exports = {
  blogSchema, serviceSchema, pageSchema, taxonomySchema, authorSchema, redirectSchema, reorderSchema,
  loginSchema, setupSchema, changePasswordSchema, settingsSchema, adminCreateSchema, adminStatusSchema,
};
