import {
  CalendarClock,
  Dumbbell,
  HeartHandshake,
  MessagesSquare,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { SectionHeading } from '../ui';

const reasons = [
  { icon: UserRound, text: 'You are the sole focus of our attention: no sharing time with other patients and no rushed sessions.' },
  { icon: ReceiptText, text: 'No surprise bills, as is typical in traditional outpatient clinics.' },
  { icon: Dumbbell, text: 'Physical therapy blended with strength and conditioning principles to get you better faster with less chance of reinjury.' },
  { icon: ShieldCheck, text: 'Focused not only on helping you recover, but also on preventing future issues.' }
];

export default function WhyPreventRestore() {
  return (
    <section className="bg-navy py-20 text-white lg:py-28" data-testid="home-why">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          light
          eyebrow="Why Prevent & Restore"
          title="A different kind of physical therapy experience"
          intro="If you’ve felt let down by traditional outpatient PT clinics, we’re here to show you a different kind of experience."
        />
        <ul className="grid gap-4 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-[15px] leading-relaxed text-slate-200">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}