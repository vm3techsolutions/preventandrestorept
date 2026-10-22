import Image from 'next/image';
import { ClipboardList, FileBarChart, Gauge } from 'lucide-react';
import { CtaBand, PageHero, SectionHeading } from '@/components/site/ui';
import { staticMetadata } from '@/lib/seo';

export const metadata = staticMetadata({
  title: 'About Us | Dr. Ray Waters & Prevent & Restore PT Marietta',
  description: 'Meet Dr. Ray Waters, DPT, CSCS, CEAS, owner and founder of Prevent & Restore Physical Therapy, and learn about our one-on-one approach to care.',
  path: '/about-us/',
});

const CREDENTIALS = ['Doctor of Physical Therapy (DPT)', 'Certified Strength & Conditioning Specialist (CSCS)', 'Certified Ergonomic Assessment Specialist (CEAS)', 'Functional Movement Screening (FMS)', 'Stecco fascial manipulation'];

const TESTING = [
  { icon: ClipboardList, title: 'Strength and movement assessment', text: 'Using reliable and objective measurement, we run a battery of tests to analyse how well you push, pull, hinge, rotate and brace, plus your balance, stability and control.' },
  { icon: Gauge, title: 'Performance testing', text: 'Applying force plate technology and hand-held dynamometry, we examine how your body produces force and accepts load, including upper and lower body power, tendon stiffness and elasticity, neuromuscular fatigue and dynamic strength index.' },
  { icon: FileBarChart, title: 'Reports and interventions', text: 'You take away a customised report showing where you are strong, where you move well and what could be improved. When it is time to test again, we compare results and track your progress over time.' },
];

function FounderSection() {
  return (
    <section className="container-site grid items-center gap-14 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28" data-testid="about-founder">
      <div className="relative mx-auto w-full max-w-md">
        <div className="absolute -inset-3 -translate-x-4 translate-y-4 rounded-3xl bg-teal-50" aria-hidden />
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image src="/images/ray-waters.webp" alt="Dr. Ray Waters, DPT, CSCS, CEAS" fill priority sizes="(min-width:1024px) 420px, 90vw" className="object-cover object-top" />
        </div>
      </div>
      <div>
        <p className="eyebrow text-teal">Owner and founder</p>
        <h2 className="display mt-3 text-3xl text-navy sm:text-4xl">Dr. Ray Waters</h2>
        <p className="mt-2 font-medium text-slate-500">DPT, CSCS, CEAS</p>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600 md:text-lg">
          <p>Dr. Ray Waters is an outpatient orthopedic physical therapist with a passion for helping people move better and reducing pain. He specializes in the treatment of musculoskeletal injuries, improving athletic performance, and using preventative techniques to stop pain before it starts.</p>
          <p>Dr. Ray has acquired a variety of physical therapy techniques such as practicing a unique Stecco fascial manipulation method, plus certifications in Certified Strength and Conditioning Specialist (CSCS), Functional Movement Screening (FMS) and Certified Ergonomic Assessment Specialist (CEAS).</p>
          <p>He brings extensive experience working with a wide range of individuals — from Division 1 athletes and weekend warriors to those with desk jobs and patients recovering from surgery. Dr. Ray is dedicated to providing personalized care tailored to your unique needs. Let’s work together to reach your full potential and keep you moving well.</p>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2" data-testid="about-credentials">
          {CREDENTIALS.map((c) => <li key={c} className="rounded-full border border-teal/30 bg-teal-50 px-4 py-1.5 text-sm font-medium text-navy">{c}</li>)}
        </ul>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="bg-navy py-20 text-white lg:py-28" data-testid="about-why">
      <div className="container-site grid gap-12 lg:grid-cols-2">
        <SectionHeading light eyebrow="Why Prevent & Restore" title="A different kind of physical therapy experience" />
        <div className="space-y-5 text-base leading-relaxed text-slate-300 md:text-lg">
          <p>If you’ve felt let down by traditional outpatient PT clinics, we’re here to show you a different kind of experience. Prevent &amp; Restore prioritizes patient-centered, one-on-one care designed to empower you and get results.</p>
          <p>With us, you’ll receive a full 60 minutes with a Doctor of Physical Therapy, giving you ample time to understand your condition, ask questions, set goals for your physical therapy treatments, and gain the insights you need to take control of your health.</p>
          <p>Here, you’re the sole focus of our attention — no sharing time with other patients, rushed sessions, or surprise bills as is typical in traditional outpatient clinics. We’re dedicated to not only helping you recover, but also preventing future issues, with all the time and attention you deserve.</p>
        </div>
      </div>
    </section>
  );
}

function TestingSection() {
  return (
    <section className="container-site grid gap-14 py-20 lg:grid-cols-[1.3fr_1fr] lg:py-28" data-testid="about-performance-testing">
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
      <a href="/images/vald-flyer.webp" target="_blank" rel="noopener noreferrer" className="group relative block self-start overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-navy/10" data-testid="about-vald-flyer">
        <Image src="/images/vald-flyer.webp" alt="Prevent & Restore performance testing flyer, powered by VALD Performance" width={1100} height={1553} sizes="(min-width:1024px) 420px, 90vw" className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]" />
        <span className="absolute bottom-4 right-4 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white">View flyer</span>
      </a>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title="Prevent pain. Restore movement." intro="Educate and empower our community to prevent injuries while quickly restoring injured clients from pain so they can continue doing activities they love the most." crumbs={[{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us/' }]} />
      <FounderSection />
      <WhySection />
      <TestingSection />
      <CtaBand />
    </>
  );
}
