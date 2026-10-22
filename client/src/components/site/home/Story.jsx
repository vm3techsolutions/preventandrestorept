import Image from 'next/image';
import { Clock, Dumbbell, ShieldCheck, UserRound } from 'lucide-react';
import { MoreLink, SectionHeading } from '../ui';

const APPROACH = [
  { icon: Clock, title: 'A full 60 minutes', text: 'Every visit is a full hour with a Doctor of Physical Therapy, so you have time to understand your condition, ask questions and set goals.' },
  { icon: UserRound, title: 'One-on-one, always', text: 'You are the sole focus of our attention. No sharing time with other patients and no rushed sessions.' },
  { icon: Dumbbell, title: 'PT meets strength & conditioning', text: 'We blend physical therapy with strength and conditioning principles to get you better faster with less chance of reinjury.' },
  { icon: ShieldCheck, title: 'Prevention built in', text: 'We are dedicated to not only helping you recover, but also preventing future issues.' },
];

const STEPS = [
  { title: 'Find the root cause of your pain', text: 'We take you through a comprehensive biomechanical assessment and identify the cause of your problem, then explain what must be done to get you back to the activities you enjoy.' },
  { title: 'Restore strength and mobility', text: 'We develop a treatment plan tailored specifically to you and your goals, so you get stronger, reduce pain, and reach your goals more efficiently.' },
  { title: 'Prevent future injuries', text: 'After we treat your current symptoms, our focus shifts to optimizing your physical health and well-being through preventive strategies going forward.' },
];

export function MissionSection() {
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-mission">
      <div className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-teal">Our mission</p>
          <p className="mt-6 font-heading text-2xl font-semibold leading-snug text-navy sm:text-3xl">
            “Educate and empower our community to prevent injuries while quickly restoring injured clients from pain so they can continue doing activities they love the most.”
          </p>
        </div>
        <div className="lg:pt-12">
          <h2 className="display text-xl text-navy sm:text-2xl">Why Prevent &amp; Restore?</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            If you have felt let down by traditional outpatient PT clinics, we are here to show you a different kind of experience. We offer our patients 1-on-1 care focused on blending physical therapy with strength and conditioning principles in order to get patients better faster with less chance of reinjury.
          </p>
          <div className="mt-6"><MoreLink href="/about-us/" testId="mission-about-link">More about our clinic</MoreLink></div>
        </div>
      </div>
    </section>
  );
}

export function ApproachSection() {
  return (
    <section className="bg-teal-50/60 py-20 lg:py-28" data-testid="home-approach">
      <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <SectionHeading eyebrow="Our approach" title="Care that gives you time and attention" intro="Patient-centered, one-on-one care designed to empower you and get results." />
          <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
            <Image src="/images/ray-waters.webp" alt="Dr. Ray Waters" fill sizes="40vw" className="object-cover object-[50%_25%]" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {APPROACH.map((a) => (
            <div key={a.title} className="rounded-2xl bg-white p-7 shadow-xs ring-1 ring-slate-200/70">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white"><a.icon className="h-5 w-5" aria-hidden /></span>
              <h3 className="mt-5 font-heading text-lg font-semibold text-navy">{a.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-process">
      <div className="container-site">
        <SectionHeading eyebrow="What we offer" title="Your path from pain to performance" align="center" />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent md:block" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative" data-testid={`process-step-${i + 1}`}>
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-white ring-8 ring-white">{i + 1}</span>
              <p className="eyebrow mt-6 text-teal">Step {i + 1}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold text-navy">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
