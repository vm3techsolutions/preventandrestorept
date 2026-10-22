# Prevent & Restore Physical Therapy — Public website, CMS & API

Monorepo:

```
client/   Next.js 14 App Router (JavaScript), Tailwind CSS, Redux Toolkit, Lucide icons — public website (Part 2) + admin CMS (/admin)
server/   Node.js + Express 5 REST API, Prisma ORM, PostgreSQL, Amazon S3 media
```

The browser never talks to PostgreSQL; every read/write goes through the Express API (`client/src/lib/api.js`).

## 1. Local setup

Requirements: Node.js 20+, Yarn 1.x, PostgreSQL 14+ (Python 3 only if you re-run the legacy scraper).

```bash
# Server
cd server
cp .env.example .env            # fill in DATABASE_URL, SESSION_SECRET (>= 32 random chars), CLIENT_URL ...
yarn install
yarn migrate:deploy             # applies prisma/migrations (never resets data)
yarn seed                       # idempotent; only inserts records that don't exist yet
yarn dev                        # http://localhost:5000/api/health

# Client
cd ../client
cp .env.example .env.local      # NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api, NEXT_PUBLIC_SITE_URL=...
yarn install
yarn dev                        # site: http://localhost:3000  admin: http://localhost:3000/admin
```

### First administrator (one-time setup)
1. On boot, if no admin exists, the server prints a one-time setup token to the log (valid 24h, `SETUP_TOKEN_TTL_HOURS`). You can issue a fresh one any time with `yarn setup:token`.
2. Open `/admin/setup`, paste the token, and create the admin (bcrypt, 12 rounds).
3. Setup is disabled permanently once an admin exists. There is no public registration.

Sessions: httpOnly `pr_admin_session` cookie (JWT signed with `SESSION_SECRET`), 8h expiry (`SESSION_TTL_HOURS`), invalidated on password change. Login is rate-limited and locks an IP+email for 15 minutes after 5 failures.

## 2. Migrations
- Schema: `server/prisma/schema.prisma`. Migrations live in `server/prisma/migrations/`.
- Change the schema, then run `yarn migrate:dev --name describe_change` locally to create a new incremental migration. Commit it.
- In staging/production run only `yarn migrate:deploy`. Never run `prisma migrate reset` or `db push --force-reset` against a real database.

## 3. Seed content
`server/prisma/seed-data/legacy.json` was generated from the live WordPress site by `yarn scrape:legacy` (uses the WP REST API; requires `pip install beautifulsoup4`). Images were downloaded to `server/uploads/legacy/`.

Seeded (placeholder content to be replaced by the client):
- 2 blogs by Ray Waters (Sept 9, 2026) with full heading/list/disclaimer structure. **The source posts have no featured image**, so none was seeded.
- 7 services (text from /physical-therapy-services/). That page has no images, so services have no featured image yet.
- 13 conditions. The 5 with dedicated legacy pages (Back & Sciatica, Shoulder & Neck, Knee, Foot & Ankle, Sports Injuries) are fully seeded and published, with their featured images. The other 8 only appear as names on /other-conditions/, so they are seeded as **drafts** with the verified general "Other Conditions" text and need client content before publishing. Review/testimonial blocks were left out (no Reviews module).
- Author "Ray Waters", credentials "PT, DPT, CSCS, CEAS" (from the homepage).
- 301 redirects: /back-sciatica-pain/, /shoulder-neck-pain/, /knee-pain/, /foot-ankle-pain/, /sports-injuries/ → /what-we-treat/<slug>; both legacy blog URLs → /blogs/<slug>; /physical-therapy-services/ → /services; /other-conditions/ → /what-we-treat; /meet-the-team/ and /why-prevent-restore-physical-therapy/ → /about-us; /request-appointment/, /speak-with-a-pt/, /availability-and-pricing/, /discovery-call/, /contact-us/ → /contact.

## 4. Public URL structure
| Content | Public path | Public API |
|---|---|---|
| Blog | `/blogs/:slug/` (old `/blog/:slug` 301s here) | `GET /api/public/blogs`, `/api/public/blogs/:slug`, `/blogs/categories`, `/blogs/tags` |
| Service | `/services/:slug` | `GET /api/public/services`, `/:slug` |
| Condition | `/what-we-treat/:slug` | `GET /api/public/conditions`, `/:slug` |
| CMS page | `/:slug` | `GET /api/public/pages`, `/:slug` |
| Redirects | — | `GET /api/public/redirects` (all active), `/redirects/resolve?path=` |
| Sitemap | `/sitemap.xml` | `GET /api/public/sitemap.xml` (XML) and `/api/public/sitemap` (JSON) |
| Settings | — | `GET /api/public/settings` |

All list endpoints accept `page`, `limit`; blogs also `category`, `tag`, `search`, `sort=latest`. Every detail response includes a `seo` object (`title`, `description`, `canonical`, `robots`, `ogImage`, `path`) with fallbacks. Lists and sitemap exclude drafts, archived, trashed, future-dated and `noindex` content; detail endpoints serve published `noindex` items with `robots: "noindex, nofollow"` so the page still renders but is not indexed.

All routes are also available under `/api/v1/...`.

## 4b. Public website (Part 2, `client/src/app/(site)`)
- Pages: `/` Home, `/about-us/`, `/services/` + `/services/[slug]/`, `/what-we-treat/` + `/what-we-treat/[slug]/`, `/blogs/` (pagination `?page=`, filters `?category=` / `?tag=`) + `/blogs/[slug]/`, `/contact/`, CMS pages at `/[slug]/` (reserved routes can never be overridden). Missing or unpublished slugs return a real 404.
- Home, About Us, Contact, header, footer and navigation are developer-managed. Clinic details (phone, email, address, GoHighLevel form) live in `client/src/lib/site.js`.
- Data: server components fetch from the Part 1 public API through `client/src/lib/api.js` with 60s revalidation (ISR), so content is in the rendered HTML. The shared Redux store adds a `site` slice (mobile navigation state).
- Contact form: the existing GoHighLevel form (`BEGJvO6gNANPojCjlhqB`, `link.clinicalmarketer.com`) is embedded unchanged.
- SEO: Next Metadata API from CMS `seo` fields (title, description, self-referencing canonical with trailing slash, robots/noindex, Open Graph/Twitter), JSON-LD (PhysicalTherapy, BlogPosting, FAQPage, BreadcrumbList), `/sitemap.xml` (published + indexable only, domain from `NEXT_PUBLIC_SITE_URL`), `/robots.txt` (disallows /admin and /api).
- Redirects: `client/src/middleware.js` reads active records from `/api/public/redirects` (cached 60s) and issues 301s. Manage them in Admin → URL Redirects.
- Images: `next/image`. Files in `public/images` and remote hosts listed in `NEXT_PUBLIC_MEDIA_HOSTS` (S3/CloudFront) or the API origin are optimized; same-origin `/api/uploads` files (local-disk fallback) are served directly.

Client environment (`client/.env.example`):
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API base for the browser (`http://localhost:5000/api` or `/api`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical public domain for canonicals, Open Graph and sitemap |
| `API_INTERNAL_URL` | Optional, server-only. Absolute API URL for server rendering when the public base is relative |
| `NEXT_PUBLIC_MEDIA_HOSTS` | Optional, comma-separated image origins to optimize, e.g. `https://bucket.s3.us-east-1.amazonaws.com` |

## 5. Admin API (cookie-authenticated)
`/api/auth`: `GET setup/status`, `POST setup`, `POST login`, `POST logout`, `GET me`, `PUT password`

`/api/admin`: `dashboard`, `blogs`, `services`, `conditions`, `pages` (each: `GET /`, `POST /`, `GET/PUT/DELETE /:id`, `PUT /reorder`, `GET /:id/preview`, `POST /:id/publish|unpublish|archive|restore`), `categories`, `tags`, `authors`, `redirects` (CRUD), `media` (`POST` multipart `file` + `folder`, `GET`, `DELETE /:id`, `GET /status`), `settings`.

Slug rules: auto-generated from title, editable, unique per type. Changing the slug of a published item creates a 301 from the old path and re-points existing redirects (no chains). Manual redirects reject loops and chains. CMS page slugs cannot use reserved routes (home, about-us, blog, services, what-we-treat, admin, api, …) or a path that already has a redirect.

## 6. Admin accounts and audit trail
- Admins → Add admin creates more admin accounts (full name, unique email, password with at least 10 characters including letters and numbers, hashed with bcrypt). API: `GET/POST /api/admin/admins`, `PUT /api/admin/admins/:id/status`.
- An admin can activate or deactivate other admins. Deactivating signs that admin out immediately and blocks login. You can't change your own status or deactivate the last active admin.
- Blogs, services and conditions record `created_by_id` / `updated_by_id` from the logged-in session (request bodies can't set them). The editor sidebar shows who created and last updated each item. Content created before this feature shows "Not recorded".
- Local machines: run `yarn migrate:deploy` in `server/` after pulling this update.
- Admins → Reset password lets an admin set a new password for another admin (that admin is signed out everywhere). Use Settings → Change password for your own account.
- Every password field has a show/hide (eye) toggle.
- **Owner account**: the first admin (created through initial setup, or the lowest ID when upgrading) is the owner, marked with an Owner badge. Other admins cannot reset the owner's password or deactivate the owner (API returns 403). The owner manages their own password in Settings.
- **Activity Log** (`/admin/activity`, API `GET /api/admin/activity?adminId=&entityType=&action=&from=&to=&search=&page=`): every create, update (with the list of changed fields), publish/unpublish/archive, delete/restore, reorder, upload, redirect, category/tag/author, settings and admin-account change is recorded with the admin's name, email, ID and time. Entries keep the admin's name even if that admin is later removed.

### Recovering admin accounts from the command line (folder: `server/`)
```bash
yarn admin list                                   # shows every admin with ID and ACTIVE/DEACTIVATED
yarn admin activate you@example.com               # re-activates an account and clears login lockouts
yarn admin reset-password you@example.com NewPass2026x   # sets a new password and activates the account
yarn admin create you@example.com NewPass2026x Your Name # creates an extra active admin
```
Admin IDs come from a PostgreSQL sequence. IDs are never reused after rows are deleted or after a failed insert, so a new admin can be #6 even if the table looks empty. This is normal and harmless.

## 7. Media / Amazon S3
- Allowed: JPEG, PNG, WebP, GIF, AVIF up to 5 MB (`MAX_UPLOAD_MB`), validated by MIME type **and** file signature. Only URLs + metadata are stored in PostgreSQL (`media` table).
- When all four `AWS_*` variables are real values, uploads go to S3 with server-side credentials. Otherwise they fall back to local disk (`server/uploads`, served at `/api/uploads/...`) — fine for development, not for multi-instance production.
- S3 setup: create a bucket in the chosen region; allow public read for the `blogs/ services/ treatments/ pages/ general/` prefixes (bucket policy) or put CloudFront in front and set `AWS_S3_PUBLIC_BASE_URL`; create an IAM user limited to `s3:PutObject` and `s3:DeleteObject` on that bucket.
- Seeded legacy images live in `server/uploads/legacy/`; upload them to S3 and update URLs when moving to S3 (or keep serving them from the API).

## 7. Fonts
Blair ITC Std and Futura PT are licensed fonts and were not available. `globals.css` already declares `@font-face` for `/fonts/BlairITCStd-Medium.woff2`, `/fonts/FuturaPT-Book.woff2`, `/fonts/FuturaPT-Demi.woff2`; drop the licensed webfont files into `client/public/fonts/`. Until then, fallbacks are Montserrat (headings) and Jost (body, a geometric Futura-style face).

## 8. Deployment
- **API**: any Node 20 host (Render, Railway, ECS, EC2…). Set env vars, run `yarn install --production=false && npx prisma generate && yarn migrate:deploy && yarn seed` (seed is optional and idempotent), start with `yarn start`. Set `NODE_ENV=production` (forces secure cookies) and `TRUST_PROXY` to the number of proxies in front.
- **Client**: Vercel or any Node host: `yarn build && yarn start` with `NEXT_PUBLIC_API_BASE_URL=https://<api-host>/api`, or `/api` when the API is reverse-proxied on the same domain (recommended; then also set `API_INTERNAL_URL` to the API's internal address). Set `NEXT_PUBLIC_SITE_URL` to the live domain. Middleware (redirects) needs a Node/Edge runtime, not a static export.
- **Cookies**: the session cookie is `SameSite=Lax`. Serve the API on the same site as the admin (e.g. `admin.example.com` + `api.example.com`, or the API reverse-proxied under `/api`). Add every admin origin to `CLIENT_URL` (comma-separated).
- **Database**: managed PostgreSQL (RDS, Neon, Supabase…). Back it up before running migrations.

### Preview environment note
In this Emergent preview, `backend/server.py` is only a small shim that starts an embedded PostgreSQL (binaries from `server/node_modules/@embedded-postgres`, data in `server/.pgdata`) plus the Express API and proxies `/api` to it; `frontend/package.json` `start` runs `client`. Neither is needed outside the preview.

## 9. Remaining client credentials / configuration checklist
- [ ] Production PostgreSQL `DATABASE_URL`
- [ ] Strong `SESSION_SECRET` (e.g. `openssl rand -hex 32`)
- [ ] `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (+ optional `AWS_S3_PUBLIC_BASE_URL` / CloudFront)
- [ ] Production `CLIENT_URL` (admin origin) and `SITE_URL` (canonical public domain)
- [ ] Licensed Blair ITC Std and Futura PT webfont files
- [ ] Featured images for the two seeded blogs (none exist on the current site)
- [ ] Content for the 8 draft conditions (Tennis Elbow, Golfer's Elbow, Tendinopathy, Numbness and Tingling, Headaches, Jaw Pain, Plantar Fasciitis, Posterior Tibialis Dysfunction)
- [ ] Default meta description and social image (Settings → SEO defaults)
- [ ] Confirm clinic details used in seeded copy (East Cobb / Marietta, GA; Dr. Ray Waters, PT, DPT) and the phone number that appears in the IT band article (404-907-2734, copied verbatim from the source)
- [ ] Final replacement blog content from the client
- [ ] `NEXT_PUBLIC_SITE_URL` set to the live domain; `NEXT_PUBLIC_MEDIA_HOSTS` set to the S3/CloudFront origin once S3 is live
- [ ] Clinic opening hours (not shown: not verified on the current site)
- [ ] Form IDs for the separate Speak With a PT / Availability & Pricing / Discovery Call forms, if they should stay separate (they currently redirect to /contact/, which embeds the Request Appointment form)
- [ ] Images for services (none exist on the current site; cards show icons)
