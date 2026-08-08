# News editorial operations

The production scheduler calls `/api/cron/editorial-news` once per day. The route does not scrape or generate public content. It checks whether an editor-approved candidate can be published and enforces a minimum 48-hour interval from the latest published News item.

## Production switch

`NEWS_AUTOPUBLISH_ENABLED=false` is the required default. Set it to `true` only after six preproduction articles have passed evidence, copyright, product-truth, similarity, rendering and editorial review. A Vercel redeployment is required after changing the variable.

## Required candidate fields

- `type: news-candidate`
- `status: quality_review`
- `editorialApproved: true`
- `title`, `summary`, `body`, `slug`, `productSlug`
- Two or more independent source records with URL, publication date, access date, supported fact and evidence location
- Owned or licensed `image` and `imageRightsRecord`
- Stable `idempotencyKey`

The quality gate rejects missing truth cards, fewer than two source domains, incomplete evidence, text below 900 words, internal SEO/AI labels, unverified local/manufacturing claims, missing image rights and similarity above the configured thresholds. Every attempted run is stored as `publication-run`.

## Rollback

Set `NEWS_AUTOPUBLISH_ENABLED=false` and redeploy. This stops publication without deleting News, candidates or run logs. Remove the Vercel cron entry only when decommissioning the subsystem itself.
