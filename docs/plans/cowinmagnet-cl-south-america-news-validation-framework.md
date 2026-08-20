# CowinMagnet Chile & South America News: Validation Framework

## Status and boundary

This is the approved design baseline. The matching implementation now exists in the
repository; source activation remains fail-closed until each source passes health checks.
No historical News or Blog article is modified by the source catalog work.

The attached implementation brief proposes a substantially broader News system than the
one currently in production. The current system has eight RSS sources, a 12-hour candidate
ingest job, a 48-hour publication guard, one `es-cl` publishing path, a PostgreSQL-backed
CMS store, an authenticated cron route, source attribution, duplicate checks, cache
invalidation, and public list/detail/sitemap verification.

## Confirmed design principles

1. The supplied 300-source directory is a source catalog, not an automatic crawl list.
   Every original entry remains in an immutable raw catalog. A source is never fetched until
   it has been normalized, its public discovery route has been checked, and robots and
   license restrictions permit the selected use.
2. An article uses only verified, in-scope sources. Forums, social platforms, directories,
   and community sites can discover leads but cannot be the sole factual source.
3. News and Blog remain strictly separate in route, query, CMS type, sitemap, RSS, and
   publishing jobs. Existing Blog records and its publishing interface are not migrated.
4. Product context comes only from a per-product truth card derived from real product data.
   Unconfirmed specifications, delivery claims, inventory, local presence, customer names,
   certificates, and performance claims are blocked.
5. External news images are not copied or hot-linked. A News page uses an owned product
   image, a licensed asset with stored evidence, a valid public-domain/CC asset, an original
   infographic, or no image.
6. A publication is successful only after the public News list, detail URL, sitemap, and RSS
   show the same article. Database write success alone is not enough.

## Source catalog validation design

### Immutable and normalized layers

The execution phase will create the following additive files and tables; raw entries are
never removed merely because their domain is unavailable or duplicated.

| Layer | Purpose | Writes allowed |
| --- | --- | --- |
| `sources.raw.md` | Exact user-provided entries with ordinal and original text | No edits after import |
| `sources.seed.csv/json` | Parsed and normalized records, retaining `rawEntry` | Additive normalization metadata |
| `source-validation-runs` | Timestamped health, robots, redirect, language, and method checks | Append only |
| `source-catalog` | Active crawler configuration with canonical domain and rotation state | Reviewed updates only |

### Source statuses and eligibility

Each source will have one of: `pending`, `verified`, `inactive`, `robots-blocked`, or
`needs-review`. Only `verified`, active sources with a permitted RSS, sitemap, API, or
public-page method may generate a News candidate.

| Tier | Intended role | Publication rule |
| --- | --- | --- |
| A | Regulators, associations, official show newsrooms, technical bodies | Preferred primary factual source |
| B | Reputable trade media | Primary source when article and date are independently accessible |
| C | Supplementary specialist media | Context only or corroboration, never unverified claims |
| Discovery-only | Forums, social platforms, directories, communities | Lead discovery only; cannot publish an article by itself |

Source checks run slowly with per-domain backoff and record: requested URL, final canonical
domain, HTTP result, robots result, discovered method, available content language, last
article date, redirect chain, error category, and next eligible check time. No paywall,
login, CAPTCHA, or search-result page is bypassed.

### Rotation and anti-duplication gates

Before a candidate becomes eligible, the validator checks:

- canonical URL hash and source publication date;
- title, excerpt, event fingerprint, n-gram and semantic similarity to prior News;
- same source domain use within 14 days;
- no more than two consecutive articles from a source group or region;
- product + market + industry + application cooldown of 60 days;
- product family maximum of two News items in 30 days;
- current language, target market, industry, and product truth-card alignment;
- source freshness, publication date confidence, and direct accessibility.

The audit log stores the accepted source, all rejected sources and reasons, duplication score,
topic cluster, information-gain score, and cooldown decisions.

## Product facts and content validation

### Required product truth card

Every candidate is joined to exactly one actual product/series URL. The card contains the
public name, category, series/model if verified, approved applications and industries,
verified summary/features/specifications, owned-image references, source references, missing
fields, and prohibited claims. A partial card can support general context but prevents any
parameter-specific statement.

### Publication quality gate

The publishing worker cannot bypass this sequence:

`fact lock -> original editorial draft -> language/style audit -> fact regression -> source and image-rights check -> similarity check -> SEO/GEO check -> public delivery verification`

Required output checks:

- exact source publisher, source title, source date, and original URL;
- clear separation of reported facts and COWIN editorial analysis;
- professional, natural `es-CL` without internal fields, template labels, malformed encoding,
  unsupported sales claims, or supplier references;
- product facts equal the selected truth card;
- unique title, description, H1, canonical, Open Graph, JSON-LD, breadcrumb, RSS and sitemap;
- valid internal links only to public product/industry/solution/contact pages;
- source panel, editorial disclaimer, desktop and mobile rendering;
- list/detail/RSS/sitemap HTTP `200` and visible content after cache revalidation.

## Language and regional policy

- `es-cl` is the primary automatic News locale for Chile and Spanish-speaking South America.
- `pt-br` is an independent Brazilian article only after Brazilian relevance, Portuguese
  editorial review, distinct metadata, and duplicate-content checks pass.
- `en` remains optional and is not generated merely to populate a language route.
- `es`, `es-cl`, `pt-br`, and `en` receive self-canonical pages. Hreflang is emitted only for
  genuinely equivalent, complete versions; it is not used to connect near-duplicate drafts.

## Scheduler and policy decisions requiring confirmation

The attached brief proposes a daily `es-cl` publish attempt at 09:45 America/Santiago. The
currently deployed business rule is a 12-hour ingest and a 48-hour maximum one-article
publication cycle. These should not be silently merged. The following decision table must be
approved before implementation:

| Area | Current production rule | Attached brief proposal | Recommended confirmation |
| --- | --- | --- | --- |
| Candidate discovery | Every 12 hours | Daily at 08:10 | Keep 12 hours; it improves source health without publishing |
| Successful publication | One article per 48 hours | Attempt one per day | Select one rule explicitly before code changes |
| Article length | 700-1,000 words | 1,000-1,500 Spanish words | Use a single approved range per locale |
| Source count | One verified source allowed | One or two sources, two preferred | Require one primary; add a second only when independently relevant |
| Conversion links | News avoids sales CTA and allows one product link | At least product, industry/solution and contact links | Keep editorial, non-promotional contextual links; confirm whether three links are required |
| Failed gate | Retry candidate/fallback per current schedule | Skip and record reason | Keep skip + audit; never force low-quality publication |

## Implementation phases after approval

1. **Read-only audit and backups**: source, News, Blog, product and SEO baseline; no content
   mutation. Produce the preimplementation audit and rollback map.
2. **Source catalog import**: preserve all raw entries; generate normalized seed data and
   validation report; do not activate unverified sources.
3. **Data model**: additive source, validation-run, truth-card, topic-profile and audit records;
   add unique keys and indexes without modifying existing News/Blog rows.
4. **Discovery and rotation**: implement pluggable RSS/sitemap/public-page adapters, robots
   validation, low-frequency scheduling, cooldowns and backoff.
5. **Content gates**: truth-card fact lock, editorial style audit, citation/image-rights checks,
   multilingual metadata checks and explicit reject reasons.
6. **Admin and observability**: extend existing News screens with source status, queue, audit,
   run history, timezones, dry run, and safe run-now behavior.
7. **Dry-run acceptance**: no publication. Validate at least one accepted and one rejected
   candidate, all routing, schema, sitemaps, language behavior, concurrency, retries and
   cache invalidation.
8. **Production enablement**: deploy only after the dry-run report passes and the cadence/policy
   table above is confirmed. Verify a real public News publication end to end.

## Required test matrix

- 300 raw entries retained, normalized records linked to their raw ordinal, and duplicates
  merged only in the active catalog;
- robots denial, paywall, malformed URL, redirect, timeout, RSS parsing and public-page
  discovery tests;
- source tier, language, regional relevance, rotation, cooldown, duplicate and event-cluster
  tests;
- truth-card claim allow/deny tests and image-rights fail-closed tests;
- content encoding, forbidden internal-text, citation, title/meta/H1, schema, canonical,
  hreflang, links, RSS, sitemap, caching and responsive rendering tests;
- authenticated cron, lock, idempotency, retry/backoff, timezone and DST tests;
- News/Blog data, route, sitemap and RSS isolation tests;
- one end-to-end dry run with an accepted candidate and one with a documented rejection.

## Rollback

All changes are additive. Source activation, scheduler policy, and automatic publication are
feature-gated. Rollback consists of disabling the new source catalog/worker flag, restoring the
prior scheduler configuration, and retaining existing News, Blog and product records unchanged.
