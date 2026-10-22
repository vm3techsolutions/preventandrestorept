import { NextResponse } from 'next/server';
import { withSlash } from '@/lib/seo';

// 301s from the CMS URL Redirects table (Part 1), cached in memory for 60s.
const BASE = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
const TTL = 60_000;
let cache = { at: 0, map: null };

async function redirectMap(origin) {
  if (cache.map && Date.now() - cache.at < TTL) return cache.map;
  const base = /^https?:\/\//i.test(BASE) ? BASE : `${origin}${BASE}`;
  try {
    const res = await fetch(`${base}/public/redirects?limit=1000`, { cache: 'no-store' });
    const json = await res.json();
    cache = { at: Date.now(), map: new Map((json.data || []).map((r) => [r.fromPath, r])) };
  } catch {
    cache = { at: Date.now() - TTL + 10_000, map: cache.map || new Map() };
  }
  return cache.map;
}

export async function middleware(req) {
  const path = req.nextUrl.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  let to = null;
  let status = 301;
  if (path === '/blog') to = '/blogs';
  else if (path.startsWith('/blog/')) to = `/blogs/${path.slice(6)}`;
  else {
    const hit = (await redirectMap(req.nextUrl.origin)).get(path);
    if (hit) {
      to = hit.toPath;
      status = hit.statusCode || 301;
    }
  }
  if (!to || to.replace(/\/+$/, '') === path) return NextResponse.next();
  const url = /^https?:\/\//i.test(to) ? new URL(to) : new URL(withSlash(to), req.nextUrl.origin);
  return NextResponse.redirect(url, status);
}

export const config = {
  matcher: ['/((?!_next/|api/|admin|images/|fonts/|icon|favicon|robots.txt|sitemap.xml).*)'],
};
