import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/content/BlockRenderer';
import SmartImage from '@/components/site/SmartImage';
import { BlogCard } from '@/components/site/Cards';
import { CtaBand, PageHero } from '@/components/site/ui';
import { formatDate, getDetail } from '@/lib/siteData';
import { absUrl, canonicalFor, cmsMetadata, jsonLd, withSlash } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const post = await getDetail('blogs', params.slug);
  if (!post) return {};
  return cmsMetadata(post.seo, {
    type: 'article',
    extra: { publishedTime: post.publishedAt || undefined, modifiedTime: post.updatedAt, authors: post.author ? [post.author.name] : undefined, tags: post.tags.map((t) => t.name) },
  });
}

function Byline({ post }) {
  const updated = post.updatedAt && post.publishedAt && formatDate(post.updatedAt) !== formatDate(post.publishedAt);
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300" data-testid="blog-byline">
      {post.author && <span>By <span className="font-semibold text-white">{post.author.name}</span>{post.author.credentials && `, ${post.author.credentials}`}</span>}
      {post.publishedAt && <span>Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></span>}
      {updated && <span>Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time></span>}
    </div>
  );
}

function AuthorBox({ author }) {
  if (!author) return null;
  return (
    <div className="mt-14 flex flex-col gap-5 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:items-center" data-testid="blog-author-box">
      {author.slug === 'ray-waters' && <Image src="/images/ray-waters.webp" alt={author.name} width={80} height={80} className="h-20 w-20 rounded-full object-cover object-top" />}
      <div>
        <p className="eyebrow text-teal">Written by</p>
        <p className="mt-1 font-heading text-lg font-semibold text-navy">{author.name}{author.credentials && <span className="font-body text-base font-normal text-slate-500">, {author.credentials}</span>}</p>
        <Link href="/about-us/" className="mt-1 inline-block text-sm font-medium text-teal hover:text-teal-hover">About our clinic</Link>
      </div>
    </div>
  );
}

export default async function BlogDetailPage({ params }) {
  const post = await getDetail('blogs', params.slug);
  if (!post) notFound();
  const url = canonicalFor(post.seo);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo.description,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt,
    mainEntityOfPage: url,
    image: post.seo.ogImage || absUrl('/images/logo-stacked.png'),
    author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absUrl('/images/logo-stacked.png') } },
  };
  return (
    <article data-testid="blog-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <PageHero title={post.title} crumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs/' }, { label: post.title, href: withSlash(post.path) }]}>
        {post.categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.categories.map((c) => <Link key={c.slug} href={`/blogs/?category=${c.slug}`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-100 hover:bg-white/20">{c.name}</Link>)}
          </div>
        )}
        <Byline post={post} />
      </PageHero>
      <div className="container-site py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          {post.featuredImage && (
            <figure className="mb-12">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                <SmartImage src={post.featuredImage.url} alt={post.featuredImage.alt || post.title} priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" testId="blog-featured-image" />
              </div>
              {post.featuredImage.caption && <figcaption className="mt-3 text-center text-sm text-slate-500">{post.featuredImage.caption}</figcaption>}
            </figure>
          )}
          {post.introduction && <p className="mb-8 text-xl leading-relaxed text-navy" data-testid="blog-introduction">{post.introduction}</p>}
          <BlockRenderer blocks={post.blocks} />
          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2" data-testid="blog-tags">
              {post.tags.map((t) => <Link key={t.slug} href={`/blogs/?tag=${t.slug}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-navy hover:bg-teal-50 hover:text-teal">#{t.name}</Link>)}
            </div>
          )}
          <AuthorBox author={post.author} />
        </div>
      </div>
      {post.related.length > 0 && (
        <section className="bg-slate-50 py-16 lg:py-20" aria-labelledby="related-heading" data-testid="related-articles">
          <div className="container-site">
            <h2 id="related-heading" className="display text-2xl text-navy sm:text-3xl">Related articles</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{post.related.map((r) => <BlogCard key={r.slug} post={r} />)}</div>
          </div>
        </section>
      )}
      <CtaBand />
    </article>
  );
}
