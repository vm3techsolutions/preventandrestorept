import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SmartImage from '../SmartImage';
import { BlogCard } from '../Cards';
import CardCarousel from '../CardCarousel';
import { EmptyState, MoreLink, SectionHeading } from '../ui';
import { withSlash } from '@/lib/seo';
import { REGION_STOCK, SERVICE_STOCK, stockFor } from '@/lib/stockImages';
import ServicesScroll from './ServicesScroll';

function Head({ eyebrow, title, intro, href, label, testId }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
      <MoreLink href={href} testId={testId}>{label}</MoreLink>
    </div>
  );
}

// Shared carousel card: fixed image ratio, clamped text and a bottom-aligned CTA so heights line up.
function CarouselCard({ item, img, cta, testId }) {
  return (
    <Link href={withSlash(item.path)} className="card-site group flex w-full flex-col overflow-hidden" data-testid={testId}>
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-slate-100">
        <SmartImage src={img} alt={item.featuredImage?.alt || ''} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 85vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="line-clamp-2 min-h-[3.5rem] font-heading text-xl font-semibold leading-7 text-navy">{item.title}</h3>
        <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-[15px] leading-6 text-slate-600">{item.shortDescription}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-teal group-hover:text-teal-hover">{cta} <ArrowUpRight className="h-4 w-4" aria-hidden /></span>
      </div>
    </Link>
  );
}

// Scroll-driven presentation of the first 7 services in CMS order.
export function FeaturedServices({ items }) {
  const list = items.slice(0, 7).map((s, i) => ({ ...s, img: s.featuredImage?.url || stockFor(SERVICE_STOCK, s.slug, i) }));
  return (
    <section className="bg-slate-50 py-20 lg:py-28" data-testid="home-services">
      <div className="container-site">
        <Head eyebrow="Our services" title="Treatment built around you" intro="One-on-one physical therapy blended with strength and conditioning, so you recover, perform and stay active." href="/services/" label="View All Services" testId="home-all-services-link" />
        <div className="mt-12">
          {list.length ? <ServicesScroll items={list} /> : <EmptyState title="Services are being updated" text="Please check back soon or call us to learn more." />}
        </div>
      </div>
    </section>
  );
}

// Same carousel style as services; full content lives on the detail pages.
export function ConditionsSection({ items }) {
  if (!items.length) return null;
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-conditions">
      <div className="container-site">
        <Head eyebrow="What we treat" title="Conditions we help with" href="/what-we-treat/" label="View All Conditions" testId="home-all-conditions-link" />
        <div className="reveal mt-12">
          <CardCarousel label="Conditions" testId="conditions-carousel">
            {items.map((c, i) => <CarouselCard key={c.slug} item={c} img={c.featuredImage?.url || stockFor(REGION_STOCK, c.slug, i)} cta="Read More" testId={`condition-card-${c.slug}`} />)}
          </CardCarousel>
        </div>
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
          {items.slice(0, 3).map((p) => <div key={p.slug} className="reveal flex"><BlogCard post={p} cta="Read Article" /></div>)}
        </div>
      </div>
    </section>
  );
}
