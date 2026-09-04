# Cowinmagnet.cl full-site audit and production acceptance

Audit window: 2026-08-31 to 2026-09-01  
Final verification follow-up: 2026-09-04  
Production: <https://cowinmagnet.cl>  
Repository: <https://github.com/shagaofeng-rgb/cowinmagnet.cl>  
Final commit: `9a35e519c96df787d4cc7ca4d156a1d29c09a8f5`  
Final Vercel deployment: `dpl_Fxr9kGdmAt6eKVR8kkFxxMMvYwvW` (`READY`, production aliases assigned)

## Acceptance result

The audited release is online. Automatic News publication completed successfully in the Chile publication window and the generated article was confirmed on the public list, detail page, RSS feed and News sitemap. Frontend, backend access boundaries, public CMS reads, multilingual rendering, images, responsive layout, sitemap coverage and production build passed the checks described below.

## Root cause and reliability fixes

The production runtime logs showed repeated `Query read timeout` errors on News list/detail/sitemap requests and on `/api/cron/news-publish`. Public News rendering bypassed the Next.js cache and loaded all CMS rows and article bodies for every request. Under crawler or concurrent serverless load, this exhausted the database read path and made publication delivery checks time out even when the editorial job itself was valid.

Implemented corrections:

- Added 5-minute tagged caches for public News and Blog index reads, scoped to `cowinmagnet_latam`.
- Invalidated `public-news` and `public-blog` immediately after every automatic, admin or webhook publication/status mutation.
- Removed large article bodies from index/list queries.
- Changed detail lookup to a single `type + slug + site_id` database query instead of loading all article bodies and filtering in application memory.
- Added regression tests for cached reads, payload reduction, slug lookup and invalidation paths.
- Kept the Chile timezone daily-publication guard and existing source, quality, duplication and delivery gates intact.

## Automatic News production proof

Vercel production runtime log at `2026-08-31T13:23:38Z` (`09:23 America/Santiago`) recorded:

- route: `GET /api/cron/news-publish`
- HTTP status: `200`
- result: `published_success`
- published count: `1`
- slug: `noticia-reciclaje-metales-2e05ac24343a`
- source: `noticiasmaquinaria.com`
- word count: `1086`
- information-gain score: `91`
- delivery attempts: `1`
- News list: `200`, article visible
- News detail: `200`, article visible
- News sitemap: `200`, article visible
- sitemap refresh: success, 1,020 URLs processed, 0 errors

The same slug was independently fetched after publication and found in:

- `/es-cl/news`
- `/es-cl/news/noticia-reciclaje-metales-2e05ac24343a`
- `/es-cl/news/rss.xml`
- `/news-sitemap.xml` during its Google News 48-hour eligibility window

No related Vercel warning/error log was present in the `13:20Z` to `14:00Z` acceptance window.

## Frontend, multilingual and visual QA

- Corrected Spanish/Portuguese encoding corruption in catalog copy.
- Localized market, region, industry and solution headings, explanatory sections, related cards, FAQ and CTAs for Spanish, Portuguese and English.
- Prevented Spanish fallback summaries from being appended to non-Spanish SEO metadata and hero copy.
- Added explicit content-language semantics and a transparent untranslated-source notice for News records without reviewed translations.
- Verified 613 literal `/assets/...` references exist.
- Browser matrix: 4 supported locales x 7 representative routes x 2 viewports (390 px and 1,440 px), 56/56 passed.
- Browser checks covered status, exactly one H1, horizontal overflow, broken images, missing alt text, console/page errors and known Spanish copy leaks.

Evidence: `runtime/browser-audit-local-after-fixes-20260831.json`.

## Backend, data and security QA

- Public pages, robots, manifest, sitemap index, child sitemaps and analytics health endpoint returned expected success responses.
- Admin pages remained behind login; protected admin APIs returned unauthorized responses without a session; cron endpoints rejected unauthenticated requests.
- Invalid inquiry payloads were rejected.
- One API inquiry and two browser inquiry records carrying the `TEST-AUDIT` marker were created to prove persistence, then deleted. Generated local audit analytics were also removed.
- Added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`; production headers were verified after deployment. Existing HSTS remains active.
- Corrected the audit script's product category URL map and stale News automation description.

## Build and production crawl

- TypeScript: passed.
- Unit tests: 34/34 passed.
- Next.js 16.2.6 production build: passed.
- Static generation: 196/196 pages.
- `git diff --check`: passed.
- Final sitemap crawl on `9a35e51`: 1,020 discovered, 1,020 passed, 0 failed at six concurrent workers.

Evidence: `runtime/production-sitemap-crawl-after-deploy-20260831.json`.

## Backup and rollback

Pre-audit Git rollback points were retained locally:

- branch: `backup/full-site-audit-20260831-192636`
- tag: `backup/full-site-audit-20260831-192636`

Vercel also retains earlier production deployments as rollback candidates. If rollback is required, promote the previous known-good Vercel deployment or revert commits `9a35e51`, `95d138c` and `3101867` in reverse order. No production test data remains to roll back.

## Open, non-blocking follow-up work

- Only 8 of 88 product records currently have reviewed engineering truth cards; the remaining 80 deliberately use conservative copy. Engineering specifications should be added only from verified source documents.
- Many CMS News records do not yet have reviewed Portuguese/English translations. The frontend now labels the source language instead of presenting fallback Spanish as translated content.
- A strict Content-Security-Policy was not enabled in this release because the current application uses inline structured data/scripts and remote editorial media; it should be introduced in report-only mode first.
- Search Console authenticated indexing data was not available in the local workspace. Sitemap validity and public reachability were verified, but indexing is not claimed.
- Direct production database credentials were not exported or copied, and this audit did not mutate production data manually. Deployment rollback plus the database provider's managed recovery remains the production rollback boundary.
