import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock, Dumbbell, ShieldCheck, UserRound } from 'lucide-react';
import { SectionHeading } from '../ui';

// Audiences named in Dr. Ray's verified bio. Links are dropped if the target is not published.
const AUDIENCES = [
  { title: 'Athletes', text: 'From Division 1 athletes to youth sports, get back to competing with less chance of reinjury.', image: '/images/stock/lift-woman.webp', href: '/what-we-treat/sports-injuries/' },
  { title: 'Weekend warriors', text: 'Keep doing the activities you love with strength and conditioning built into your care.', image: '/images/stock/kettlebell.webp', href: '/services/exercise-performance-and-programming/' },
  { title: 'Desk workers', text: 'Long days at a desk can lead to back and neck pain. We find the cause and build a plan around it.', image: '/images/stock/desk.webp', href: '/what-we-treat/back-sciatica-pain/' },
  { title: 'Recovering from surgery', text: 'Personalised rehab to restore strength and mobility after your procedure.', image: '/images/stock/rehab-gym.webp', href: '/services/blood-flow-restriction-therapy/' },
];

const STEPS = [
  { title: 'Find the root cause of your pain', text: 'A comprehensive biomechanical assessment identifies the cause of your problem and what must be done to get you back to the activities you enjoy.' },
  { title: 'Restore strength and mobility', text: 'A treatment plan tailored specifically to you and your goals, so you get stronger, reduce pain, and reach your goals more efficiently.' },
  { title: 'Prevent future injuries', text: 'Once current symptoms are treated, the focus shifts to optimizing your physical health and well-being through preventive strategies.' },
];

const OFFER = [
  { icon: Clock, title: 'A full 60 minutes', text: 'Time to understand your condition, ask questions and set goals.' },
  { icon: UserRound, title: 'One-on-one, always', text: 'No sharing time with other patients and no rushed sessions.' },
  { icon: Dumbbell, title: 'PT meets strength & conditioning', text: 'Get better faster with less chance of reinjury.' },
  { icon: ShieldCheck, title: 'Prevention built in', text: 'Recover now and prevent future issues.' },
];

function AudienceCard({ a, linked }) {
  const body = (
    <>
      <Image src={a.image} alt="" fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="flex items-center justify-between gap-2 font-heading text-xl font-semibold text-white">{a.title}{linked && <ArrowUpRight className="h-5 w-5 text-teal-100 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">{a.text}</p>
      </div>
    </>
  );
  const cls = 'reveal group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-navy sm:aspect-[4/5]';
  const testId = `who-card-${a.title.toLowerCase().replace(/\s+/g, '-')}`;
  return linked ? <Link href={a.href} className={cls} data-testid={testId}>{body}</Link> : <div className={cls} data-testid={testId}>{body}</div>;
}

export function WhoWeTreat({ published }) {
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-who">
      <div className="container-site">
        <SectionHeading eyebrow="Who we treat" title="Care for every kind of active life" intro="From Division 1 athletes and weekend warriors to those with desk jobs and patients recovering from surgery." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => <AudienceCard key={a.title} a={a} linked={published.has(a.href)} />)}
        </div>
      </div>
    </section>
  );
}

export function ApproachSection() {
  return (
    <section className="bg-slate-50 py-20 lg:py-28" data-testid="home-approach">
      <div className="container-site">
        <SectionHeading eyebrow="Our approach" title="Your path from pain to performance" />
        <ol className="relative mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div className="absolute bottom-4 left-7 top-4 w-px bg-teal/30 lg:bottom-auto lg:left-7 lg:right-7 lg:top-7 lg:h-px lg:w-auto" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.title} className="reveal relative flex gap-6 lg:block" style={{ transitionDelay: `${i * 120}ms` }} data-testid={`process-step-${i + 1}`}>
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-white ring-8 ring-slate-50">{i + 1}</span>
              <div className="lg:mt-6">
                <p className="eyebrow text-teal">Step {i + 1}</p>
                <h3 className="mt-2 font-heading text-xl font-semibold text-navy">{s.title}</h3>
                <p className="mt-3 max-w-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WhatWeOffer() {
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-offer">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="reveal relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 lg:aspect-[5/6]">
          <Image src="/images/stock/neck.webp" alt="A physical therapist treating a patient's neck and shoulder" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
        </div>
        <div className="reveal">
          <SectionHeading eyebrow="What we offer" title="A different kind of physical therapy experience" intro="If you’ve felt let down by traditional outpatient PT clinics, we offer 1-on-1 care that blends physical therapy with strength and conditioning principles." />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {OFFER.map((o) => (
              <li key={o.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal"><o.icon className="h-5 w-5" aria-hidden /></span>
                <div><h3 className="font-heading font-semibold text-navy">{o.title}</h3><p className="mt-1 text-[15px] leading-relaxed text-slate-600">{o.text}</p></div>
              </li>
            ))}
          </ul>
          <Link href="/about-us/" className="btn-site-outline mt-10" data-testid="offer-about-link">Why Prevent &amp; Restore</Link>
        </div>
      </div>
    </section>
  );
}
