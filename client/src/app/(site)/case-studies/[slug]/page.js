import Link from 'next/link';
import { notFound } from 'next/navigation';
import SmartImage from '@/components/site/SmartImage';
import CaseStudyBody from '@/components/site/CaseStudyBody';
import { CtaBand, PageHero } from '@/components/site/ui';
import { formatDate, getDetail } from '@/lib/siteData';
import { cmsMetadata, withSlash } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const cs = await getDetail('caseStudies', params.slug);
  return cs ? cmsMetadata(cs.seo, { type: 'article' }) : {};
}

export default async function CaseStudyPage({ params }) {
  const cs = await getDetail('caseStudies', params.slug);
  if (!cs) notFound();
  return (
    <article data-testid="case-study-detail">
      <PageHero title={cs.title} intro={cs.summary} crumbs={[{ label: 'Home', href: '/' }, { label: 'Case Studies', href: '/case-studies/' }, { label: cs.title, href: withSlash(cs.path) }]}>
        {cs.publishedAt && <p className="mt-6 text-sm text-slate-300">Published <time dateTime={cs.publishedAt}>{formatDate(cs.publishedAt)}</time></p>}
      </PageHero>
      <div className="container-site py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          {cs.featuredImage && (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
              <SmartImage src={cs.featuredImage.url} alt={cs.featuredImage.alt || cs.title} priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
            </div>
          )}
          <CaseStudyBody cs={cs} />
          {cs.related.length > 0 && (
            <section className="mt-16" aria-labelledby="related-cases">
              <h2 id="related-cases" className="display text-2xl text-navy">More case studies</h2>
              <ul className="mt-5 space-y-2">{cs.related.map((r) => <li key={r.slug}><Link href={withSlash(r.path)} className="font-medium text-teal hover:text-teal-hover">{r.title}</Link></li>)}</ul>
            </section>
          )}
        </div>
      </div>
      <CtaBand />
    </article>
  );
}
