# PRD: Prevent & Restore Physical Therapy CMS

## Original problem statement
Build the complete admin CMS and backend for a physical therapy website for Prevent & Restore Physical Therapy (https://www.preventandrestorept.com/). This is Part 1 of a two-part project. Build the admin system and backend first, with a stable API contract the public frontend can use in Part 2. Keep using the same project for Part 2.
Stack: Next.js App Router (JS only), Tailwind, Redux Toolkit + React Redux, Node/Express, PostgreSQL + Prisma, Amazon S3, REST, a centralized API client (client/src/lib/api.js), secure admin auth with bcrypt, and Lucide icons.
Branding: Blair ITC Std / Futura PT; colors #007791, #001D39, #FFFFFF, #0094B2.
Requirements: setup-token admin creation (expiring, disabled after the first admin), login/logout/session expiry, a dashboard with real counts, and CMS modules for Blogs (block editor, drag-and-drop, SEO, slug + 301), Services, What We Treat, Pages (reserved routes), Categories/Tags/Authors, URL Redirects (loop/chain validation, legacy URLs), S3 media, sitemap, public APIs, and Redux slices. Seed 2 blogs, 7 services and 13 conditions from the existing site. No Reviews module. Do not invent business claims. Provide env examples, setup/migration/seed/deploy docs and a checklist of credentials.

## User choices
- Run the real stack in the preview (embedded PostgreSQL)
- S3 support with a local-disk fallback until AWS is configured
- Copy seed images from the existing site
- Setup token expiry: 24h

## Architecture
- /app/server: Express 5 + Prisma 5 + PostgreSQL. Generic content controller factory (src/content/types.js holds the per-type config), taxonomy factory, redirects service, storage service (S3 or local), zod validation, sanitize-html.
- /app/client: Next.js 14 App Router. Admin under /admin, Redux Toolkit slices (auth, dashboard, blogs, services, conditions, pages, categories, tags, authors), dnd-kit.
- Preview shim: backend/server.py proxies /api to Express on :5000 and boots the embedded Postgres (server/.pgdata, port 5433). frontend/package.json start runs the client.

## Implemented (2026-10-19)
- Auth: setup token (sha256 stored, 24h), bcrypt 12 rounds, JWT httpOnly cookie (8h), sessionVersion invalidation, lockout after 5 failures, rate limit, origin guard
- Dashboard, all CMS modules, block editor, previews, trash/restore, reorder, SEO panel, 301 on slug change, redirect manager, settings, authors, media upload
- Public API, sitemap.xml/json, redirect resolve, versioned aliases under /api/v1
- Seed data from the legacy WordPress site (scripts/scrape_legacy.py → prisma/seed-data/legacy.json) plus 9 legacy redirects
- Testing: backend 33/33 pass, all frontend flows pass (iteration_1). Fixed afterwards: cross-domain login (relative /api base + CLIENT_URL), javascript: URL rejection in blocks, toggle styling, pages publishing panel

## Implemented (2026-10-21)
- Login: password eye toggle, required/format validation, server error cleared on edit
- Admin management: /admin/admins list (ID, name, email, status, created), add admin (validated, unique email, bcrypt 12), activate/deactivate others (deactivation bumps sessionVersion; cannot change self or deactivate the last active admin, checked in a serializable transaction). requireAuth rejects inactive admins; login returns 403 for deactivated
- Audit trail on blogs/services/treatments: created_by_id/updated_by_id from the session only (migration 20261021105132_admin_management_audit), shown in the editor sidebar. Testing iteration_2: 100% backend + frontend
- "Last updated by" column in blog/service/condition lists; admin password reset for other admins (PUT /api/admin/admins/:id/password, signs the target out); eye toggle on every password field; Change password has confirm + inline validation; admin recovery CLI `yarn admin list|activate|reset-password|create`. Testing iteration_3: 100%
- Owner protection (is_owner, migration 20261022100631_owner_and_activity_log marks the lowest-ID admin; setup and the first CLI-created admin become owner; non-owners get 403 on owner reset/deactivate) and Activity Log (activity_logs table, logActivity service on all admin mutations, /admin/activity page with admin/area/action/date/search filters)

## Part 2 request (2026-10-22, user's words, abridged)
"Continue in the same Emergent project from Part 1... Now build the complete public-facing website and connect it to the existing backend APIs." Pages: Home, About Us, Services (+detail), What We Treat (+detail), Blogs (+detail, pagination, category/tag filter), Contact (keep the existing GoHighLevel form), CMS pages /[slug]/. SEO via Metadata API, canonical, OG, sitemap, robots, 404s, 301 legacy redirects. Reuse the Redux store and api.js. No Reviews. Do not invent credentials, testimonials or claims. Assets supplied: logo, Dr. Ray headshot, VALD flyer.

## Implemented (2026-10-22) - Part 2 public site
- client/src/app/(site): home, about-us, services, what-we-treat, blogs, contact, [slug] (reserved guard), not-found, error. Root not-found, sitemap.js, robots.js, admin/layout.js (noindex)
- components/site: Header (Redux site slice for the mobile nav), Footer, ui (PageHero, CtaBand, Breadcrumbs+JSON-LD, ArcMotif), Cards, ContentDetail, FaqList (FAQPage JSON-LD), GhlForm (form BEGJvO6gNANPojCjlhqB), SmartImage (next/image)
- lib: site.js (clinic details), seo.js (metadata, canonicals with trailing slash), siteData.js; api.js gets API_INTERNAL_URL for SSR plus revalidate 60 on public calls
- middleware.js: 301s from the CMS redirects table (cached 60s), plus /blog -> /blogs. next.config: trailingSlash, image remotePatterns from env
- Server: blog public path /blog -> /blogs (types.js, seed, DB redirects), sitemap static routes; 7 new legacy redirects (form pages -> /contact, team/why pages -> /about-us)
- Logo lockups generated in client/public/images
- Testing iteration_5: backend 145/145, frontend all flows pass. Fixed afterwards: home shows all services, footer has its own conditions column, blog cards are fully clickable, /blog/ 301s, out-of-range blog pages return 404, credentials made consistent

## Backlog
- P1: clinic hours (unverified), separate GHL form IDs for Speak with a PT / Discovery Call, service images, licensed fonts, remove the leftover authoring line in the IT band post, NEXT_PUBLIC_SITE_URL/MEDIA_HOSTS for prod
- P1: client credentials (AWS, prod DB, fonts), content for the 8 draft conditions, featured images
- P2: block manual redirects that shadow live content, media library browser, scheduled-publish indicator
