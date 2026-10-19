import PreviewView from '@/components/admin/PreviewView';

export const metadata = { robots: { index: false, follow: false } };

export default function Page({ params }) {
  return <PreviewView type={params.type} id={params.id} />;
}
