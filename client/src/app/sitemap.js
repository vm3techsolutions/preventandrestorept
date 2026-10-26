import { api } from '@/lib/api';
import { absUrl } from '@/lib/seo';

export const revalidate = 300;

const STATIC = ['/', '/about-us', '/services', '/what-we-treat', '/blogs', '/contact', '/privacy-policy'];

// Published, indexable content only (filtered by the Part 1 sitemap API).
export default async function sitemap() {
  try {
    const { data } = await api.public.sitemap();
    return data.map((e) => ({ url: absUrl(new URL(e.loc).pathname || '/'), lastModified: e.lastmod || undefined }));
  } catch {
    return STATIC.map((p) => ({ url: absUrl(p) }));
  }
}
