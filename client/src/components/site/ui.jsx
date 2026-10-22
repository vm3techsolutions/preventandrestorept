import Link from 'next/link';
import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import { SITE } from '@/lib/site';
import { absUrl, jsonLd } from '@/lib/seo';

// Concentric arcs echoing the shield mark in the logo.
export function ArcMotif({ className = '' }) {
  return (
    <svg viewBox="0 0 600 600" fill="none" aria-hidden className={`pointer-events-none absolute ${className}`}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M ${60 + i * 48} 600 C ${60 + i * 48} ${330 - i * 20}, ${250 + i * 20} ${120 + i * 30}, 600 ${70 + i * 52}`} stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = 'left', light = false, id }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className={`eyebrow ${light ? 'text-teal-100' : 'text-teal'}`}>{eyebrow}</p>}
      <h2 id={id} className={`display mt-3 text-2xl sm:text-3xl lg:text-4xl ${light ? 'text-white' : 'text-navy'}`}>{title}</h2>
      {intro && <p className={`mt-4 text-base md:text-lg ${light ? 'text-slate-300' : 'text-slate-600'}`}>{intro}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: absUrl(it.href) })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-sm" data-testid="breadcrumbs">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-slate-300">
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />}
            {i === items.length - 1
              ? <span aria-current="page" className="line-clamp-1 text-white">{it.label}</span>
              : <Link href={it.href} className="hover:text-white">{it.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ eyebrow, title, intro, crumbs, children, testId = 'page-hero' }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white" data-testid={testId}>
      <ArcMotif className="-right-24 -top-10 h-[520px] w-[520px] text-white/[0.05]" />
      <div className="container-site relative py-16 sm:py-20 lg:py-24">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow mt-8 text-teal-100">{eyebrow}</p>}
        <h1 className="display mt-4 max-w-4xl text-4xl text-white sm:text-5xl lg:text-6xl" data-testid="page-title">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-base text-slate-300 md:text-lg">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function CtaBand({ heading = 'Want to get relief faster?', text = 'Choose which option works best for you.', label = 'Request Appointment', url = SITE.appointmentHref }) {
  return (
    <section className="bg-white py-20" data-testid="cta-band">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-3xl bg-teal px-6 py-14 text-white sm:px-12 lg:px-16">
          <ArcMotif className="-bottom-40 -right-20 h-[520px] w-[520px] text-white/10" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="display text-3xl text-white sm:text-4xl">{heading}</h2>
              {text && <p className="mt-4 max-w-xl text-base text-teal-50 md:text-lg">{text}</p>}
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href={url} className="btn-site-light" data-testid="cta-band-primary">{label} <ArrowRight className="h-4 w-4" /></Link>
              <a href={SITE.phoneHref} className="btn-site-ghost-light" data-testid="cta-band-phone"><Phone className="h-4 w-4" /> Speak With A PT</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({ title, text, testId = 'empty-state' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center" data-testid={testId}>
      <p className="font-heading text-lg font-semibold text-navy">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-slate-600">{text}</p>}
    </div>
  );
}

export function MoreLink({ href, children, testId, light }) {
  return (
    <Link href={href} data-testid={testId} className={`group inline-flex items-center gap-2 font-medium ${light ? 'text-white' : 'text-teal hover:text-teal-hover'}`}>
      {children} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
