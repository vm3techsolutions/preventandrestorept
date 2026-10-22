import { BlogCard, ContentCard } from '../Cards';
import { EmptyState, MoreLink, SectionHeading } from '../ui';

function Header({ eyebrow, title, intro, href, label, testId }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
      <MoreLink href={href} testId={testId}>{label}</MoreLink>
    </div>
  );
}

export function FeaturedServices({ items }) {
  return (
    <section className="bg-slate-50 py-20 lg:py-28" data-testid="home-services">
      <div className="container-site">
        <Header eyebrow="Services" title="Treatment built around you" intro="Hands-on care and evidence-based training to help you move better and stay that way." href="/services/" label="All services" testId="home-all-services-link" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length ? items.map((s, i) => <ContentCard key={s.slug} item={s} index={i} testPrefix="service" />) : <div className="sm:col-span-2 lg:col-span-3"><EmptyState title="Services are being updated" text="Please check back soon or call us to learn more." /></div>}
        </div>
      </div>
    </section>
  );
}

export function ConditionsSection({ items }) {
  return (
    <section className="bg-white py-20 lg:py-28" data-testid="home-conditions">
      <div className="container-site">
        <Header eyebrow="What we treat" title="Conditions we help with" href="/what-we-treat/" label="All conditions" testId="home-all-conditions-link" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.length ? items.map((c, i) => <ContentCard key={c.slug} item={c} index={i} testPrefix="condition" />) : <div className="sm:col-span-2 lg:col-span-4"><EmptyState title="Conditions are being updated" /></div>}
        </div>
      </div>
    </section>
  );
}

export function FeaturedBlogs({ items }) {
  if (!items.length) return null;
  return (
    <section className="bg-slate-50 py-20 lg:py-28" data-testid="home-blogs">
      <div className="container-site">
        <Header eyebrow="From the blog" title="Learn more about your body" href="/blogs/" label="All articles" testId="home-all-blogs-link" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => <BlogCard key={p.slug} post={p} />)}
        </div>
      </div>
    </section>
  );
}
