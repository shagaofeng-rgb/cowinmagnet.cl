# Local validation report

Validation timestamp: 2026-08-11 (Asia/Shanghai)

## Code and build

| Check | Result | Evidence |
|---|---|---|
| Type check | Passed | `npm run typecheck` completed with exit code 0. |
| Automated tests | Passed | `npm test`: 15 passed, 0 failed. Includes the new News site-configuration checks and existing sitemap tests. |
| Production build | Passed | `npm run build` completed with exit code 0 and includes `/api/cron/news-ingest`, `/api/cron/news-publish`, `/[locale]/news/rss.xml`. |

## HTTP smoke checks on the new local build

Local preview port: `8095`

| URL | HTTP status | Result |
|---|---:|---|
| `/es-cl/news` | 200 | News list renders. |
| `/es-cl/news/separador-magnetico-para-relaves-mineros` | 200 | Existing News detail renders. |
| `/es-cl/news/rss.xml` | 200 | Dedicated News RSS renders. |
| `/es-cl/blog/rss.xml` | 200 | Independent Blog RSS renders. |
| `/news-sitemap.xml` | 200 | News sitemap renders. |
| `/api/cron/news-ingest` without bearer token | 401 | Protected. |
| `/api/cron/news-publish` without bearer token | 401 | Protected. |
| `/api/cron/editorial-news` without bearer token | 401 | Protected compatibility alias. |

RSS assertions passed: News RSS contains `Cowinmagnet LATAM News`; Blog RSS contains `Cowinmagnet LATAM Blog`; neither response contains the other section's route.

The News detail response contains the source panel and does not contain a `Productos relacionados` module or article-level quotation CTA. The global site footer remains unchanged and still contains the site's normal contact navigation.

## Browser rendering

Chrome headless rendered the News page with the correct Spanish title, active News navigation and article cards. A 500px narrow viewport showed the mobile Menu control and no clipping. Chrome headless imposes a 500px minimum viewport for this invocation, so a true 320/375/390px emulation remains a production/preview browser task.

## Deliberately not performed

- No production deployment, no Vercel cron registration, no production database migration and no live News publication were performed. The task instruction requires explicit production authorization before these actions.
- No historical News records were deleted, noindexed or redirected. Their content-level triage must be performed against real source data before a safe decision.
