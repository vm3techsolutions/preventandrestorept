import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone } from 'lucide-react';
import BgVideo from '../BgVideo';
import { MoreLink } from '../ui';
import { SITE } from '@/lib/site';

// Stock footage (Pexels, free licence) until the clinic supplies its own video.
const HERO_VIDEO = '/videos/hero.mp4';
const CTA_VIDEO = '/videos/cta.mp4';

export function HomeHero() {
  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-navy text-white lg:min-h-[86vh]" data-testid="home-hero">
      <Image src="/images/stock/stretch.webp" alt="" fill priority sizes="100vw" className="object-cover" />
      <BgVideo src={HERO_VIDEO} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/75 to-navy/30" aria-hidden />
      <div className="container-site relative py-24">
        <div className="max-w-2xl animate-rise">
          <p className="eyebrow text-teal-100">Physical therapy · Marietta, GA</p>
          <h1 className="display mt-5 text-4xl text-white sm:text-5xl lg:text-6xl">Feel strong <span className="text-teal-hover">again.</span></h1>
          <p className="mt-7 max-w-xl text-base text-slate-200 md:text-lg">
            One-on-one, 60-minute sessions with a Doctor of Physical Therapy. Relieve pain, rebuild strength, and protect your future health.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={SITE.appointmentHref} className="btn-site px-7 py-4" data-testid="hero-appointment-btn">Request Appointment <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/services/" className="btn-site-ghost-light px-7 py-4" data-testid="hero-services-btn">Explore Services</Link>
          </div>
          <a href={SITE.phoneHref} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-white" data-testid="hero-phone-link"><Phone className="h-4 w-4" aria-hidden /> Speak with a PT: {SITE.phone}</a>
        </div>
      </div>
    </section>
  );
}

export function AboutRay() {
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-about">
      <div className="container-site grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="reveal relative mx-auto w-full max-w-md lg:mx-0">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-full rounded-b-3xl border-2 border-teal/50 sm:translate-x-5 sm:translate-y-5" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl bg-slate-200">
            <Image src="/images/ray-waters.webp" alt="Dr. Ray Waters, physical therapist and founder of Prevent & Restore Physical Therapy" fill sizes="(min-width:1024px) 420px, 85vw" className="object-cover object-top" />
          </div>
        </div>
        <div className="reveal">
          <p className="eyebrow text-teal">Dr. Ray’s expertise</p>
          <h2 className="display mt-3 text-3xl text-navy sm:text-4xl">Dr. Ray Waters</h2>
          <p className="mt-2 font-medium text-slate-500">PT, DPT, CSCS, CEAS · Owner &amp; Founder</p>
          <p className="mt-6 text-base leading-relaxed text-slate-600 md:text-lg">
            Dr. Ray Waters is an outpatient orthopedic physical therapist with a passion for helping people move better and reducing pain. He specializes in the treatment of musculoskeletal injuries, improving athletic performance, and using preventative techniques to stop pain before it starts.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {['Doctor of Physical Therapy', 'CSCS', 'CEAS', 'FMS', 'Stecco fascial manipulation'].map((c) => <li key={c} className="rounded-full border border-teal/30 bg-teal-50 px-4 py-1.5 text-sm font-medium text-navy">{c}</li>)}
          </ul>
          <Link href="/about-us/" className="btn-site mt-9" data-testid="home-about-link">Learn More About Us <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}

export function FullCta() {
  return (
    <section className="relative overflow-hidden bg-navy text-white" data-testid="home-full-cta">
      <Image src="/images/stock/rehab-gym.webp" alt="" fill sizes="100vw" className="object-cover" />
      <BgVideo src={CTA_VIDEO} lazy className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-teal/60" aria-hidden />
      <div className="container-site relative grid items-end gap-10 py-24 lg:grid-cols-[1.4fr_1fr] lg:py-32">
        <div className="reveal">
          <p className="eyebrow text-teal-100">Wondering if we are right for you?</p>
          <h2 className="display mt-4 text-3xl text-white sm:text-4xl lg:text-5xl">Want to get relief faster?</h2>
          <p className="mt-5 max-w-xl text-base text-slate-200 md:text-lg">Speak with a PT, check availability and pricing, or book a free discovery call to discuss your needs.</p>
        </div>
        <div className="reveal flex flex-wrap gap-3 lg:justify-end">
          <Link href={SITE.appointmentHref} className="btn-site-light px-7 py-4" data-testid="full-cta-appointment">Request Appointment <ArrowRight className="h-4 w-4" /></Link>
          <a href={SITE.phoneHref} className="btn-site-ghost-light px-7 py-4" data-testid="full-cta-phone"><Phone className="h-4 w-4" /> {SITE.phone}</a>
        </div>
      </div>
    </section>
  );
}

export { MoreLink };
