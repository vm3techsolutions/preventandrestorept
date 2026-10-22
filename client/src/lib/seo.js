import { SITE } from './site';

export const withSlash = (p) => (!p || p === '/' || p.endsWith('/') || /[?#]/.test(p) || /\.[a-z0-9]+$/i.test(p) ? p || '/' : `${p}/`);
export const absUrl = (p) => `${SITE.url}${withSlash(p)}`;
const DEFAULT_OG = `${SITE.url}/images/logo-stacked.png`;

// CMS canonical: keep custom values, rebuild the default self-referencing one on this site's domain.
export function canonicalFor(seo) {
  if (!seo?.canonical) return absUrl(seo?.path || '/');
  try {
    if (new URL(seo.canonical).pathname.replace(/\/$/, '') === seo.path) return absUrl(seo.path);
  } catch {
    return absUrl(seo.path);
  }
  return seo.canonical;
}

function build({ title, description, url, image, noindex, type = 'website', extra = {} }) {
  const images = [{ url: image || DEFAULT_OG }];
  return {
    title: { absolute: title },
    description: description || undefined,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: { type, url, title, description: description || undefined, siteName: SITE.name, images, locale: 'en_US', ...extra },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description: description || undefined, images: images.map((i) => i.url) },
  };
}

export const cmsMetadata = (seo, opts = {}) => build({
  title: seo.title, description: seo.description, url: canonicalFor(seo), image: seo.ogImage, noindex: seo.robots?.startsWith('noindex'), ...opts,
});

export const staticMetadata = ({ title, description, path }) => build({ title, description, url: absUrl(path) });

export const jsonLd = (data) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });
