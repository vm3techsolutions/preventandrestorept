import Link from 'next/link';
import { ArcMotif } from './ui';

export default function NotFoundContent() {
  return (
    <section className="relative overflow-hidden bg-navy text-white" data-testid="not-found-page">
      <ArcMotif className="-right-20 top-0 h-[520px] w-[520px] text-white/[0.05]" />
      <div className="container-site relative py-28 sm:py-36">
        <p className="eyebrow text-teal-100">Error 404</p>
        <h1 className="display mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">Page not found</h1>
        <p className="mt-6 max-w-xl text-base text-slate-300 md:text-lg">The page you are looking for has moved or no longer exists.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-site" data-testid="not-found-home-link">Back to home</Link>
          <Link href="/services/" className="btn-site-ghost-light">Our services</Link>
          <Link href="/contact/" className="btn-site-ghost-light">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
