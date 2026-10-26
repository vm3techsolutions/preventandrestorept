'use client';

import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Horizontal scroll-snap carousel: 3 cards on desktop, 2 on tablet, ~1 on mobile. Native swipe on touch.
export default function CardCarousel({ children, label, testId }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const scroll = (dir) => {
    const el = track.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };

  const btn = 'flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-navy transition-colors hover:border-teal hover:bg-teal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-35';
  const single = edge.start && edge.end;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} data-testid={testId}>
      <div
        ref={track}
        onScroll={update}
        tabIndex={0}
        aria-label={`${label}, scroll horizontally`}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-2 focus-visible:outline-none sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0"
        data-testid={`${testId}-track`}
      >
        {Children.map(children, (child) => (
          <div className="flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">{child}</div>
        ))}
      </div>
      {!single && (
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className={btn} onClick={() => scroll(-1)} disabled={edge.start} aria-label={`Previous ${label.toLowerCase()}`} data-testid={`${testId}-prev`}><ChevronLeft className="h-5 w-5" aria-hidden /></button>
          <button type="button" className={btn} onClick={() => scroll(1)} disabled={edge.end} aria-label={`Next ${label.toLowerCase()}`} data-testid={`${testId}-next`}><ChevronRight className="h-5 w-5" aria-hidden /></button>
        </div>
      )}
    </div>
  );
}
