'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target, run) {
  const [n, setN] = useState(target);
  useEffect(() => {
    if (!run) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1400);
      setN(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

function Metric({ m, run, i }) {
  const n = useCountUp(m.value, run);
  return (
    <div className="border-white/10 px-2 py-6 sm:px-6 lg:border-l lg:first:border-l-0" data-testid={`metric-${i}`}>
      <p className="font-heading text-4xl font-bold text-white sm:text-5xl">{n.toLocaleString('en-US')}<span className="text-teal-hover">{m.suffix}</span></p>
      <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-slate-300">{m.label}</p>
    </div>
  );
}

export default function Metrics({ items }) {
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setRun(true);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!items.length) return null;
  return (
    <section ref={ref} className="bg-navy py-14" aria-label="Clinic at a glance" data-testid="home-metrics">
      <div className="container-site grid grid-cols-2 gap-x-6 lg:grid-cols-4">
        {items.map((m, i) => <Metric key={m.label} m={m} run={run} i={i} />)}
      </div>
    </section>
  );
}
