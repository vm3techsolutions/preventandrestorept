import { AboutRay, FullCta, HomeHero } from '@/components/site/home/Hero';
import Metrics from '@/components/site/home/Metrics';
import { ApproachSection, WhatWeOffer, WhoWeTreat } from '@/components/site/home/Story';
import { ConditionsSection, FeaturedServices, LatestBlogs } from '@/components/site/home/Featured';
import Testimonials from '@/components/site/home/Testimonials';
import { api } from '@/lib/api';
import { listSafe } from '@/lib/siteData';
import { staticMetadata, jsonLd, absUrl, withSlash } from '@/lib/seo';
import { METRICS, SITE } from '@/lib/site';

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

const reviewsSafe = () => api.public.reviews({ limit: 12 }).then((r) => r.data).catch(() => []);

export default async function HomePage() {
  const [services, conditions, blogs, reviews] = await Promise.all([
    listSafe('services', { limit: 9 }),
    listSafe('conditions', { limit: 12 }),
    listSafe('blogs', { limit: 3 }),
    reviewsSafe(),
  ]);
  const published = new Set([...services.data, ...conditions.data].map((x) => withSlash(x.path)));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(clinicLd)} />
      <HomeHero />
      <AboutRay />
      <Metrics items={METRICS} />
      <WhoWeTreat published={published} />
      <FeaturedServices items={services.data} />
      <ConditionsSection items={conditions.data} />
      <ApproachSection />
      <WhatWeOffer />
      <Testimonials reviews={reviews} />
      <LatestBlogs items={blogs.data} />
      <FullCta />
    </>
  );
}
