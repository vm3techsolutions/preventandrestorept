import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { listSafe } from '@/lib/siteData';

export const revalidate = 60;

export default async function SiteLayout({ children }) {
  const [services, conditions] = await Promise.all([listSafe('services', { limit: 6 }), listSafe('conditions', { limit: 2 })]);
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main" className="sr-only z-50 rounded-lg bg-teal px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer services={services.data} conditions={conditions.data} />
    </div>
  );
}
