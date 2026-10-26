'use client';

import { useEffect, useRef } from 'react';

// Muted looping background video. Skipped for reduced motion; lazy loads when `lazy` is set.
export default function BgVideo({ src, lazy = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const start = () => {
      v.src = src;
      v.play().catch(() => {});
    };
    if (!lazy || !('IntersectionObserver' in window)) {
      start();
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        start();
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(v);
    return () => io.disconnect();
  }, [src, lazy]);
  return <video ref={ref} muted loop playsInline preload="none" aria-hidden className={className} data-testid="bg-video" />;
}
