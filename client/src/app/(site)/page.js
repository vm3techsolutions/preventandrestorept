import { AboutRay, FullCta, HomeHero } from '@/components/site/home/Hero';
import Metrics from '@/components/site/home/Metrics';
import { ApproachSection, WhatWeOffer, WhoWeTreat } from '@/components/site/home/Story';
import { ConditionsSection, FeaturedServices, LatestBlogs } from '@/components/site/home/Featured';
import { listSafe } from '@/lib/siteData';
import { staticMetadata, jsonLd, absUrl } from '@/lib/seo';
import { METRICS, SITE } from '@/lib/site';
import GoogleReviews from '@/components/site/home/GoogleReviews';
import WhyPreventRestore from '@/components/site/home/WhyPreventAndRestore';
import { AboutCompany } from '@/components/site/home/AboutCompany';

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
    listSafe('services', { limit: 9 }),
    listSafe('conditions', { limit: 12 }),
    listSafe('blogs', { limit: 3 }),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(clinicLd)} />
      <HomeHero />
      {/* <AboutRay /> */}
      <AboutCompany/>
      <Metrics items={METRICS} />
      <WhoWeTreat />
      <WhyPreventRestore/>
      <FeaturedServices items={services.data} />
      <ConditionsSection items={conditions.data} />
      <ApproachSection />
      <WhatWeOffer />
      <LatestBlogs items={blogs.data} />
      <GoogleReviews/>
      <FullCta />
    </>
  );
}
