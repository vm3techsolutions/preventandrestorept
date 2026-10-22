import Link from 'next/link';
import { BlogCard } from '@/components/site/Cards';
import { CtaBand, EmptyState, PageHero } from '@/components/site/ui';
import { api } from '@/lib/api';
import { listSafe } from '@/lib/siteData';
import { absUrl, staticMetadata } from '@/lib/seo';

export const revalidate = 60;
const PER_PAGE = 9;

const hrefFor = (q) => {
  const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v && v !== 1 && v !== '1'));
  return `/blogs/${p.toString() ? `?${p}` : ''}`;
};

export function generateMetadata({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const meta = staticMetadata({
    title: page > 1 ? `Physical Therapy Blog – Page ${page} | Prevent & Restore PT` : 'Physical Therapy Blog | Prevent & Restore PT Marietta',
    description: 'Articles from Prevent & Restore Physical Therapy on pain, injury recovery, movement and prevention.',
    path: '/blogs/',
  });
  if (page > 1 && !searchParams.category && !searchParams.tag) meta.alternates.canonical = `${absUrl('/blogs/')}?page=${page}`;
  return meta;
}

const safeTax = (fn) => fn().then((r) => r.data).catch(() => []);

function Chip({ href, active, children, testId }) {
  return (
    <Link href={href} scroll={false} data-testid={testId} aria-current={active ? 'true' : undefined}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? 'bg-navy text-white' : 'bg-slate-100 text-navy hover:bg-teal-50 hover:text-teal'}`}>
      {children}
    </Link>
  );
}

function Pagination({ page, totalPages, q }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2" data-testid="blog-pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={hrefFor({ ...q, page: n })} aria-current={n === page ? 'page' : undefined} data-testid={`blog-page-${n}`}
          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${n === page ? 'bg-teal text-white' : 'bg-slate-100 text-navy hover:bg-teal-50'}`}>{n}</Link>
      ))}
    </nav>
  );
}

export default async function BlogsPage({ searchParams }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = { category: searchParams.category || '', tag: searchParams.tag || '' };
  const [posts, categories, tags] = await Promise.all([
    listSafe('blogs', { page, limit: PER_PAGE, category: q.category, tag: q.tag }),
    safeTax(api.public.blogs.categories),
    safeTax(api.public.blogs.tags),
  ]);
  const showFilters = categories.length > 1 || tags.length > 0;
  return (
    <>
      <PageHero eyebrow="Blog" title="Insights for moving better" intro="Practical articles on pain, injury recovery and prevention from our physical therapy team." crumbs={[{ label: 'Home', href: '/' }, { label: 'Blogs', href: '/blogs/' }]} />
      <section className="container-site py-16 lg:py-20" data-testid="blogs-list">
        {showFilters && (
          <div className="mb-12 space-y-4" data-testid="blog-filters">
            <div className="flex flex-wrap gap-2">
              <Chip href="/blogs/" active={!q.category && !q.tag} testId="blog-filter-all">All articles</Chip>
              {categories.map((c) => <Chip key={c.slug} href={hrefFor({ category: c.slug })} active={q.category === c.slug} testId={`blog-filter-category-${c.slug}`}>{c.name}</Chip>)}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">Tags:</span>
                {tags.map((t) => <Chip key={t.slug} href={hrefFor({ tag: t.slug })} active={q.tag === t.slug} testId={`blog-filter-tag-${t.slug}`}>#{t.name}</Chip>)}
              </div>
            )}
          </div>
        )}
        {posts.data.length
          ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.data.map((p, i) => <BlogCard key={p.slug} post={p} priority={i < 3} />)}</div>
          : <EmptyState title="No articles found" text={q.category || q.tag ? 'Try a different filter.' : 'New articles are coming soon.'} testId="blogs-empty" />}
        <Pagination page={page} totalPages={posts.pagination?.totalPages || 1} q={q} />
      </section>
      <CtaBand />
    </>
  );
}
