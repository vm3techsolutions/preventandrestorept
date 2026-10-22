import NotFoundContent from '@/components/site/NotFoundContent';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

export default function NotFound() {
  return <NotFoundContent />;
}
