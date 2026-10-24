import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import SmartImage from '../SmartImage';
import { BlogCard } from '../Cards';
import { EmptyState, MoreLink, SectionHeading } from '../ui';
import { withSlash } from '@/lib/seo';

// Stock photos (Unsplash/Pexels) shown only until a service has its own CMS image.
const STOCK = {
  'manual-therapy': '/images/stock/neck.webp',
  'functional-dry-needling': '/images/stock/knee-exam.webp',
  'blood-flow-restriction-therapy': '/images/stock/knee-device.webp',
  cupping: '/images/stock/stretch.webp',
  'functional-movement-screening': '/images/stock/assess.webp',
  'exercise-performance-and-programming': '/images/stock/barbell.webp',
  'pain-prevention-seminars': '/images/stock/rehab-gym.webp',
};
const FALLBACK = Object.values(STOCK);

function Head({ eyebrow, title, intro, href, label, testId }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
      <MoreLink href={href} testId={testId}>{label}</MoreLink>
    </div>
  );
}

function ServiceCard({ s, i }) {
  const img = s.featuredImage?.url || STOCK[s.slug] || FALLBACK[i % FALLBACK.length];
  return (
    <Link href={withSlash(s.path)} className="reveal card-site group flex flex-col overflow-hidden" data-testid={`service-card-${s.slug}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <SmartImage src={img} alt={s.featuredImage?.alt || ''} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-heading text-xl font-semibold text-navy">{s.title}</h3>
        {s.shortDescription && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">{s.shortDescription}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-teal group-hover:text-teal-hover">Learn more <ArrowUpRight className="h-4 w-4" aria-hidden /></span>
      </div>
    </Link>
  );
}

export function FeaturedServices({ items }) {
  return (
    <section className="bg-slate-50 py-20 lg:py-28" data-testid="home-services">
      <div className="container-site">
        <Head eyebrow="Our services" title="Treatment built around you" intro="Hands-on care and evidence-based training to help you move better and stay that way." href="/services/" label="View All Services" testId="home-all-services-link" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length ? items.map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />) : <div className="sm:col-span-2 lg:col-span-3"><EmptyState title="Services are being updated" text="Please check back soon or call us to learn more." /></div>}
        </div>
      </div>
    </section>
  );
}

// Titles only on the homepage; full content lives on the detail pages.
export function ConditionsSection({ items }) {
  if (!items.length) return null;
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-conditions">
      <div className="container-site">
        <Head eyebrow="What we treat" title="Conditions we help with" href="/what-we-treat/" label="View All Conditions" testId="home-all-conditions-link" />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.slug} className="reveal">
              <Link href={withSlash(c.path)} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-6 py-6 transition-[border-color,background-color] duration-300 hover:border-teal hover:bg-teal-50/60" data-testid={`condition-card-${c.slug}`}>
                <span className="font-heading text-lg font-semibold text-navy group-hover:text-teal">{c.title}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-navy transition-colors group-hover:bg-teal group-hover:text-white"><ArrowRight className="h-4 w-4" aria-hidden /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LatestBlogs({ items }) {
  if (!items.length) return null;
  return (
    <section className="bg-slate-50 py-20 lg:py-28" data-testid="home-blogs">
      <div className="container-site">
        <Head eyebrow="Latest blogs" title="Learn more about your body" href="/blogs/" label="View All Articles" testId="home-all-blogs-link" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((p) => <div key={p.slug} className="reveal"><BlogCard post={p} cta="Read Article" /></div>)}
        </div>
      </div>
    </section>
  );
}
