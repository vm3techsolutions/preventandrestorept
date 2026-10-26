'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Phone } from 'lucide-react';
import { SITE } from '@/lib/site';
import { withSlash } from '@/lib/seo';

function Sub({ label, href, items, allLabel, active, testId }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center">
        <Link href={href} className={`flex-1 rounded-lg px-4 py-3 text-lg font-medium ${active ? 'bg-teal-50 text-teal' : 'text-navy hover:bg-slate-50'}`} data-testid={testId}>{label}</Link>
        <button type="button" aria-expanded={open} aria-label={`Show ${label}`} onClick={() => setOpen(!open)} className="rounded-lg p-3 text-navy hover:bg-slate-50" data-testid={`${testId}-toggle`}>
          <ChevronDown className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </div>
      {open && (
        <ul className="mb-2 ml-4 border-l border-slate-200 pl-2" data-testid={`${testId}-submenu`}>
          {items.map((it) => <li key={it.slug}><Link href={withSlash(it.path)} className="block rounded-lg px-4 py-2.5 text-[15px] text-slate-700 hover:bg-teal-50 hover:text-teal">{it.title}</Link></li>)}
          <li><Link href={href} className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-teal">{allLabel}</Link></li>
        </ul>
      )}
    </div>
  );
}

export default function MobileNav({ links, isActive }) {
  return (
    <div id="mobile-nav" className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-10 pt-4 lg:hidden" data-testid="mobile-nav">
      <nav aria-label="Mobile" className="space-y-1">
        {links.map((n) => {
          const testId = `mobile-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`;
          if (n.items) return <Sub key={n.href} {...n} active={isActive(n.href)} testId={testId} />;
          return <Link key={n.href} href={n.href} className={`block rounded-lg px-4 py-3 text-lg font-medium ${isActive(n.href) ? 'bg-teal-50 text-teal' : 'text-navy hover:bg-slate-50'}`} data-testid={testId}>{n.label}</Link>;
        })}
      </nav>
      <div className="mt-6 grid gap-3">
        <Link href={SITE.appointmentHref} className="btn-site justify-center py-3.5" data-testid="mobile-appointment-btn">Request Appointment</Link>
        <a href={SITE.phoneHref} className="btn-site-outline justify-center py-3.5" data-testid="mobile-phone-link"><Phone className="h-4 w-4" /> {SITE.phone}</a>
      </div>
    </div>
  );
}
