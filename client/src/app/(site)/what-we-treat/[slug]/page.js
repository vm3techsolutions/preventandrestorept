import { notFound } from 'next/navigation';
import ContentDetail from '@/components/site/ContentDetail';
import RegionDetail from '@/components/site/region/RegionDetail';
import { getDetail } from '@/lib/siteData';
import { cmsMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const item = await getDetail('conditions', params.slug);
  return item ? cmsMetadata(item.seo) : {};
}

export default async function ConditionDetailPage({ params }) {
  const item = await getDetail('conditions', params.slug);
  if (!item) notFound();
  if (item.sections?.length) return <RegionDetail item={item} />;
  return <ContentDetail item={item} section={{ key: 'condition', label: 'What We Treat', href: '/what-we-treat/' }} related={item.relatedServices} relatedTitle="Services that help" />;
}
