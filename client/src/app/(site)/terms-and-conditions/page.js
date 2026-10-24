import Link from 'next/link';
import LegalPage from '@/components/site/LegalPage';
import { staticMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata = {
  ...staticMetadata({
    title: 'Terms & Conditions | Prevent & Restore Physical Therapy',
    description: 'Terms and conditions for using the Prevent & Restore Physical Therapy website.',
    path: '/terms-and-conditions/',
  }),
  robots: { index: false, follow: true },
};

const SECTIONS = [
  'Acceptance of these terms',
  'Use of this website',
  'Medical information disclaimer',
  'Appointments, cancellations and payments',
  'Intellectual property',
  'Third-party links and services',
  'Limitation of liability',
  'Governing law',
  'Changes to these terms',
];

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" path="/terms-and-conditions/" draft>
      <p>The approved Terms &amp; Conditions for {SITE.name} will appear here. The sections below are an outline only; each needs text written or approved by the clinic and its legal advisor.</p>
      {SECTIONS.map((s) => (
        <section key={s}>
          <h2>{s}</h2>
          <p className="italic text-slate-500">[Approved text required]</p>
        </section>
      ))}
      <h2>Contact us</h2>
      <p>Questions about these terms? Call <a href={SITE.phoneHref}>{SITE.phone}</a>, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or visit our <Link href="/contact/">contact page</Link>.</p>
    </LegalPage>
  );
}
