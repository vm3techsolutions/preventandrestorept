'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SmartImage from '../SmartImage';
import { withSlash } from '@/lib/seo';

const num = (i) => String(i + 1).padStart(2, '0');

// Desktop/tablet: sticky image + info that update as each scroll stage passes. Mobile: plain vertical list.
export default function ServicesScroll({ items }) {
  const [active, setActive] = useState(0);
  const stages = useRef([]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.index)); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    stages.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  const s = items[active];
  return (
    <>
      <div className="relative hidden md:block" style={{ height: `${items.length * 70}vh` }} data-testid="services-scroll">
        <div className="sticky top-24 grid h-[calc(100vh-8rem)] max-h-[720px] grid-cols-[1.1fr_1fr] items-center gap-10 lg:gap-16">
          <div className="relative h-full overflow-hidden rounded-3xl bg-navy">
            {items.map((it, i) => (
              <div key={it.slug} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0'}`} aria-hidden={i !== active}>
                <SmartImage src={it.img} alt={i === active ? it.featuredImage?.alt || `${it.title} at Prevent & Restore (illustrative photo)` : ''} priority={i === 0} sizes="(min-width:1280px) 640px, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="flex h-full flex-col justify-center" aria-live="polite">
            <p className="font-heading text-6xl font-bold text-teal/25 lg:text-7xl" data-testid="services-scroll-number">{num(active)}</p>
            <div key={s.slug} className="animate-rise motion-reduce:animate-none">
              <h3 className="display mt-2 min-h-[2.5em] text-2xl text-navy lg:text-4xl" data-testid="services-scroll-title">{s.title}</h3>
              <p className="mt-5 line-clamp-5 min-h-[7.5rem] text-base leading-relaxed text-slate-600 lg:text-lg">{s.shortDescription}</p>
              <Link href={withSlash(s.path)} className="btn-site mt-8" data-testid="services-scroll-learn-more">Learn More <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
            <ol className="mt-12 flex gap-2" aria-label="Service progress">
              {items.map((it, i) => (
                <li key={it.slug} className={`h-1.5 flex-1 rounded-full transition-colors ${i === active ? 'bg-teal' : i < active ? 'bg-teal/40' : 'bg-slate-200'}`} aria-current={i === active ? 'step' : undefined}>
                  <span className="sr-only">{num(i)} {it.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col" aria-hidden>
          {items.map((it, i) => <div key={it.slug} ref={(el) => { stages.current[i] = el; }} data-index={i} className="flex-1" />)}
        </div>
      </div>
      <ol className="space-y-10 md:hidden" data-testid="services-list-mobile">
        {items.map((it, i) => (
          <li key={it.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative aspect-[16/10]"><SmartImage src={it.img} alt="" sizes="100vw" className="object-cover" /></div>
            <div className="p-6">
              <p className="font-heading text-2xl font-bold text-teal/40">{num(i)}</p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-navy">{it.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{it.shortDescription}</p>
              <Link href={withSlash(it.path)} className="btn-site mt-6" data-testid={`service-mobile-${it.slug}`}>Learn More <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
