'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Eye, Save, Send, EyeOff, Archive, AlertTriangle } from 'lucide-react';
import { CONTENT_TYPES, emptyForm, toForm, toPayload } from '@/lib/contentTypes';
import { contentSlices } from '@/store/slices/contentSlices';
import { slugify } from '@/lib/utils';
import { useToast } from './Toast';
import { ErrorState, Field, LoadingState, Spinner, StatusBadge } from './ui';
import BlockEditor from './editor/BlockEditor';
import ImageField from './editor/ImageField';
import FaqEditor from './editor/FaqEditor';
import SectionsEditor from './editor/SectionsEditor';
import CaseStudyFields from './editor/CaseStudyFields';
import { Toggle } from './ui';
import EditorSidebar from './EditorSidebar';

const Section = ({ title, children, testId }) => (
  <section className="card p-6" data-testid={testId}>
    <h2 className="mb-5 text-lg font-semibold">{title}</h2>
    <div className="space-y-5">{children}</div>
  </section>
);

export default function ContentEditorPage({ typeKey, id }) {
  const type = CONTENT_TYPES[typeKey];
  const { actions } = contentSlices[typeKey];
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useToast();
  const { current, currentStatus, currentError, saving } = useSelector((s) => s[typeKey]);
  const isNew = !id;
  const [form, setForm] = useState(() => emptyForm(type));
  const [slugTouched, setSlugTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const loaded = !isNew && current && String(current.id) === String(id);

  useEffect(() => {
    if (isNew) dispatch(actions.clearCurrent());
    else dispatch(actions.fetchOne(id));
  }, [id, isNew, dispatch, actions]);

  useEffect(() => {
    if (loaded) {
      setForm(toForm(type, current));
      setDirty(false);
    }
  }, [loaded, current?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };
  // Slug follows the title automatically (create and edit) unless the admin edits it by hand.
  const onTitle = (title) => set({ title, ...(!slugTouched ? { slug: slugify(title) } : {}) });

  const save = async () => {
    if (type.sections && form.sections.some((s) => !s.heading.trim())) {
      toast('Every condition section needs a heading', 'error');
      return null;
    }
    const r = await dispatch(actions.saveItem({ id: loaded ? current.id : null, body: toPayload(type, form) }));
    if (r.error) {
      toast(r.payload?.message || 'Save failed', 'error');
      return null;
    }
    setDirty(false);
    if (loaded && current.status === 'PUBLISHED' && current.slug !== r.payload.slug) toast(`Saved. 301 redirect created from ${type.publicPrefix}${current.slug}`);
    else toast('Saved');
    if (isNew) router.replace(`${type.adminPath}/${r.payload.id}`);
    return r.payload;
  };

  const transition = async (action) => {
    setBusy(true);
    const saved = dirty || isNew ? await save() : current;
    if (saved) {
      const r = await dispatch(actions.changeStatus({ id: saved.id, action }));
      if (r.error) toast(r.payload?.message, 'error');
      else toast(action === 'publish' ? 'Published' : action === 'archive' ? 'Archived' : 'Moved to draft');
    }
    setBusy(false);
  };

  if (!isNew && currentStatus === 'failed') return <ErrorState message={currentError} onRetry={() => dispatch(actions.fetchOne(id))} />;
  if (!isNew && !loaded) return <LoadingState />;

  const status = loaded ? current.status : 'DRAFT';
  const slugChanged = loaded && current.status === 'PUBLISHED' && form.slug !== current.slug;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={type.adminPath} className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal" data-testid="editor-back-link"><ArrowLeft className="h-4 w-4" /> {type.plural}</Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">{isNew ? `New ${type.label.toLowerCase()}` : `Edit ${type.label.toLowerCase()}`}</h1>
            <StatusBadge status={status} testId="editor-status-badge" />
            {dirty && <span className="text-xs text-amber-600" data-testid="unsaved-indicator">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {loaded && <Link href={`/admin/preview/${typeKey}/${current.id}`} target="_blank" className="btn-secondary" data-testid="editor-preview-button"><Eye className="h-4 w-4" /> Preview</Link>}
          <button type="button" className="btn-secondary" onClick={save} disabled={saving || busy} data-testid="editor-save-button">{saving ? <Spinner /> : <Save className="h-4 w-4" />} {status === 'PUBLISHED' ? 'Save changes' : 'Save draft'}</button>
          {loaded && status !== 'ARCHIVED' && <button type="button" className="btn-ghost" onClick={() => transition('archive')} disabled={busy} data-testid="editor-archive-button"><Archive className="h-4 w-4" /> Archive</button>}
          {status === 'PUBLISHED'
            ? <button type="button" className="btn-navy" onClick={() => transition('unpublish')} disabled={busy} data-testid="editor-unpublish-button"><EyeOff className="h-4 w-4" /> Unpublish</button>
            : <button type="button" className="btn-primary" onClick={() => transition('publish')} disabled={busy} data-testid="editor-publish-button">{busy ? <Spinner /> : <Send className="h-4 w-4" />} Publish</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Basics" testId="editor-basics">
            <Field label="Title" htmlFor="title">
              <input id="title" className="input text-base" value={form.title} onChange={(e) => onTitle(e.target.value)} data-testid="editor-title-input" />
            </Field>
            <Field label="Slug" htmlFor="slug" hint={`Generated from the title. URL: ${type.publicPrefix}${form.slug || '…'}`}>
              <input id="slug" className="input font-mono text-xs" value={form.slug} onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }); }}
                onBlur={() => set({ slug: slugify(form.slug) })} data-testid="editor-slug-input" />
            </Field>
            {slugChanged && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800" data-testid="slug-redirect-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" /> This item is live. Saving will create a 301 redirect from {type.publicPrefix}{current.slug} to {type.publicPrefix}{form.slug}.
              </p>
            )}
            {type.kind === 'service' && (
              <Field label="Short description" htmlFor="shortDescription">
                <textarea id="shortDescription" className="input min-h-[90px]" value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} data-testid="editor-short-description-input" />
              </Field>
            )}
            {type.kind === 'case' && (
              <Field label="Short summary" htmlFor="summary" hint="Required. Brief and non-identifying.">
                <textarea id="summary" className="input min-h-[90px]" value={form.summary} onChange={(e) => set({ summary: e.target.value })} data-testid="editor-summary-input" />
              </Field>
            )}
            {(type.kind === 'service' || type.kind === 'case') && (
              <div className="flex flex-wrap items-end gap-6">
                {type.kind === 'service' && (
                  <Field label="Target keyword (optional)" htmlFor="targetKeyword"><input id="targetKeyword" className="input" value={form.targetKeyword || ''} onChange={(e) => set({ targetKeyword: e.target.value })} data-testid="editor-keyword-input" /></Field>
                )}
                <Toggle label="Needs client review" checked={!!form.needsReview} onChange={(v) => set({ needsReview: v })} testId="editor-needs-review-toggle" />
              </div>
            )}
            {type.kind === 'page' && (
              <Field label="Excerpt" htmlFor="excerpt" hint="Shown in listings and used as the default meta description.">
                <textarea id="excerpt" className="input min-h-[80px]" value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} data-testid="editor-excerpt-input" />
              </Field>
            )}
            {type.kind === 'blog' && (
              <Field label="Introduction" htmlFor="introduction">
                <textarea id="introduction" className="input min-h-[110px]" value={form.introduction} onChange={(e) => set({ introduction: e.target.value })} data-testid="editor-introduction-input" />
              </Field>
            )}
          </Section>

          <Section title={type.kind === 'service' ? 'Featured image / icon' : 'Featured image'} testId="editor-featured-image">
            <ImageField folder={type.folder} showCaption={type.kind === 'blog'} testId="featured-image"
              value={{ url: form.featuredImageUrl, alt: form.featuredImageAlt, caption: form.featuredImageCaption }}
              onChange={(v) => set({ featuredImageUrl: v.url, featuredImageAlt: v.alt, ...(type.kind === 'blog' ? { featuredImageCaption: v.caption } : {}) })} />
            {type.kind === 'service' && (
              <Field label="Icon name (optional)" htmlFor="iconName" hint="A Lucide icon name for the public site, e.g. hand, activity, dumbbell.">
                <input id="iconName" className="input" value={form.iconName} onChange={(e) => set({ iconName: e.target.value })} data-testid="editor-icon-input" />
              </Field>
            )}
          </Section>

          {type.kind === 'case' ? (
            <Section title="Case study" testId="editor-case"><CaseStudyFields form={form} set={set} /></Section>
          ) : (
            <Section title={type.sections ? 'Introduction content (optional)' : 'Content'} testId="editor-content">
              <BlockEditor blocks={form.blocks} onChange={(blocks) => set({ blocks })} folder={type.folder} />
            </Section>
          )}
          {type.sections && (
            <Section title="Condition sections" testId="editor-sections"><SectionsEditor sections={form.sections} onChange={(sections) => set({ sections })} /></Section>
          )}

          {type.kind === 'service' && (
            <>
              <Section title="FAQs" testId="editor-faqs"><FaqEditor faqs={form.faqs} onChange={(faqs) => set({ faqs })} /></Section>
              <Section title="Call to action" testId="editor-cta">
                <Field label="CTA heading" htmlFor="ctaHeading"><input id="ctaHeading" className="input" value={form.ctaHeading} onChange={(e) => set({ ctaHeading: e.target.value })} data-testid="editor-cta-heading-input" /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Button label" htmlFor="ctaLabel"><input id="ctaLabel" className="input" value={form.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} data-testid="editor-cta-label-input" /></Field>
                  <Field label="Button URL" htmlFor="ctaUrl"><input id="ctaUrl" className="input" value={form.ctaUrl} onChange={(e) => set({ ctaUrl: e.target.value })} data-testid="editor-cta-url-input" /></Field>
                </div>
              </Section>
            </>
          )}
        </div>
        <EditorSidebar type={type} form={form} set={set} item={loaded ? current : null} />
      </div>
    </div>
  );
}
