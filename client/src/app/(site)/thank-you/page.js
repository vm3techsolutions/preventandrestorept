
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Phone } from 'lucide-react';
import { SITE } from '@/lib/site';
import { staticMetadata } from '@/lib/seo';

// export const metadata = staticMetadata({
//   title: 'Thank You | Prevent & Restore Physical Therapy',
//   description:
//     'Thank you for contacting Prevent & Restore Physical Therapy. Your request has been received.',
//   path: '/thank-you/',
// });
export const metadata = staticMetadata({
  title: 'Thank You | Prevent & Restore Physical Therapy',
  description: 'Thank you for contacting Prevent & Restore Physical Therapy.',
  path: '/thank-you/'
  
});

export default function ThankYouPage() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-5 py-20">
      <section
        className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-xl shadow-navy/5 sm:px-12 sm:py-16"
        data-testid="thank-you-page"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-11 w-11 text-teal" />
        </div>

        <p className="eyebrow mt-8 text-teal">
          Request received
        </p>

        <h1 className="display mt-3 text-3xl text-navy sm:text-4xl lg:text-4xl">
          Thank You for Reaching Out!
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
          Thank you for contacting Prevent &amp; Restore Physical Therapy.
          We have received your request and appreciate the opportunity to
          help you move better, feel stronger, and stay active.
        </p>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          A member of our team will review your information and reach out
          to discuss availability, pricing, and the next steps for your care.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="btn-site px-7 py-4"
            data-testid="thank-you-home-btn"
          >
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href={SITE.phoneHref}
            className="btn-site-outline px-7 py-4"
            data-testid="thank-you-phone-btn"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>

        <p className="mt-10 text-sm text-slate-500">
          Prevent &amp; Restore Physical Therapy
          <br />
          East Cobb · Marietta, GA
        </p>
      </section>
    </main>
  );
}
