import { Mail, MapPin, Navigation, Phone } from 'lucide-react';
import GhlForm from '@/components/site/GhlForm';
import { PageHero } from '@/components/site/ui';
import { SITE, fullAddress } from '@/lib/site';
import { staticMetadata } from '@/lib/seo';

export const metadata = staticMetadata({
  title: 'Contact Us | Request an Appointment | Prevent & Restore PT',
  description: 'Request an appointment with Prevent & Restore Physical Therapy in Marietta, GA. Call (404) 907-2734 or send us a message.',
  path: '/contact/',
});

function InfoItem({ icon: Icon, title, children, testId }) {
  return (
    <div className="flex gap-4" data-testid={testId}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal"><Icon className="h-5 w-5" aria-hidden /></span>
      <div><p className="font-heading font-semibold text-navy">{title}</p><div className="mt-1 text-slate-600">{children}</div></div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s get you moving again" intro="Request an appointment, ask about availability and pricing, or call to speak with a physical therapist." crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact/' }]} />
      <section className="container-site grid gap-12 py-16 lg:grid-cols-[1fr_1.35fr] lg:py-20">
        <div className="space-y-8" data-testid="contact-details">
          <InfoItem icon={Phone} title="Call us" testId="contact-phone"><a href={SITE.phoneHref} className="text-lg font-medium text-teal hover:text-teal-hover">{SITE.phone}</a></InfoItem>
          <InfoItem icon={Mail} title="Email" testId="contact-email"><a href={`mailto:${SITE.email}`} className="break-all font-medium text-teal hover:text-teal-hover">{SITE.email}</a></InfoItem>
          <InfoItem icon={MapPin} title="Visit the clinic" testId="contact-address">
            <address className="not-italic">{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postal}</address>
          </InfoItem>
          <InfoItem icon={Navigation} title="Finding us" testId="contact-directions"><p>{SITE.directions}</p></InfoItem>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe src={SITE.mapEmbed} title={`Map: ${fullAddress()}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0" data-testid="contact-map" />
          </div>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-site-outline" data-testid="contact-directions-link"><Navigation className="h-4 w-4" /> Get directions</a>
        </div>
        <div id="request-appointment" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-navy/5 sm:p-8" data-testid="contact-form-card">
          <p className="eyebrow text-teal">Request appointment</p>
          <h2 className="display mt-3 text-2xl text-navy sm:text-3xl">Send us your details</h2>
          <p className="mt-3 text-slate-600">Complete the form and our team will reach out to schedule your visit.</p>
          <div className="mt-8"><GhlForm /></div>
        </div>
      </section>
    </>
  );
}
