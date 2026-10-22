import { HomeHero, HomeOptions } from '@/components/site/home/Hero';
import { ApproachSection, MissionSection, ProcessSection } from '@/components/site/home/Story';
import { ConditionsSection, FeaturedBlogs, FeaturedServices } from '@/components/site/home/Featured';
import { CtaBand } from '@/components/site/ui';
import { listSafe } from '@/lib/siteData';
import { staticMetadata, jsonLd, absUrl } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const revalidate = 60;

export const metadata = staticMetadata({
  title: 'Prevent & Restore Physical Therapy Marietta | Feel Strong Again',
  description: 'At Prevent & Restore PT in Marietta, GA, we treat you like family. Relieve pain, rebuild strength, and protect your future health. Book today.',
  path: '/',
});

const clinicLd = {
  '@context': 'https://schema.org',
  '@type': 'PhysicalTherapy',
  name: SITE.name,
  url: absUrl('/'),
  telephone: SITE.phone,
  email: SITE.email,
  image: absUrl('/images/logo-stacked.png'),
  address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: SITE.address.city, addressRegion: SITE.address.region, postalCode: SITE.address.postal, addressCountry: 'US' },
};

export default async function HomePage() {
  const [services, conditions, blogs] = await Promise.all([
    listSafe('services', { limit: 6 }),
    listSafe('conditions', { limit: 8 }),
    listSafe('blogs', { limit: 3 }),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(clinicLd)} />
      <HomeHero />
      <HomeOptions />
      <MissionSection />
      <FeaturedServices items={services.data} />
      <ConditionsSection items={conditions.data} />
      <ApproachSection />
      <ProcessSection />
      <FeaturedBlogs items={blogs.data} />
      <CtaBand />
    </>
  );
}
