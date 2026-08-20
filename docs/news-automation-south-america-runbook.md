# CowinMagnet Chile News Automation Runbook

## Scope

The automated program serves `cowinmagnet.cl`, site id `cowinmagnet_latam`, with
`es-cl` as the only automatic publication locale. News and Blog are separate CMS
types, routes, RSS feeds, sitemaps, and publishing paths.

## Source safety

- `data/news/cowinmagnet-cl-south-america-sources.raw.md` preserves the 300 supplied entries.
- Generated seed data keeps each raw ordinal, canonical domain, group, region, language, tier, and status.
- Sources start inactive. `GET /api/cron/news-source-health` is authenticated with `CRON_SECRET` and checks a maximum of six sources per run.
- A source must have permitted robots rules, an accessible public RSS/Atom/JSON Feed, a non-community tier, and an audit record before it can enter discovery.
- Forums, social media, directories, and community sources are discovery-only and cannot become a sole News source.

## Schedule

- Source health: every 12 hours, in a bounded batch.
- Candidate ingest: every 12 hours. It only reads, normalizes, validates, scores, rejects, and stores candidates.
- Publication evaluator: hourly. It honors `America/Santiago`, opens only after 09:00 local time, and allows a maximum of one successful `es-cl` News publication per local day.

The evaluator tries approved candidates and fallback discovery when needed. It never publishes a draft or a database-only success: News list, detail, sitemap, and RSS must all pass public verification first.

## Quality gates

Candidates require a verified source, date, relevance, freshness, duplicate checks, 14-day domain cooldown, source group/region rotation, topic limits, and a score at or above the configured threshold. Publication also requires a supported product truth card, 1,000-1,500 word Spanish editorial body, source panel, attribution, disclaimer, and no sales CTA or unverified technical claim.

## Operational checks

Use the protected cron routes or the existing administrator News screen. Do not put `CRON_SECRET`, database credentials, or other keys in a browser, content item, Git commit, or report. Review `news-source-health-run`, `news-ingest-run`, `news-publication-run`, and `news-delivery-check` records for the last result and failure reason.

## Rollback

Set `NEWS_AUTOPUBLISH_ENABLED` to `false`, redeploy, and leave existing News and Blog records untouched. The source catalog is additive; no historical article or source record is deleted by this implementation.
