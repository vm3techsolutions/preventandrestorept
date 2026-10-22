import { ContentCard } from '@/components/site/Cards';
import { CtaBand, EmptyState, PageHero } from '@/components/site/ui';
import { listSafe } from '@/lib/siteData';
import { staticMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata = staticMetadata({
  title: 'What We Treat | Prevent & Restore Physical Therapy Marietta',
  description: 'Back and sciatica pain, shoulder and neck pain, knee pain, foot and ankle pain, sports injuries and more. See the conditions we treat in Marietta, GA.',
  path: '/what-we-treat/',
});

export default async function ConditionsPage() {
  const { data } = await listSafe('conditions', { limit: 50 });
  return (
    <>
      <PageHero eyebrow="What we treat" title="Conditions we treat" intro="We find the root cause of your pain, restore strength and mobility, and help prevent it from coming back." crumbs={[{ label: 'Home', href: '/' }, { label: 'What We Treat', href: '/what-we-treat/' }]} />
      <section className="container-site py-16 lg:py-20" data-testid="conditions-list">
        {data.length
          ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((c, i) => <ContentCard key={c.slug} item={c} index={i} testPrefix="condition" />)}</div>
          : <EmptyState title="No conditions published yet" text="Please check back soon or contact us to ask about your condition." />}
      </section>
      <CtaBand />
    </>
  );
}
