'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { ConditionsPanel, ServicesPanel } from './MegaPanels';

// Desktop dropdown: hover, click, keyboard (Escape closes, focus stays on trigger) and touch.
export default function NavDropdown({ label, href, items, allLabel, active, testId, variant }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const btn = useRef(null);
  const timer = useRef(null);
  const hoverAt = useRef(0);

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

  // Hover only for real mice; touch/pen rely on the click toggle so a tap doesn't open-then-close.
  const enter = (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(timer.current); hoverAt.current = Date.now(); setOpen(true); };
  const leave = (e) => { if (e.pointerType !== 'mouse') return; timer.current = setTimeout(() => setOpen(false), 220); };
  const onToggleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => wrap.current?.querySelector(`#${id} a`)?.focus());
    }
  };
  const id = `${testId}-menu`;
  const Panel = variant === 'conditions' ? ConditionsPanel : ServicesPanel;

  return (
    <div ref={wrap} onPointerEnter={enter} onPointerLeave={leave} onBlur={(e) => { if (!wrap.current?.contains(e.relatedTarget)) setOpen(false); }}>
      <div className="flex items-center">
        <Link href={href} className={`nav-link ${active || open ? 'text-teal after:scale-x-100' : 'text-navy'}`} aria-current={active ? 'page' : undefined} data-testid={testId}>{label}</Link>
        <button ref={btn} type="button" aria-expanded={open} aria-controls={id} aria-label={`${label} menu`} onClick={() => setOpen((o) => (Date.now() - hoverAt.current < 800 ? true : !o))} onKeyDown={onToggleKey}
          className="ml-0.5 rounded p-1 text-navy hover:text-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal" data-testid={`${testId}-toggle`}>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </div>
      <div id={id} className={`absolute right-4 top-full z-50 border-t-2 border-teal bg-white shadow-2xl shadow-navy/15 transition-[opacity,transform] duration-150 sm:right-6 lg:right-8 ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`} data-testid={`${testId}-dropdown`}>
        <Panel items={items} href={href} allLabel={allLabel} close={() => setOpen(false)} testId={testId} />
      </div>
    </div>
  );
}
