'use client';

import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function SiteError({ reset }) {
  return (
    <section className="container-site py-28" data-testid="site-error">
      <p className="eyebrow text-teal">Something went wrong</p>
      <h1 className="display mt-4 text-3xl text-navy sm:text-4xl">We could not load this page</h1>
      <p className="mt-4 max-w-xl text-slate-600">Please try again in a moment. If you need help right away, call us at <a href={SITE.phoneHref} className="font-medium text-teal">{SITE.phone}</a>.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-site" data-testid="site-error-retry">Try again</button>
        <Link href="/" className="btn-site-outline">Back to home</Link>
      </div>
    </section>
  );
}
