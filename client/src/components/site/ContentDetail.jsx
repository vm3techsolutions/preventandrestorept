import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import BlockRenderer from '@/components/content/BlockRenderer';
import FaqList from './FaqList';
import RegionSections, { RegionAnchors } from './RegionSections';
import { CtaBand, PageHero } from './ui';
import { SITE } from '@/lib/site';
import { withSlash } from '@/lib/seo';
import { SERVICE_STOCK, stockFor } from '@/lib/stockImages';

function RelatedList({ title, items, testId }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6" data-testid={testId}>
      <p className="eyebrow text-teal">{title}</p>
      <ul className="mt-4 space-y-1">
        {items.map((r) => (
          <li key={r.slug}>
            <Link href={withSlash(r.path)} className="group flex items-center justify-between rounded-lg px-3 py-2.5 font-medium text-navy hover:bg-teal-50 hover:text-teal">
              {r.title} <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppointmentCard() {
  return (
    <div className="rounded-2xl bg-navy p-6 text-white">
      <p className="font-heading text-lg font-semibold text-white">Ready to get started?</p>
      <p className="mt-2 text-sm text-slate-300">Book a one-on-one visit with a Doctor of Physical Therapy.</p>
      <Link href={SITE.appointmentHref} className="btn-site mt-5 w-full justify-center" data-testid="sidebar-appointment-btn">Request Appointment</Link>
      <a href={SITE.phoneHref} className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-teal-100 hover:text-white"><Phone className="h-4 w-4" /> {SITE.phone}</a>
    </div>
  );
}

// Shared detail layout for services and conditions.
export default function ContentDetail({ item, section, related, relatedTitle }) {
  return (
    <article className="bg-slate-50" data-testid={`${section.key}-detail`}>
      <PageHero eyebrow={section.label} title={item.title} intro={item.shortDescription} image={item.featuredImage?.url || stockFor(SERVICE_STOCK, item.slug)} crumbs={[{ label: 'Home', href: '/' }, { label: section.label, href: section.href }, { label: item.title, href: withSlash(item.path) }]}>
        <Link href={SITE.appointmentHref} className="btn-site mt-8" data-testid="detail-hero-cta">Request Appointment</Link>
      </PageHero>
      <div className="container-site grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-20">
        <div className="min-w-0 max-w-3xl">
          {item.sections?.length > 0 && <RegionAnchors sections={item.sections} />}
          {item.content?.length ? <div className={item.sections?.length ? 'mt-10' : ''}><BlockRenderer blocks={item.content} /></div> : !item.sections?.length && <p className="text-slate-600">{item.shortDescription}</p>}
          <RegionSections sections={item.sections} />
          <FaqList faqs={item.faqs} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <RelatedList title={relatedTitle} items={related} testId="related-links" />
          <AppointmentCard />
        </aside>
      </div>
      <CtaBand heading={item.cta?.heading || undefined} label={item.cta?.label || undefined} url={item.cta?.url ? withSlash(item.cta.url) : undefined} />
    </article>
  );
}
