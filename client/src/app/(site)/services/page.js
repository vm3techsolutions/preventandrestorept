import { ContentCard } from '@/components/site/Cards';
import { CtaBand, EmptyState, PageHero } from '@/components/site/ui';
import { listSafe } from '@/lib/siteData';
import { staticMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata = staticMetadata({
  title: 'Physical Therapy Services in Marietta, GA | Prevent & Restore PT',
  description: 'Explore physical therapy services at Prevent & Restore PT in Marietta, GA, including manual therapy, dry needling, blood flow restriction therapy and more.',
  path: '/services/',
});

export default async function ServicesPage() {
  const { data } = await listSafe('services', { limit: 50 });
  return (
    <>
      <PageHero eyebrow="Services" title="Our services" intro="One-on-one care that blends hands-on treatment with strength and conditioning to help you recover and stay active." crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }]} />
      <section className="container-site py-16 lg:py-20" data-testid="services-list">
        {data.length
          ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((s, i) => <ContentCard key={s.slug} item={s} index={i} testPrefix="service" />)}</div>
          : <EmptyState title="No services published yet" text="Please check back soon or contact us to learn how we can help." />}
      </section>
      <CtaBand />
    </>
  );
}
