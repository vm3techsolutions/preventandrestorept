import { absUrl } from '@/lib/seo';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }],
    sitemap: absUrl('/sitemap.xml'),
  };
}
