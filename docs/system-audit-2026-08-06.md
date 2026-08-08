# Production System Audit - 2026-08-06

> Superseded on 2026-08-08: the News collection and automatic publishing system described in this historical report was decommissioned. Existing News content and manual CMS publishing remain available.

## Scope and release

- Production site: `https://cowinmagnet.cl/es-cl`
- Deployment verified: `dpl_9HhSr81URjeLvhp32PanFLqWLNkv`
- Production URL: `https://cowinmagnet-183aega2l-davidsha.vercel.app`
- Application release: `27a2b51a0deca36308e024b6371da8a3eb16ed14`
- Previous application repair release: `c9fda0125778952ec0a9f01f8d0b5cbd0db4611f`
- Verification time: 2026-08-06 10:54 China Standard Time (UTC+08:00)

This audit used real production HTTP responses, Vercel deployment status and runtime-error queries, local production builds, and the configured source. It did not replace or delete production content, database records, or historical Blog content.

## Backup and rollback

- Pre-change source/configuration snapshot: `C:\Users\Administrator\AppData\Local\Temp\cowinmagnet-cl-audit-20260806-094123.zip`
- Snapshot root: `C:\Users\Administrator\AppData\Local\Temp\cowinmagnet-cl-audit-20260806-094123`
- Local `.data` snapshot: `C:\Users\Administrator\AppData\Local\Temp\cowinmagnet-cl-audit-20260806-094123\local-data`
- Baseline Git revision: `793f031edd34dd2cfdc7a94f9c68591b537524f2`

Rollback options:

1. In Vercel, promote the previous production deployment `dpl_AjLvnaJ9ZVC4gLfLe8xbzwRPVg1G`, or revert the listed commits in Git and redeploy.
2. Restore source/configuration from the snapshot only after reviewing the affected files.
3. No schema migration or production data mutation was made in this audit, so there is no database migration to reverse.

## Confirmed normal

| Area | Evidence | Result |
| --- | --- | --- |
| Build and tests | `npm run typecheck`, `npm test`, and `npm run build` passed. Tests: 13 passed, 0 failed. | Confirmed |
| Production deployment | Vercel deployment `dpl_9HhSr81URjeLvhp32PanFLqWLNkv` is `READY`; no runtime errors were returned for the selected deployment range. | Confirmed |
| Public routes | `GET` home, products, News, quote, sitemap, News sitemap, robots and manifest each returned `200`. | Confirmed |
| Database read path | `GET /api/analytics/health` returned `storageMode: database` and `latestSyncStatus: success` at `2026-08-06T02:54:58.399Z`. | Confirmed |
| News sitemap | Production response was 4,622 bytes with 8 `<url>` elements. | Confirmed |
| SEO discovery | `robots.txt` and the sitemap index both returned `200`; the sitemap index responds in 836 ms in the final check. | Confirmed |
| Blog automatic publishing | Legacy `/api/webhook/send_article` returned `404`. The final build route manifest contains no such route. Historical Blog URLs remain routed to News and were not deleted. | Confirmed closed |

## Active production jobs

| Job | Trigger / frequency | Input and output | Current implementation status |
| --- | --- | --- | --- |
| Analytics sync | Vercel cron, every 30 minutes | Analytics events -> aggregate/sync status | Enabled |
| Website monitor | Vercel cron, every 6 hours | Read-only CMS, inquiries, analytics and sitemap health checks -> sanitized log/result | Enabled |
| Sitemap refresh | CMS mutation | Content state -> XML snapshot | Enabled; refresh only, no immediate Google submission |
| Google Search Console sitemap submission | Vercel cron, `23 9 */3 * *` | Sitemap index -> Search Console API -> run log | Enabled every 3 days |

There is no configured message queue in this application. No Blog publishing cron, webhook, queue consumer, or alternate automatic publishing entrypoint remains in the checked source.

## Fixes applied

| Issue | Root cause | Repair |
| --- | --- | --- |
| Production data could hide a CMS database failure by falling back to local files | CMS read path allowed a production fallback | Production reads now retry transient database faults and surface failures instead of silently using local fallback data. |
| Transient Neon pool disconnects | Prior Vercel error history contained `Connection terminated unexpectedly` | PostgreSQL pools now use a bounded lifetime, TCP keepalive, idle-error handler, and one bounded retry for idempotent operations. |
| Dashboard analytics included non-real sample records | Local analytics store generated and retained `sample-*` records | Sample generation was removed and all `sample-*` records are filtered from reads; computed metrics no longer use fixed placeholder rates. |
| Cron header could be forged | `x-vercel-cron` was accepted as an authentication bypass | Remaining analytics-sync and monitor jobs require the configured `CRON_SECRET` in production. |
| Sitemap submission was too frequent | Daily Vercel schedule and force path could submit repeatedly | Cron changed to every 3 days. Storage-level 72-hour guard prevents duplicate successful submissions. Content changes only refresh XML. |
| Blog automatic publishing had a hidden webhook | `/api/webhook/send_article` could write automated content | The route and its untracked secret-bearing documentation/configuration were removed. Existing Blog content was preserved. |
| Canada source matching contained a malformed accented term | Corrupted `Québec` token | Replaced with `québec` in the News source classifier. |

## Production HTTP evidence

Final production check:

| URL / endpoint | Status | Response time | Size |
| --- | ---: | ---: | ---: |
| `/es-cl` | 200 | 2,422 ms | 52,240 B |
| `/es-cl/products` | 200 | 885 ms | 37,054 B |
| `/es-cl/news` | 200 | 1,547 ms | 212,753 B |
| `/es-cl/request-a-quote` | 200 | 647 ms | 33,046 B |
| `/api/analytics/health` | 200 | 703 ms | 131 B |
| `/sitemap.xml` | 200 | 836 ms | 682 B |
| `/news-sitemap.xml` | 200 | 864 ms | 4,622 B |
| `/robots.txt` | 200 | 334 ms | 241 B |
| `/manifest.webmanifest` | 200 | 446 ms | 430 B |
| `/api/webhook/send_article` | 404 | 342 ms | n/a |

The News response is the heaviest checked public page (about 213 KB). It remains functional, but should be watched as the News archive grows; image payload and page-level caching are the next measured performance candidates.

## Items found but not automatically changed

| Item | Reason / impact | Recommendation |
| --- | --- | --- |
| Production schema, indexes, grants and full database backup | The production database credentials/CLI and a managed snapshot API were not exposed to this session. No direct schema or backup operation was attempted. | Run a managed Neon backup and `pg_dump --schema-only`/index review using a DB administrator connection. |
| Search Console authorization/result | Service-account credentials are not readable through this session; the deployed scheduler and 72-hour guard are verified, not a successful Google API call. | Review the latest sitemap run in `/admin/sitemap` after the next scheduled cycle. |
| Vercel host CPU, memory, disk and raw network metrics | Serverless host telemetry is not exposed by the available Vercel connector. | Enable Vercel Observability/alerts and review functions, database and edge metrics. |
| Production mobile/desktop rendered visual QA | Browser-control tooling was not exposed in this session. HTTP, build and route checks do not substitute for viewport screenshots. | Run a manual or Playwright visual pass at 390 px and 1440 px for home, products, News, quote, menu and forms. |
| Admin secret fallback and rate-limit scope | Existing code includes a local admin-secret fallback; inquiry throttling is process-local in serverless. | Ensure `ADMIN_JWT_SECRET` is set in Vercel and move rate limiting to Vercel WAF/KV/Redis before higher-volume campaigns. |
| Database TLS validation | Existing remote PostgreSQL option uses `rejectUnauthorized: false`. | Use a verified CA or managed provider certificate chain when the connection setup supports it. |

## Modified files

- `lib/database.js`
- `lib/cmsStore.js`
- `lib/analyticsStore.js`
- `lib/enquiryStore.js`
- `lib/adminAccountStore.js`
- `lib/sitemapManager.js`
- `lib/sitemapHooks.js`
- `app/api/analytics/health/route.js`
- `app/api/cron/analytics-sync/route.js`
- `app/api/cron/website-monitor/route.js`
- `vercel.json`
- `docs/sitemap.md`

The removed Blog automation route was `app/api/webhook/send_article/route.js`. No database schema change was made.

## Acceptance summary

- Confirmed normal: deployment, production public routes, real database read path, sitemap/robots availability, cron authentication, Blog automation removal, build and test suite.
- Found and repaired: database resilience/fallback behavior, mock analytics pollution, cron authentication, Google submission cadence/duplication guard, Blog auto-post webhook, source text corruption.
- Found but not fully verified: direct production DB structural audit/backup, an actual post-release authenticated cron run, Google API authorization, host metrics, and rendered mobile/desktop screenshots.

No unverified item is marked as complete in this report.
