'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { withSlash } from '@/lib/seo';

const itemCls = 'group flex items-center justify-between gap-4 border-b border-slate-200 py-3.5 text-[15px] text-navy transition-colors hover:text-teal focus-visible:text-teal focus-visible:outline-none';

function ViewAll({ href, label, close, testId }) {
  return (
    <div className="flex justify-center border-t border-slate-200 bg-white px-8 py-4">
      <Link href={href} onClick={close} className="inline-flex items-center gap-6 bg-teal px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-teal-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal" data-testid={`${testId}-view-all`}>
        {label} <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function ServicesPanel({ items, href, allLabel, close, testId }) {
  return (
    <div className="w-[min(780px,calc(100vw-4rem))]">
      <ul className="grid grid-cols-2 gap-x-6 px-6 pt-3">
        {items.map((it, i) => (
          <li key={it.slug}>
            <Link href={withSlash(it.path)} onClick={close} className={itemCls} data-testid={`${testId}-item-${it.slug}`}>
              <span className="flex items-baseline gap-4"><span className="w-5 text-[11px] text-teal">{String(i + 1).padStart(2, '0')}</span>{it.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4"><ViewAll href={href} label={allLabel} close={close} testId={testId} /></div>
    </div>
  );
}

function RegionDetailPane({ region, close, testId }) {
  const sections = region.sections || [];
  return (
    <div className="p-8" data-testid={`${testId}-panel-${region.slug}`}>
      <p className="eyebrow text-teal">Conditions we treat</p>
      <p className="mt-1 font-heading text-3xl font-semibold text-navy">{region.title}</p>
      {sections.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-x-6">
          {sections.map((s) => (
            <li key={s.anchor}>
              <Link href={`${withSlash(region.path)}#${s.anchor}`} onClick={close} className={`${itemCls} py-3 text-sm text-slate-600`} data-testid={`${testId}-condition-${region.slug}-${s.anchor}`}>
                {s.heading}<ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href={withSlash(region.path)} onClick={close} className="mt-7 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-teal hover:text-teal-hover" data-testid={`${testId}-explore-${region.slug}`}>
        Explore {region.title} <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function ConditionsPanel({ items, href, allLabel, close, testId }) {
  const [active, setActive] = useState(items[0]?.slug);
  const hoverTimer = useRef(null);
  // Short hover intent so a diagonal move toward the panel doesn't swap regions.
  const hoverTo = (slug) => { clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => setActive(slug), 120); };
  const region = items.find((r) => r.slug === active) || items[0];
  return (
    <div className="w-[min(880px,calc(100vw-4rem))]">
      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <ul className="max-h-[60vh] overflow-y-auto bg-slate-50 p-5">
          {items.map((r) => (
            <li key={r.slug}>
              <Link href={withSlash(r.path)} onClick={close} onPointerEnter={() => hoverTo(r.slug)} onPointerLeave={() => clearTimeout(hoverTimer.current)} onFocus={() => setActive(r.slug)} aria-current={r.slug === region.slug ? 'true' : undefined}
                className={`${itemCls} px-4 text-sm font-medium ${r.slug === region.slug ? 'bg-white text-teal' : ''}`} data-testid={`${testId}-item-${r.slug}`}>
                {r.title}<ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-teal" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        {region && <RegionDetailPane region={region} close={close} testId={testId} />}
      </div>
      <ViewAll href={href} label={allLabel} close={close} testId={testId} />
    </div>
  );
}
