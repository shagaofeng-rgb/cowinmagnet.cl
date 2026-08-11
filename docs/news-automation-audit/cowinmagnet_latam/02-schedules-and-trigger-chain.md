# Schedules and trigger chain

## Baseline before the change

| Task | Entry | Schedule (UTC) | Can publish | Finding |
|---|---|---:|---:|---|
| Sitemap submission | `/api/cron/sitemap?submit=true` | `23 9 */3 * *` | No | Already every three days. |
| Analytics sync | `/api/cron/analytics-sync` | every 30 minutes | No | Unrelated. |
| Website monitor | `/api/cron/website-monitor` | every six hours | No | Unrelated. |
| Editorial News | `/api/cron/editorial-news` | daily 13:17 | Yes | Conflict: discovery, composition and publication were coupled. |

## Target chain

| Task | Entry | Schedule (UTC) | Business guard | Writes |
|---|---|---:|---|---|
| News ingest | `/api/cron/news-ingest` | 01:17 and 13:17 | 12-hour ingest interval | `news-candidate`, `news-ingest-run` only |
| Compatibility ingest | `/api/cron/editorial-news` | none after deployment | delegates to ingest only | same as ingest |
| News publish evaluator | `/api/cron/news-publish` | daily 13:23 | 48-hour published-success interval, lock and idempotency key | `news`, `news-publication-run`, `news-delivery-check` |

Vercel cron is day-based and cannot safely express a durable rolling 48-hour cadence across month boundaries while also allowing a recovery attempt. The daily publish evaluator is therefore deliberately a _check_, not a daily publisher: it exits with `waiting_48_hours` until 48 hours have elapsed since the last verified public News publication. A failed eligible cycle remains retryable on the next evaluation without creating duplicates.

