'use client';

import Link from 'next/link';
import { CONTENT_TYPES } from '@/lib/contentTypes';

export const ACTIONS = {
  create: 'Created', update: 'Updated', publish: 'Published', unpublish: 'Unpublished', archive: 'Archived', delete: 'Deleted',
  restore: 'Restored', reorder: 'Reordered', upload: 'Uploaded', activate: 'Activated', deactivate: 'Deactivated',
  reset_password: 'Reset password', change_password: 'Changed own password',
};
export const TYPES = {
  blogs: 'Blog', services: 'Service', conditions: 'Condition', pages: 'Page', categories: 'Category', tags: 'Tag',
  authors: 'Author', redirects: 'Redirect', media: 'Media', settings: 'Settings', admins: 'Admin', reviews: 'Review',
};
const FIELDS = {
  authorId: 'author', publishedAt: 'publication date', featuredImageUrl: 'featured image', featuredImageAlt: 'image alt text',
  featuredImageCaption: 'image caption', seoTitle: 'SEO title', metaDescription: 'meta description', targetKeyword: 'target keyword',
  canonicalUrl: 'canonical URL', categoryIds: 'categories', tagIds: 'tags', relatedBlogIds: 'related articles', blocks: 'content',
  shortDescription: 'short description', iconName: 'icon', faqs: 'FAQs', ctaHeading: 'CTA heading', ctaLabel: 'CTA label', ctaUrl: 'CTA URL',
  relatedIds: 'related items', fromPath: 'old path', toPath: 'destination', statusCode: 'status code', isActive: 'active', siteName: 'site name',
  defaultMetaDescription: 'default meta description', defaultOgImage: 'default social image', avatarUrl: 'avatar',
};
const TONE = { delete: 'bg-rose-50 text-rose-700', deactivate: 'bg-rose-50 text-rose-700', publish: 'bg-emerald-50 text-emerald-700', create: 'bg-teal-50 text-teal' };

export function ActionBadge({ action, testId }) {
  return <span data-testid={testId} className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TONE[action] || 'bg-slate-100 text-navy'}`}>{ACTIONS[action] || action}</span>;
}

export function ActivityDetails({ log }) {
  const d = log.details || {};
  const parts = [];
  if (d.changed) parts.push(d.changed.length ? `Changed: ${d.changed.map((f) => FIELDS[f] || f).join(', ')}` : 'No field changes');
  if (d.slug) parts.push(`URL: ${d.slug.from} \u2192 ${d.slug.to}`);
  if (d.from && d.to) parts.push(`Status: ${d.from.toLowerCase()} \u2192 ${d.to.toLowerCase()}`);
  if (d.count) parts.push(`${d.count} items reordered`);
  if (d.folder) parts.push(`Folder: ${d.folder}`);
  return <span className="text-xs text-slate-600">{parts.join(' \u00b7 ') || '\u2014'}</span>;
}

export function ActivityItem({ log }) {
  const type = Object.values(CONTENT_TYPES).find((t) => t.key === log.entityType);
  const label = log.entityLabel || (log.entityType === 'settings' ? 'Settings' : '\u2014');
  return (
    <div>
      <span className="block text-[11px] uppercase tracking-wider text-slate-500">{TYPES[log.entityType] || log.entityType}</span>
      {type && log.entityId && log.action !== 'delete'
        ? <Link href={`${type.adminPath}/${log.entityId}`} className="line-clamp-1 font-medium text-navy hover:text-teal" data-testid={`activity-${log.id}-link`}>{label}</Link>
        : <span className="line-clamp-1 font-medium text-navy">{label}</span>}
    </div>
  );
}
