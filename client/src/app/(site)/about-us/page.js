import Image from 'next/image';
import { CalendarClock, ClipboardList, Dumbbell, FileBarChart, Gauge, HeartHandshake, MessagesSquare, ReceiptText, ShieldCheck, UserRound } from 'lucide-react';
import { CtaBand, PageHero, SectionHeading } from '@/components/site/ui';
import { staticMetadata } from '@/lib/seo';

export const metadata = staticMetadata({
  title: 'About Us | Dr. Ray Waters, Dr. Reid Dobson & Prevent & Restore PT Marietta',
  description: 'Meet Dr. Ray Waters, DPT, CSCS, CEAS, owner and founder, and Dr. Reid Dobson, PT, DPT, OCS, and learn about our one-on-one approach to physical therapy.',
  path: '/about-us/',
});

// Team members. Add entries here; members without a photo show a neutral placeholder.
const TEAM = [
  {
    name: 'Dr. Ray Waters',
    credentials: 'DPT, CSCS, CEAS',
    role: 'Owner and Founder, Prevent & Restore Physical Therapy',
    photo: '/images/ray-waters.webp',
    bio: [
      'Dr. Ray Waters, DPT, CSCS, CEAS is an outpatient orthopedic physical therapist specializing in musculoskeletal injuries, athletic performance, and preventative techniques.',
      'He is trained in the Stecco fascial manipulation method and holds certifications in CSCS, FMS, and CEAS. He works with Division 1 athletes, weekend warriors, desk workers, and post-surgery patients, providing personalized care.',
    ],
    quote: 'Let’s work together to help you reach your full potential and keep you moving well.',
    certifications: ['DPT', 'CSCS', 'FMS', 'CEAS', 'Stecco fascial manipulation'],
  },
  {
    name: 'Dr. Reid Dobson',
    credentials: 'PT, DPT, OCS',
     photo: '/images/Reid.jpg',
    bio: [
      'Dr. Reid Dobson, PT, DPT, OCS is an outpatient orthopedic physical therapist who thrives on the ‘investigation’ stage of patient care. He approaches every initial evaluation as a unique puzzle, analyzing complex movement breakdowns to build a precise path toward recovery.',
      'What truly sets Dr. Reid apart is his designation as an Orthopedic Certified Specialist (OCS), an elite board certification held by fewer than 5% of practicing physical therapists in the country. This advanced training grants him superior diagnostic capabilities and evidence-based insights to solve even the most persistent musculoskeletal issues.',
      'Dr. Reid joined Prevent & Restore Physical Therapy in July of 2026 to focus entirely on intentional, 1-on-1 patient care. Outside the clinic, he is an avid hiker, farmer’s market shopper, and soccer player.',
    ],
    certifications: ['PT', 'DPT', 'OCS'],
  },
];

const WHY = [
  { icon: HeartHandshake, text: 'Patient-centered, one-on-one care designed to empower you and get results.' },
  { icon: CalendarClock, text: 'A full 60 minutes with a Doctor of Physical Therapy at every visit.' },
  { icon: MessagesSquare, text: 'Time to understand your condition, ask questions and set goals for your treatment.' },
  { icon: UserRound, text: 'You are the sole focus of our attention: no sharing time with other patients and no rushed sessions.' },
  { icon: ReceiptText, text: 'No surprise bills, as is typical in traditional outpatient clinics.' },
  { icon: Dumbbell, text: 'Physical therapy blended with strength and conditioning principles to get you better faster with less chance of reinjury.' },
  { icon: ShieldCheck, text: 'Focused not only on helping you recover, but also on preventing future issues.' },
];

const TESTING = [
  { icon: ClipboardList, title: 'Strength and movement assessment', text: 'Using reliable and objective measurement, we run a battery of tests to analyze how well you push, pull, hinge, rotate and brace, plus your balance, stability and control.' },
  { icon: Gauge, title: 'Performance testing', text: 'Applying force plate technology and hand-held dynamometry, we examine how your body produces force and accepts load, including upper and lower body power, tendon stiffness and elasticity, neuromuscular fatigue and dynamic strength index.' },
  { icon: FileBarChart, title: 'Reports and interventions', text: 'You take away a customized report showing where you are strong, where you move well and what could be improved. When it is time to test again, we compare results and track your progress over time.' },
];

function MemberPhoto({ m }) {
  if (!m.photo) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-gradient-to-br from-navy to-teal text-white" role="img" aria-label={`Photo of ${m.name} coming soon`} data-testid="team-member-initials">
        <span className="font-heading text-7xl font-semibold tracking-wide" aria-hidden>{m.name.replace(/^Dr\.\s*/, '').split(' ').map((w) => w[0]).join('')}</span>
      </div>
    );
  }
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100">
      <Image src={m.photo} alt={`${m.name}, ${m.credentials}`} fill sizes="(min-width:1024px) 400px, 90vw" className="object-cover object-top" />
    </div>
  );
}

function TeamMember({ m, i }) {
  const slug = m.name.toLowerCase().replace(/[^a-z]+/g, '-');
  return (
    <article className={`grid items-center gap-10 lg:gap-16 ${i % 2 ? 'lg:grid-cols-[1fr_minmax(0,400px)]' : 'lg:grid-cols-[minmax(0,400px)_1fr]'}`} data-testid={`team-member-${slug}`}>
      <div className={`relative mx-auto w-full max-w-sm lg:max-w-none ${i % 2 ? 'lg:order-2' : ''}`}>
        <div className="absolute inset-0 -translate-x-3 translate-y-3 rounded-3xl bg-teal-50 sm:-translate-x-4 sm:translate-y-4" aria-hidden />
        <div className="relative"><MemberPhoto m={m} /></div>
      </div>
      <div>
        <h3 className="display text-3xl text-navy sm:text-4xl">{m.name}</h3>
        <p className="mt-2 font-medium text-slate-500">{m.credentials}</p>
        {m.role && <p className="mt-3 text-base font-semibold text-teal md:text-lg" data-testid={`team-member-${slug}-role`}>{m.role}</p>}
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600 md:text-lg">{m.bio.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</div>
        {m.quote && <blockquote className="mt-6 border-l-4 border-teal pl-5 font-heading text-lg font-medium italic text-navy">“{m.quote}”</blockquote>}
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Certifications" data-testid={`team-member-${slug}-certifications`}>
          {m.certifications.map((c) => <li key={c} className="rounded-full border border-teal/30 bg-teal-50 px-4 py-1.5 text-sm font-medium text-navy">{c}</li>)}
        </ul>
      </div>
    </article>
  );
}

function TeamSection() {
  return (
    <section className="container-site py-20 lg:py-28" aria-labelledby="team-heading" data-testid="about-team">
      <p className="eyebrow text-teal">Meet the team</p>
      <h2 id="team-heading" className="display mt-3 text-2xl text-navy sm:text-3xl lg:text-4xl">The people behind your care</h2>
      <div className="mt-14 space-y-20">{TEAM.map((m, i) => <TeamMember key={m.name} m={m} i={i} />)}</div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="bg-navy py-20 text-white lg:py-28" data-testid="about-why">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading light eyebrow="Why Prevent & Restore" title="A different kind of physical therapy experience" intro="If you’ve felt let down by traditional outpatient PT clinics, we’re here to show you a different kind of experience." />
        <ul className="grid gap-4 sm:grid-cols-2" data-testid="about-why-points">
          {WHY.map((w) => (
            <li key={w.text} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-white"><w.icon className="h-5 w-5" aria-hidden /></span>
              <p className="text-[15px] leading-relaxed text-slate-200">{w.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TestingSection() {
  return (
    <section className="container-site grid items-center gap-14 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28" data-testid="about-performance-testing">
      <div>
        <SectionHeading eyebrow="Performance testing · Powered by VALD" title="Objective insight into how you move" intro="We use VALD Performance technology to measure strength and movement, so your plan is built on data." />
        <div className="mt-10 space-y-6">
          {TESTING.map((t, i) => (
            <div key={t.title} className="flex gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal text-white"><t.icon className="h-5 w-5" aria-hidden /></span>
              <div>
                <p className="eyebrow text-teal">0{i + 1}</p>
                <h3 className="mt-1 font-heading text-lg font-semibold text-navy">{t.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 sm:aspect-[4/3] lg:aspect-[4/5]" data-testid="about-testing-image">
        <Image src="/images/stock/performance-testing.webp" alt="A coach guiding an athlete through a strength and movement exercise in a gym (illustrative stock photo)" fill sizes="(min-width:1024px) 42vw, 100vw" className="object-cover" />
      </figure>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title="Prevent pain. Restore movement." intro="Educate and empower our community to prevent injuries while quickly restoring injured clients from pain so they can continue doing activities they love the most." crumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us/' }]} />
      <TeamSection />
      <WhySection />
      <TestingSection />
      <CtaBand />
    </>
  );
}
