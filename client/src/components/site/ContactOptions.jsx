import { ArrowRight, CalendarCheck, PhoneCall, Search } from 'lucide-react';
import { SITE } from '@/lib/site';

// Destinations reuse existing workflows: phone line and the existing GHL Request Appointment form.
// Discovery Call has no dedicated form ID yet, so it uses the same form until the client provides one.
const OPTIONS = [
  { key: 'speak', icon: PhoneCall, title: 'Speak With a PT', text: 'Have questions about physical therapy? We would be happy to chat with you so we can be 100% sure that we can help you. Just click the button below to request to speak to us on the phone!', label: 'Speak With a PT', href: SITE.phoneHref },
  { key: 'availability', icon: Search, title: 'Availability & Pricing', text: 'Book an appointment that fits your schedule by clicking the button below and completing a simple form.', label: 'Availability & Pricing', href: '#request-appointment' },
  { key: 'discovery', icon: CalendarCheck, title: 'Discovery Call', text: 'We know deciding to start physical therapy can feel like a big step. Book a free discovery call to discuss your needs and whether physical therapy is right for you. Simply fill out the form below to get started!', label: 'Discovery Call', href: '#request-appointment' },
];

export default function ContactOptions() {
  return (
    <section className="bg-slate-50 py-16 lg:py-20" aria-labelledby="contact-options-heading" data-testid="contact-options">
      <div className="container-site">
        <h2 id="contact-options-heading" className="display mx-auto max-w-3xl text-center text-2xl text-navy sm:text-3xl lg:text-4xl">Wondering If Prevent &amp; Restore Physical Therapy Is Right for You?</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {OPTIONS.map((o) => (
            <article key={o.key} className="card-site flex flex-col p-8" data-testid={`contact-option-${o.key}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal"><o.icon className="h-6 w-6" aria-hidden /></span>
              <h3 className="mt-6 font-heading text-xl font-semibold text-navy">{o.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{o.text}</p>
              <a href={o.href} className="btn-site mt-8 justify-center" data-testid={`contact-option-${o.key}-btn`}>{o.label} <ArrowRight className="h-4 w-4" aria-hidden /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
