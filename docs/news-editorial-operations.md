# News editorial operations

The production scheduler calls `/api/cron/editorial-news` once per day. It publishes at most one already approved, source-led Spanish industry bulletin every 48 hours. Discovery candidates are created from the protected admin page and remain outside the public News feed until an editor approves them. It runs on Vercel and does not depend on a local computer.

## Production switch

`NEWS_AUTOPUBLISH_ENABLED=false` is the repository-safe default. Keep it disabled until at least six candidates have passed editorial review in `/admin/news`; then set it to `true` in Vercel production and redeploy. A Vercel redeployment is required after changing the variable.

The bulletin generator does not require an AI Gateway key, third-party model account or paid API. It records two cited source links, source dates, a reviewed product-truth card and a clearly labelled general technical reading.

## Execution modes

- Scheduled production run: authenticated Vercel Cron request with no query parameters.
- Admin candidate generation: the protected `/admin/news` page creates one evidence-review candidate without publishing it.
- Authenticated preview: `?force=1&preview=1` discovers and validates a candidate without publishing it.
- Authenticated immediate run: `?force=1` publishes the next qualified candidate and is reserved for deployment verification or editorial recovery.
- Dry run: `?dryRun=1` executes validation without writing a public article.

Every mode requires `CRON_SECRET`. Query parameters cannot bypass authentication or the editorial quality gate.

## Required candidate fields

- `type: news-candidate`
- `status: evidence_review` before review, then `quality_review`
- `editorialApproved: true` (set by an editor in `/admin/news`)
- `title`, `summary`, `body`, `slug`, `productSlug`
- Two or more independent source records with URL, publication date, access date, supported fact and evidence location
- Owned or licensed `image` and `imageRightsRecord`
- Stable `idempotencyKey`

The discovery stage rotates topic clusters, requires evidence from at least two independent domains and prefers recently unused sources. The quality gate rejects missing truth cards, fewer than two source domains, incomplete evidence, text below 900 words, internal SEO/AI labels, unverified local/manufacturing claims, missing image rights and similarity above the configured thresholds. Every attempted run is stored as `publication-run`.

## Rollback

Set `NEWS_AUTOPUBLISH_ENABLED=false` and redeploy. This stops publication without deleting News, candidates or run logs. Remove the Vercel cron entry only when decommissioning the subsystem itself.
