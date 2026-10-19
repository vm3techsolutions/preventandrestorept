const env = require('../config/env');
const { getGeneralSettings } = require('../services/settings');

const truncate = (s, n) => {
  const t = String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t;
};

const absolute = (url) => (!url ? null : /^https?:\/\//i.test(url) ? url : `${env.siteUrl}${url.startsWith('/') ? '' : '/'}${url}`);

async function buildSeo({ title, seoTitle, metaDescription, fallbackDescription, canonicalUrl, noindex, path, image, keyword }) {
  const s = await getGeneralSettings();
  return {
    title: seoTitle || `${title} | ${s.siteName}`,
    description: truncate(metaDescription || fallbackDescription || s.defaultMetaDescription, 160),
    canonical: canonicalUrl || `${env.siteUrl}${path}`,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    keyword: keyword || null,
    ogImage: absolute(image || s.defaultOgImage),
    path,
  };
}

module.exports = { buildSeo, truncate, absolute };
