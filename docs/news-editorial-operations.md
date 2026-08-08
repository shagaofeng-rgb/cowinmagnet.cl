# News editorial operations

The production scheduler calls `/api/cron/editorial-news` once per day. The cloud-side job discovers recent evidence from approved regional sources, generates a Spanish draft through Vercel AI Gateway, applies the editorial quality gate and publishes at most one qualified News item every 48 hours. It runs on Vercel and does not depend on a local computer.

## Production switch

`NEWS_AUTOPUBLISH_ENABLED=false` is the repository-safe default. Production may set it to `true` after an authenticated preview has passed evidence, copyright, product-truth, similarity and rendering checks. A Vercel redeployment is required after changing the variable.

`NEWS_AI_MODEL` optionally selects the AI Gateway model. Production uses `openai/gpt-5.4` by default and authenticates with Vercel's runtime OIDC token; no AI credential is exposed to the browser or committed to Git.

## Execution modes

- Scheduled production run: authenticated Vercel Cron request with no query parameters.
- Authenticated preview: `?force=1&preview=1` discovers and validates a candidate without publishing it.
- Authenticated immediate run: `?force=1` publishes the next qualified candidate and is reserved for deployment verification or editorial recovery.
- Dry run: `?dryRun=1` executes validation without writing a public article.

Every mode requires `CRON_SECRET`. Query parameters cannot bypass authentication or the editorial quality gate.

## Required candidate fields

- `type: news-candidate`
- `status: quality_review`
- `editorialApproved: true` (set by the automated quality workflow or an editor)
- `title`, `summary`, `body`, `slug`, `productSlug`
- Two or more independent source records with URL, publication date, access date, supported fact and evidence location
- Owned or licensed `image` and `imageRightsRecord`
- Stable `idempotencyKey`

The discovery stage rotates topic clusters, requires evidence from at least two independent domains and prefers recently unused sources. The quality gate rejects missing truth cards, fewer than two source domains, incomplete evidence, text below 900 words, internal SEO/AI labels, unverified local/manufacturing claims, missing image rights and similarity above the configured thresholds. Every attempted run is stored as `publication-run`.

## Rollback

Set `NEWS_AUTOPUBLISH_ENABLED=false` and redeploy. This stops publication without deleting News, candidates or run logs. Remove the Vercel cron entry only when decommissioning the subsystem itself.
