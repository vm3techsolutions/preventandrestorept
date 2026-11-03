import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import RevealInit from '@/components/site/RevealInit';
import MetaPixel from '@/components/site/MetaPixel';
import { getDetail, listSafe } from '@/lib/siteData';

export const revalidate = 60;

const slim = (list) => list.map(({ slug, title, path }) => ({ slug, title, path }));

// The mega menu lists each region's on-page condition sections.
const withSections = (list) => Promise.all(list.map(async (r) => {
  const d = await getDetail('conditions', r.slug).catch(() => null);
  return { ...r, sections: (d?.sections || []).map(({ heading, anchor }) => ({ heading, anchor })) };
}));

export default async function SiteLayout({ children }) {
  const [services, conditions] = await Promise.all([listSafe('services', { limit: 50 }), listSafe('conditions', { limit: 50 })]);
  const s = slim(services.data);
  const c = await withSections(slim(conditions.data));
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main" className="sr-only z-50 rounded-lg bg-teal px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <Header services={s} conditions={c} />
      <main id="main" className="flex-1">{children}</main>
      <Footer services={s} conditions={c} />
      <RevealInit />
      <MetaPixel />
    </div>
  );
}
