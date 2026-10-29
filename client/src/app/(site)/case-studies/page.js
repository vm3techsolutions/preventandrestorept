import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SmartImage from '@/components/site/SmartImage';
import { CtaBand, EmptyState, PageHero } from '@/components/site/ui';
import { listSafe } from '@/lib/siteData';
import { staticMetadata, withSlash } from '@/lib/seo';

export const revalidate = 60;

export const metadata = staticMetadata({
  title: 'Case Studies | Prevent & Restore Physical Therapy',
  description: 'Non-identifying case studies showing how Prevent & Restore Physical Therapy assesses, plans and progresses care.',
  path: '/case-studies/',
});

function CaseCard({ c }) {
  return (
    <Link href={withSlash(c.path)} className="card-site group flex flex-col overflow-hidden" data-testid={`case-card-${c.slug}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        <SmartImage src={c.featuredImage?.url || '/images/stock/assess.webp'} alt={c.featuredImage?.alt || ''} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-7">
        {c.primaryConcern && <p className="eyebrow text-teal">{c.primaryConcern}</p>}
        <h2 className="mt-3 font-heading text-xl font-semibold text-navy">{c.title}</h2>
        <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">{c.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-teal">Read More <ArrowUpRight className="h-4 w-4" aria-hidden /></span>
      </div>
    </Link>
  );
}

export default async function CaseStudiesPage() {
  const { data } = await listSafe('caseStudies', { limit: 50 });
  return (
    <>
      <PageHero eyebrow="Case studies" title="Case studies" intro="How we assess, plan and progress care, shared without identifying details." crumbs={[{ label: 'Home', href: '/' }, { label: 'Case Studies', href: '/case-studies/' }]} />
      <section className="container-site py-16 lg:py-20" data-testid="case-studies-list">
        {data.length
          ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((c) => <CaseCard key={c.slug} c={c} />)}</div>
          : <EmptyState title="Case studies coming soon" text="Check back soon to read about our approach to care." testId="case-studies-empty" />}
      </section>
      <CtaBand />
    </>
  );
}
