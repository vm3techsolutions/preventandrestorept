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

## Implemented (2026-10-24) - Homepage refinement, reviews, legal pages
- Homepage re-ordered into 12 sections plus the footer: hero with a stock video, About Dr. Ray, Metrics (PLACEHOLDER numbers the client asked for), Who We Treat, Services (stock photos as a fallback), What We Treat (titles only), Approach, What We Offer, Testimonials (CMS Reviews), Latest Blogs, full-width CTA. The 3 option cards were removed
- Header: Services and What We Treat dropdowns (mouse, keyboard, touch, Escape, ArrowDown), sticky with a shadow on scroll, mobile submenus
- Footer: Explore, Services, What We Treat and contact columns; social icons (Instagram, LinkedIn, Yelp search link); Privacy, Terms and CMS Login; appointment button and disclaimer sentence removed
- /privacy-policy (existing live text) and /terms-and-conditions (draft, noindex)
- New Review model and migration, admin /admin/reviews CRUD with activity log, public /api/public/reviews. Dashboard "New blog" button removed
- Testing iteration_6: backend 21/21 (full suite 142/143, 1 skip). The dropdown click/touch bug it found is fixed and was verified with Playwright

## Implemented (2026-10-26) - Carousels and footer socials
- Home Services and What We Treat are now carousels (CardCarousel.jsx): 3 cards from 1024px up, 2 on tablet, about 1 on mobile; arrows disable at each end; native touch swipe. Conditions show image, title, description and Read More, with licensed stock images where the CMS has none
- Latest Blogs cards are equal height with clamped text
- Footer socials: Facebook (hidden until a URL is provided), Instagram, Google Business Profile and Yelp; LinkedIn removed. CMS Login opens in a new tab
- Testing iteration_7: frontend about 97%; optional focus-ring and duplicate-image notes were fixed afterwards

## Implemented (2026-10-26) - About, Contact and footer credit
- About: Meet the Team section (TEAM array; members without a photo get a neutral placeholder) replaces the old founder block; Why section now shows 7 icon points from verified copy; the VALD flyer was replaced with a licensed stock photo (performance-testing.webp)
- Contact: "Wondering If..." section with 3 option cards (Speak With a PT = phone; Availability & Pricing and Discovery Call = the existing GHL Request Appointment form; a dedicated Discovery Call form ID is still needed)
- Footer credit: "Designed and developed by VM3 Tech Solutions LLP"

## Implemented (2026-10-29) - Body regions, 8 services, case studies, auto-slug
- 11 body-region pages (/what-we-treat/{neck-pain, shoulder-pain, elbow-pain, low-back-pain, hip-pain, knee-pain, ankle-foot-pain, headaches, tmj, muscle-strains, nerve-pain}) with CMS condition sections; published with needsReview per the client
- Records reused: back-sciatica-pain becomes low-back-pain, shoulder-neck-pain becomes shoulder-pain, foot-ankle-pain becomes ankle-foot-pain, knee-pain kept, headaches kept, jaw-pain becomes tmj, numbness-and-tingling becomes nerve-pain; sports-injuries archived with a 301 to muscle-strains
- Services merged: functional-dry-needling becomes dry-needling, pain-prevention-seminars becomes injury-prevention-workshops, exercise-performance-and-programming becomes remote-strength-and-conditioning; new physical-therapy, in-person-personal-training, shockwave-therapy and injury-prevention-screening (needsReview)
- Case studies CMS and public pages; one DRAFT example (noindex)
- Reviews admin module removed (table kept)

## Implemented (2026-11-02) - Layout updates (frontend only)
- Header: Case Studies added after Blogs
- Home: scroll-driven sticky Services (first 7 in CMS order, ServicesScroll.jsx); Who We Help is informational and non-clickable
- Service detail: image hero with blue overlay and CTA, slate background; blog detail: featured-image hero
- Body-region pages: RegionDetail with hero, Understanding intro, sticky ConditionSelector, per-condition sections (H2/H3), FAQ, CTA. Description paragraphs starting "Causes:" or "Daily life:" become their own subsections
- Footer Facebook link set
- Stock image maps in lib/stockImages.js
- Testing iteration_9: all flows passed
- 2026-11-02: Header and Who We Help matched to the client's screenshots
  - Services mega menu: numbered 2-column list
  - What We Treat mega menu: region list + condition panel, links go to region#anchor; layout.js fetches each region's sections
  - Header and mobile CTA renamed "Book an Appointment"; phone link shows only at 2xl
  - Who We Help bento grid with new stock run-*.webp images; cards stay non-clickable
  - Testing iteration_10: all flows passed
  - Open CMS issue: functional-dry-needling redirects to dry-needling, so the Services menu shows two entries for one page
- 2026-11-02: Page clean-up batch
  - Header: no phone number (desktop or mobile); nav centred and kept on one line; desktop nav from 1280px (xl), hamburger below that
  - Homepage testimonials section removed (Reviews backend untouched)
  - About Us: Dr. Reid Dobson added below Dr. Ray with the supplied bio word-for-word (the client confirmed the "fewer than 5%" line); initials placeholder photo
  - Removed the image below the hero on service, region and blog detail pages; blog Related articles removed; blog body now sits in a white card
  - Region detail: alternating image/text condition rows using stock photos (conditionStock in lib/stockImages.js); a CMS section image takes priority
  - Testing iteration_11: all passed
- 2026-11-03: Business hours and Meta Pixel
  - SITE.hours in lib/site.js; BusinessHours.jsx shown on the Contact page (next to the address) and in the footer
  - Meta Pixel (NEXT_PUBLIC_META_PIXEL_ID in client/.env.local) via MetaPixel.jsx in the (site) layout, so it runs on public pages only, not admin
    - Loads and inits only after the visitor accepts the consent banner (CookieConsent.jsx, choice saved in localStorage, "Cookie preferences" in the footer reopens it)
    - One PageView per pathname change; decline revokes consent and stops tracking
  - The noscript pixel fallback was left out on purpose: it would track visitors who never gave consent
- 2026-11-03: The pixel now starts on every visit (opt-out). Only Decline sends consent revoke, set before init, and stops PageViews. Accept and the banner work as before. The banner's "With your permission" wording is unchanged and should be reviewed by the client.
- 2026-11-03: Removed the cookie/privacy popup completely (CookieConsent.jsx, lib/consent.js and the footer "Cookie preferences" link deleted). MetaPixel.jsx now inits on every load with no consent check, one PageView per pathname change.
- 2026-11-03: Treatment PDF and lead capture (What We Treat)
  - DB migration 20261103120000_treatment_pdf_leads:
    - treatments gets pdf_key, pdf_storage, pdf_file_name, pdf_size, pdf_label and pdf_uploaded_at
    - new pdf_leads table, linked to treatments with SET NULL on delete
  - Storage: storage.js putPrivate/readPrivate/deletePrivate
    - S3 when the AWS_* keys are set (private objects); otherwise server/private_uploads, which is never served statically
    - The old file is deleted when a PDF is replaced or removed
  - Admin API (requireAuth):
    - POST/GET/DELETE /api/admin/conditions/:id/pdf (PDF only: mimetype, .pdf extension and %PDF- magic bytes; MAX_UPLOAD_MB)
    - GET /api/admin/pdf-leads?search=&page=
  - Public API:
    - POST /api/public/conditions/:slug/pdf-leads (zod validation, honeypot, 10 per 15 min per IP) returns a 10-minute JWT download URL
    - GET /api/public/treatment-pdf/:token streams the file and sets downloadedAt
    - The public detail shows only pdf {label, fileName}, never the key
  - Admin UI: PdfField in the condition editor, plus the PDF Leads page in the sidebar (search + detail modal). The shared admin Modal now closes on Escape
  - Public UI: PdfDownload card to the right of the intro, with an accessible lead modal (portal). Location is optional and empty (user choice)
  - The preview shim (/app/backend/server.py) passes AWS_* keys from /app/backend/.env to Express
  - Testing iteration_12: 100% pass. Test leads and PDFs cleaned up; no treatment currently has a PDF

## Backlog
- P1: real clinic video and photos, verified metrics, Facebook/YouTube/Yelp URLs, approved Terms text, privacy policy "Country: Wisconsin" review, genuine reviews entered in the CMS
- P1: clinic hours (unverified), separate GHL form IDs for Speak with a PT / Discovery Call, service images, licensed fonts, remove the leftover authoring line in the IT band post, NEXT_PUBLIC_SITE_URL/MEDIA_HOSTS for prod
- P1: client credentials (AWS, prod DB, fonts), content for the 8 draft conditions, featured images
- P2: block manual redirects that shadow live content, media library browser, scheduled-publish indicator
