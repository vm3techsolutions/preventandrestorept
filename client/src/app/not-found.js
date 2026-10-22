import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import NotFoundContent from '@/components/site/NotFoundContent';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="flex-1"><NotFoundContent /></main>
      <Footer />
    </div>
  );
}
