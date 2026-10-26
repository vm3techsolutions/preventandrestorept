'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { SITE } from '@/lib/site';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' }) : '');

function Stars({ rating, size = 'h-4 w-4' }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`${size} ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden />)}
    </div>
  );
}

function Featured({ items }) {
  const [i, setI] = useState(0);
  const r = items[i];
  const go = (d) => setI((i + d + items.length) % items.length);
  return (
    <div className="reveal relative rounded-3xl bg-navy p-8 text-white sm:p-12" aria-roledescription="carousel" aria-label="Featured testimonials" data-testid="testimonial-featured"
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}>
      <Quote className="h-10 w-10 text-teal-hover" aria-hidden />
      <figure aria-live="polite" key={r.id} className="animate-rise">
        <blockquote className="mt-6 font-heading text-xl font-medium leading-relaxed text-white sm:text-2xl">“{r.text}”</blockquote>
        <figcaption className="mt-8 flex flex-wrap items-center gap-4">
          <span className="font-semibold">{r.reviewerName}</span>
          <Stars rating={r.rating} />
          <span className="text-sm text-slate-400">{[r.source, fmt(r.reviewDate)].filter(Boolean).join(' · ')}</span>
        </figcaption>
      </figure>
      {items.length > 1 && (
        <div className="mt-10 flex items-center gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-hover" data-testid="testimonial-prev"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-hover" data-testid="testimonial-next"><ChevronRight className="h-5 w-5" /></button>
          <span className="ml-2 text-sm text-slate-400" data-testid="testimonial-counter">{i + 1} / {items.length}</span>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <figure className="reveal flex flex-col rounded-2xl border border-slate-200 bg-white p-6" data-testid={`review-card-${r.id}`}>
      <Stars rating={r.rating} />
      <blockquote className="mt-4 line-clamp-6 text-[15px] leading-relaxed text-slate-700">“{r.text}”</blockquote>
      <figcaption className="mt-auto pt-5 text-sm">
        <span className="font-semibold text-navy">{r.reviewerName}</span>
        <span className="block text-slate-500">{[r.source, fmt(r.reviewDate)].filter(Boolean).join(' · ')}</span>
      </figcaption>
    </figure>
  );
}

// Testimonials + client reviews from the same CMS Reviews records. Hidden when none are published.
export default function Testimonials({ reviews }) {
  if (!reviews.length) return null;
  const featured = reviews.filter((r) => r.isFeatured);
  const lead = featured.length ? featured : reviews.slice(0, 1);
  const rest = reviews.filter((r) => !lead.includes(r)).slice(0, 6);
  return (
    <section className="bg-teal-50/60 py-20 lg:py-28" aria-labelledby="testimonials-heading" data-testid="home-testimonials">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-teal">Testimonials</p>
            <h2 id="testimonials-heading" className="display mt-3 text-2xl text-navy sm:text-3xl lg:text-4xl">What our clients say</h2>
          </div>
          <a href={SITE.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="btn-site-outline" data-testid="read-more-reviews-link">Read More Reviews on Google</a>
        </div>
        <div className="mt-12"><Featured items={lead} /></div>
        {rest.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="client-reviews">
            {rest.map((r) => <ReviewCard key={r.id} r={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
