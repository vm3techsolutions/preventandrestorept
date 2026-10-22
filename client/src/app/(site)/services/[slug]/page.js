import { notFound } from 'next/navigation';
import ContentDetail from '@/components/site/ContentDetail';
import { getDetail } from '@/lib/siteData';
import { cmsMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const item = await getDetail('services', params.slug);
  return item ? cmsMetadata(item.seo) : {};
}

export default async function ServiceDetailPage({ params }) {
  const item = await getDetail('services', params.slug);
  if (!item) notFound();
  return <ContentDetail item={item} section={{ key: 'service', label: 'Services', href: '/services/' }} related={item.relatedConditions} relatedTitle="Conditions this helps" />;
}
