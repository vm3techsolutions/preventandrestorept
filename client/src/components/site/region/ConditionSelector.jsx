'use client';

import { useEffect, useState } from 'react';

// Sticky chip bar that scrolls to each condition section and highlights the one in view.
export default function ConditionSelector({ sections }) {
  const [active, setActive] = useState(sections[0]?.anchor);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((s) => { const el = document.getElementById(s.anchor); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sections]);

  const go = (e, anchor) => {
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(anchor)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${anchor}`);
    setActive(anchor);
  };

  return (
    <nav aria-label="Explore conditions we treat" className="sticky top-20 z-30 border-y border-slate-200 bg-white/95 backdrop-blur" data-testid="condition-selector">
      <div className="container-site flex items-center gap-4 py-3">
        <p className="hidden shrink-0 font-heading text-sm font-semibold text-navy lg:block">Explore conditions we treat</p>
        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {sections.map((s) => (
            <li key={s.anchor} className="shrink-0">
              <a href={`#${s.anchor}`} onClick={(e) => go(e, s.anchor)} aria-current={active === s.anchor ? 'true' : undefined} data-testid={`condition-chip-${s.anchor}`}
                className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal ${active === s.anchor ? 'bg-teal text-white' : 'bg-slate-100 text-navy hover:bg-teal-50 hover:text-teal'}`}>
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
