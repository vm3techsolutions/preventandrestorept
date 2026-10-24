'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { withSlash } from '@/lib/seo';

// Desktop dropdown: hover, click, keyboard (Escape closes, focus stays on trigger) and touch.
export default function NavDropdown({ label, href, items, allLabel, active, testId }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const btn = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const enter = () => { clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 120); };
  const id = `${testId}-menu`;

  return (
    <div ref={wrap} className="relative" onMouseEnter={enter} onMouseLeave={leave} onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget)) setOpen(false); }}>
      <div className="flex items-center">
        <Link href={href} className={`nav-link ${active ? 'text-teal after:scale-x-100' : 'text-navy'}`} aria-current={active ? 'page' : undefined} data-testid={testId}>{label}</Link>
        <button ref={btn} type="button" aria-expanded={open} aria-controls={id} aria-label={`${label} menu`} onClick={() => setOpen((o) => !o)}
          className="ml-0.5 rounded p-1 text-navy hover:text-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal" data-testid={`${testId}-toggle`}>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </div>
      <div id={id} className={`absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3 transition-[opacity,transform] duration-150 ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`} data-testid={`${testId}-dropdown`}>
        <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-navy/10">
          {items.map((it) => (
            <li key={it.slug}>
              <Link href={withSlash(it.path)} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-2.5 text-[15px] text-navy hover:bg-teal-50 hover:text-teal focus-visible:bg-teal-50 focus-visible:outline-none" data-testid={`${testId}-item-${it.slug}`}>{it.title}</Link>
            </li>
          ))}
          <li className="mt-1 border-t border-slate-100 pt-1">
            <Link href={href} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-teal hover:bg-teal-50 focus-visible:bg-teal-50 focus-visible:outline-none" data-testid={`${testId}-view-all`}>{allLabel}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
