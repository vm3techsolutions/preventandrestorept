import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/content/BlockRenderer';
import SmartImage from '@/components/site/SmartImage';
import { CtaBand, PageHero } from '@/components/site/ui';
import { getDetail } from '@/lib/siteData';
import { cmsMetadata, withSlash } from '@/lib/seo';

export const revalidate = 60;

// Developer-managed routes a CMS page can never take over.
const RESERVED = new Set(['about-us', 'services', 'what-we-treat', 'blogs', 'blog', 'contact', 'admin', 'api']);

async function load(slug) {
  if (RESERVED.has(slug)) return null;
  return getDetail('pages', slug);
}

export async function generateMetadata({ params }) {
  const page = await load(params.slug);
  return page ? cmsMetadata(page.seo) : {};
}

export default async function CmsPage({ params }) {
  const page = await load(params.slug);
  if (!page) notFound();
  return (
    <article data-testid="cms-page">
      <PageHero title={page.title} intro={page.excerpt} crumbs={[{ label: 'Home', href: '/' }, { label: page.title, href: withSlash(page.path) }]} />
      <div className="container-site py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          {page.featuredImage && (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
              <SmartImage src={page.featuredImage.url} alt={page.featuredImage.alt || page.title} priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
            </div>
          )}
          <BlockRenderer blocks={page.content} />
        </div>
      </div>
      <CtaBand />
    </article>
  );
}
