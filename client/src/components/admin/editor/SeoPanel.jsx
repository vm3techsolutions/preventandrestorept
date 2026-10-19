'use client';

import { Field, Toggle } from '../ui';

const Counter = ({ value, max }) => (
  <span className={`text-[11px] ${value.length > max ? 'text-amber-600' : 'text-slate-400'}`}>{value.length}/{max}</span>
);

export default function SeoPanel({ form, set, type, siteName }) {
  const title = form.seoTitle || `${form.title || 'Untitled'} | ${siteName}`;
  const description = form.metaDescription || form.excerpt || form.shortDescription || form.introduction || '';
  return (
    <div className="space-y-4" data-testid="seo-panel">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" data-testid="seo-snippet-preview">
        <p className="truncate text-xs text-emerald-700">{type.publicPrefix}{form.slug || 'your-slug'}</p>
        <p className="mt-0.5 line-clamp-1 text-[15px] text-[#1a0dab]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{description.replace(/<[^>]+>/g, '') || 'Meta description will fall back to the excerpt.'}</p>
      </div>
      <Field label="SEO title" htmlFor="seoTitle" right={<Counter value={form.seoTitle} max={60} />} hint="Leave blank to use the title.">
        <input id="seoTitle" className="input" value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} data-testid="seo-title-input" />
      </Field>
      <Field label="Meta description" htmlFor="metaDescription" right={<Counter value={form.metaDescription} max={160} />}>
        <textarea id="metaDescription" className="input min-h-[80px]" value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} data-testid="seo-meta-description-input" />
      </Field>
      {type.kind === 'blog' && (
        <Field label="Target keyword" htmlFor="targetKeyword" hint="Optional, for editorial reference.">
          <input id="targetKeyword" className="input" value={form.targetKeyword} onChange={(e) => set({ targetKeyword: e.target.value })} data-testid="seo-keyword-input" />
        </Field>
      )}
      <Field label="Canonical URL" htmlFor="canonicalUrl" hint="Leave blank for a self-referencing canonical.">
        <input id="canonicalUrl" className="input" placeholder="https://…" value={form.canonicalUrl} onChange={(e) => set({ canonicalUrl: e.target.value })} data-testid="seo-canonical-input" />
      </Field>
      <Toggle label="Hide from search engines (noindex)" checked={form.noindex} onChange={(v) => set({ noindex: v })} testId="seo-noindex-toggle" />
      {form.noindex && <p className="text-xs text-amber-700">Excluded from the sitemap and public listings.</p>}
    </div>
  );
}
