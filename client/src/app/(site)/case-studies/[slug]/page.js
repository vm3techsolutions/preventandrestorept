import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import CaseStudyBody from '@/components/site/CaseStudyBody';
import { CtaBand, PageHero } from '@/components/site/ui';

import { formatDate, getDetail } from '@/lib/siteData';
import { cmsMetadata, withSlash } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const revalidate = 100;

export async function generateMetadata({ params }) {
  const cs = await getDetail('caseStudies', params.slug);

  return cs ? cmsMetadata(cs.seo, { type: 'article' }) : {};
}

// Related case studies sidebar
function CaseStudySidebar({ cs }) {
  if (!cs.related?.length) return null;

  return (
    <aside>
      <section
        className="rounded-2xl border border-slate-200 bg-white p-6"
        data-testid="related-case-studies"
      >
        <p className="eyebrow text-teal">
          Related Case Studies
        </p>

        <ul className="mt-4 space-y-1">
          {cs.related.map((item) => (
            <li key={item.slug}>
              <Link
                href={withSlash(item.path)}
                className="group flex items-center justify-between gap-3 rounded-lg px-3 py-3 font-medium text-navy transition-colors hover:bg-teal-50 hover:text-teal"
              >
                <span>{item.title}</span>

                <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default async function CaseStudyPage({ params }) {
  const cs = await getDetail('caseStudies', params.slug);

  if (!cs) notFound();

  return (
    <article
      className="bg-slate-50"
      data-testid="case-study-detail"
    >
      {/* Hero with featured image background */}
      <PageHero 
        // eyebrow="Case Study"
        title={cs.title}
        // intro={cs.summary}
        image={cs.featuredImage?.url}
        imageOverlay="bg-gradient-to-r from-[#001D39]/95 via-[#001D39]/75 to-[#001D39]/35"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Case Studies', href: '/case-studies/' },
          {
            label: cs.title,
            href: withSlash(cs.path),
          },
        ]}
      >
        {cs.publishedAt && (
          <p className="mt-5 text-[16px] text-slate-200 pt-10">
            Published{' '}
            <time dateTime={cs.publishedAt}>
              {formatDate(cs.publishedAt)}
            </time>
          </p>
        )}

        <Link
          href={SITE.appointmentHref}
          className="btn-site mt-8"
          data-testid="case-study-hero-cta"
        >
          Request Appointment
        </Link>
      </PageHero>

      <section className="container-site py-10">
        {/* <h2 className="display text-2xl text-navy sm:text-2xl">{cs.title}</h2> */}
        <p className="mt-4 text-lg text-slate-600">{cs.summary}</p>
      </section>

      {/* Case Study Content */}
      <div className="container-site grid gap-10 pb-6 sm:pb-14 lg:grid-cols-[minmax(0,1fr)] lg:gap-5 lg:pb-8">
        <main className="min-w-0">
          <CaseStudyBody cs={cs} />
        </main>

        <div className="min-w-0">
          <CaseStudySidebar cs={cs} />
        </div>
      </div>

      {/* Bottom CTA */}
      <CtaBand
        heading={cs.cta?.heading || undefined}
        label={cs.cta?.label || undefined}
        url={
          cs.cta?.url
            ? withSlash(cs.cta.url)
            : undefined
        }
      />
    </article>
  );
}