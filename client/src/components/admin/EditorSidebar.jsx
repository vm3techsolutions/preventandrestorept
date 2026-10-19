'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '@/lib/api';
import { taxonomySlices } from '@/store/slices/taxonomySlices';
import { formatDate } from '@/lib/utils';
import { Field } from './ui';
import MultiSelect from './editor/MultiSelect';
import SeoPanel from './editor/SeoPanel';

const Panel = ({ title, children, testId }) => (
  <div className="card space-y-4 p-5" data-testid={testId}>
    <h3 className="text-base font-semibold">{title}</h3>
    {children}
  </div>
);

function useRelatedOptions(resource, selfId) {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (!resource) return;
    api.content(resource).list({ limit: 100, sort: 'title' })
      .then((r) => setOptions(r.data.filter((x) => x.id !== selfId).map((x) => ({ id: x.id, label: x.status === 'PUBLISHED' ? x.title : `${x.title} (${x.status.toLowerCase()})` }))))
      .catch(() => setOptions([]));
  }, [resource, selfId]);
  return options;
}

export default function EditorSidebar({ type, form, set, item }) {
  const dispatch = useDispatch();
  const isBlog = type.kind === 'blog';
  const categories = useSelector((s) => s.categories.items);
  const tags = useSelector((s) => s.tags.items);
  const authors = useSelector((s) => s.authors.items);
  const [siteName, setSiteName] = useState('Prevent & Restore Physical Therapy');
  const related = useRelatedOptions(isBlog ? 'blogs' : type.relatedResource, item?.id);

  useEffect(() => {
    if (isBlog) Object.values(taxonomySlices).forEach((s) => dispatch(s.actions.fetchAll()));
    api.public.settings().then((r) => setSiteName(r.data.siteName)).catch(() => {});
  }, [isBlog, dispatch]);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
      <Panel title="Publishing" testId="publishing-panel">
        {isBlog && (
          <>
            <Field label="Author" htmlFor="author">
              <select id="author" className="input" value={form.authorId || ''} onChange={(e) => set({ authorId: e.target.value ? Number(e.target.value) : null })} data-testid="editor-author-select">
                <option value="">No author</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Publication date" htmlFor="publishedAt" hint="Set automatically on first publish. A future date schedules the post.">
              <input id="publishedAt" type="date" className="input" value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} data-testid="editor-published-date-input" />
            </Field>
          </>
        )}
        {item && (
          <dl className="space-y-1.5 text-xs text-slate-500" data-testid="editor-timestamps">
            <div className="flex justify-between"><dt>Created</dt><dd>{formatDate(item.createdAt)}</dd></div>
            <div className="flex justify-between"><dt>Updated</dt><dd>{formatDate(item.updatedAt)}</dd></div>
            {!isBlog && <div className="flex justify-between"><dt>First published</dt><dd>{formatDate(item.publishedAt)}</dd></div>}
          </dl>
        )}
      </Panel>
      {isBlog && (
        <Panel title="Organize" testId="organize-panel">
          <Field label="Categories"><MultiSelect options={categories.map((c) => ({ id: c.id, label: c.name }))} value={form.categoryIds} onChange={(v) => set({ categoryIds: v })} testId="editor-categories" /></Field>
          <Field label="Tags"><MultiSelect options={tags.map((t) => ({ id: t.id, label: t.name }))} value={form.tagIds} onChange={(v) => set({ tagIds: v })} testId="editor-tags" emptyText="No tags yet. Create them under Tags." /></Field>
          <Field label="Related articles"><MultiSelect options={related} value={form.relatedBlogIds} onChange={(v) => set({ relatedBlogIds: v })} testId="editor-related-blogs" /></Field>
        </Panel>
      )}
      {type.kind === 'service' && (
        <Panel title={type.relatedLabel} testId="related-panel">
          <MultiSelect options={related} value={form.relatedIds} onChange={(v) => set({ relatedIds: v })} testId="editor-related" />
        </Panel>
      )}
      <Panel title="SEO" testId="seo-panel-card"><SeoPanel form={form} set={set} type={type} siteName={siteName} /></Panel>
    </aside>
  );
}
