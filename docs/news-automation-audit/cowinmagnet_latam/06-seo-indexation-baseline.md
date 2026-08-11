# SEO and indexation baseline

- Production base URL: `https://cowinmagnet.cl`.
- Public `/es-cl/news`, `/news-sitemap.xml`, `/sitemap.xml` returned HTTP 200 in the latest pre-change full-site audit.
- Google sitemap submission cron is already `23 9 */3 * *` and remains outside this News refactor.
- News detail pages already emit `NewsArticle` JSON-LD and canonical alternates. The source panel is rendered in the visible page.
- The existing News RSS delegation to Blog RSS is an SEO isolation defect and is addressed in this change.

