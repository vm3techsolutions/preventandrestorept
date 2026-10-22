import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarCheck, Phone, PhoneCall, Search } from 'lucide-react';
import { ArcMotif } from '../ui';
import { SITE } from '@/lib/site';

const OPTIONS = [
  { icon: PhoneCall, title: 'Speak With a PT', text: 'Have questions about physical therapy? We would be happy to chat with you so we can be sure we can help you.', href: SITE.phoneHref, label: 'Call us' },
  { icon: Search, title: 'Availability & Pricing', text: 'Book an appointment that fits your schedule by completing a simple form.', href: SITE.appointmentHref, label: 'Check availability' },
  { icon: CalendarCheck, title: 'Discovery Call', text: 'Book a free discovery call to discuss your needs and if physical therapy is right for you.', href: SITE.appointmentHref, label: 'Book a call' },
];

function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mr-0">
      <div className="absolute -inset-3 translate-x-5 translate-y-5 rounded-t-full rounded-b-3xl border-2 border-teal/60" aria-hidden />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl bg-slate-300">
        <Image src="/images/ray-waters.webp" alt="Dr. Ray Waters, physical therapist and founder of Prevent & Restore Physical Therapy" fill priority sizes="(min-width:1024px) 420px, 80vw" className="object-cover object-top" />
      </div>
      <div className="absolute -bottom-6 -left-4 rounded-2xl bg-white p-5 shadow-xl shadow-navy/20 sm:-left-10" data-testid="hero-founder-card">
        <p className="font-heading text-base font-semibold text-navy">Dr. Ray Waters</p>
        <p className="text-sm text-slate-500">PT, DPT, CSCS, CEAS · Owner &amp; Founder</p>
      </div>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white" data-testid="home-hero">
      <ArcMotif className="-right-32 -top-24 h-[720px] w-[720px] text-teal/20" />
      <div className="container-site relative grid items-center gap-16 pb-24 pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-32 lg:pt-24">
        <div className="animate-rise">
          <p className="eyebrow text-teal-100">Physical therapy · Marietta, GA</p>
          <h1 className="display mt-5 text-4xl text-white sm:text-5xl lg:text-6xl">Feel strong <span className="text-teal-hover">again.</span></h1>
          <p className="mt-7 max-w-xl text-base text-slate-300 md:text-lg">
            One-on-one, 60-minute sessions with a Doctor of Physical Therapy. Relieve pain, rebuild strength, and protect your future health.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={SITE.appointmentHref} className="btn-site px-7 py-4" data-testid="hero-appointment-btn">Request Appointment <ArrowRight className="h-4 w-4" /></Link>
            <a href={SITE.phoneHref} className="btn-site-ghost-light px-7 py-4" data-testid="hero-phone-btn"><Phone className="h-4 w-4" /> {SITE.phone}</a>
          </div>
        </div>
        <Portrait />
      </div>
    </section>
  );
}

export function HomeOptions() {
  return (
    <section className="relative z-10 -mt-12 pb-8" aria-labelledby="options-heading" data-testid="home-options">
      <div className="container-site">
        <h2 id="options-heading" className="sr-only">Wondering if Prevent &amp; Restore Physical Therapy is right for you?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {OPTIONS.map((o, i) => (
            <a key={o.title} href={o.href} className="card-site group p-7" style={{ animationDelay: `${i * 80}ms` }} data-testid={`home-option-${i}`}>
              <o.icon className="h-6 w-6 text-teal" aria-hidden />
              <p className="mt-5 font-heading text-lg font-semibold text-navy">{o.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{o.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">{o.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
