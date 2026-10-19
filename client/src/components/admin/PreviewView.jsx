'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, mediaUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import BlockRenderer from '@/components/content/BlockRenderer';
import { ErrorState, LoadingState, StatusBadge } from './ui';

export default function PreviewView({ type, id }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    api.content(type).preview(id)
      .then((r) => setState({ status: 'ok', data: r.data }))
      .catch((e) => setState({ status: 'error', message: e.status === 401 ? 'Please sign in to preview content.' : e.message }));
  }, [type, id]);

  if (state.status === 'loading') return <LoadingState label="Loading preview…" />;
  if (state.status === 'error') {
    return (
      <div className="py-16">
        <ErrorState message={state.message} />
        <p className="text-center"><Link href="/admin/login" className="text-teal underline" data-testid="preview-login-link">Sign in</Link></p>
      </div>
    );
  }
  const d = state.data;
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-navy px-6 py-3 text-sm text-white" data-testid="preview-banner">
        <span className="flex items-center gap-3">Preview <StatusBadge status={d.status} testId="preview-status" /> <span className="font-mono text-xs text-slate-300">{d.path}</span></span>
        <span className="text-xs text-slate-300">SEO title: {d.seo?.title} · {d.seo?.robots}</span>
      </div>
      <article className="mx-auto max-w-3xl px-6 py-14" data-testid="preview-article">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl" data-testid="preview-title">{d.title}</h1>
        {d.author && <p className="mt-4 text-sm text-slate-500">By {d.author.name}{d.author.credentials ? `, ${d.author.credentials}` : ''} · {formatDate(d.publishedAt)}</p>}
        {d.featuredImage?.url && (
          <figure className="mt-8">
            <img src={mediaUrl(d.featuredImage.url)} alt={d.featuredImage.alt} className="w-full rounded-2xl object-cover" />
            {d.featuredImage.caption && <figcaption className="mt-2 text-sm text-slate-500">{d.featuredImage.caption}</figcaption>}
          </figure>
        )}
        {(d.introduction || d.shortDescription || d.excerpt) && <p className="mt-8 text-lg leading-relaxed text-navy">{d.introduction || d.shortDescription || d.excerpt}</p>}
        <div className="mt-8"><BlockRenderer blocks={d.blocks || d.content} /></div>
        {d.faqs?.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
            <dl className="mt-4 divide-y divide-slate-200">{d.faqs.map((f, i) => <div key={i} className="py-4"><dt className="font-semibold text-navy">{f.question}</dt><dd className="mt-1 text-slate-600">{f.answer}</dd></div>)}</dl>
          </section>
        )}
        {d.cta && <div className="mt-12 rounded-2xl bg-teal p-8 text-white"><p className="font-heading text-2xl font-semibold text-white">{d.cta.heading}</p><a href={d.cta.url} className="btn-navy mt-4">{d.cta.label}</a></div>}
        {['related', 'relatedConditions', 'relatedServices'].map((k) => d[k]?.length > 0 && (
          <section key={k} className="mt-12"><h2 className="text-xl font-semibold">Related</h2><ul className="mt-3 space-y-1">{d[k].map((r) => <li key={r.slug} className="text-teal">{r.title}</li>)}</ul></section>
        ))}
      </article>
    </div>
  );
}
