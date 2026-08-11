# Old code and conflict removal plan

## Remove or replace safely

1. Replace the daily `editorial-news` Vercel cron with two ingest calls and a guarded publish evaluator.
2. Keep the old route only as an authenticated compatibility alias for ingest; it will no longer compose or publish.
3. Remove the publication worker path that generated a candidate inside the publish operation.
4. Replace the News RSS delegation to the Blog RSS route with a dedicated News feed.
5. Keep manual candidate approval screens and historical records. Their status remains valid, but the automated process uses only verified candidate records.

## Not removed automatically

- Existing published News and Blog records.
- Existing product theme and product truth data.
- The Blog webhook and manual Blog authoring functionality.
- Google sitemap submission schedule.

