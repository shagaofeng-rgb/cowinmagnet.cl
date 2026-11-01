# GSC Index Coverage Remediation — 2026-11-01

## Scope and evidence

This remediation is limited to `cowinmagnet.cl`. The reported Google Search Console (GSC) snapshot was read on 2026-11-01; GSC says its index-category data was last updated 2026-10-23.

| GSC category | Reported total | Meaning for this remediation |
| --- | ---: | --- |
| Indexed | 779 | Baseline only; it is not a failure count. |
| Google chose a different canonical | 97 | Requires the GSC URL/canonical-pair export to assign a page-level disposition. |
| Crawled, currently not indexed | 63 | Requires the GSC URL export and last-crawl values before claiming individual root cause. |
| Not found (404) | 9 | Requires the exact URLs before a redirect can be evaluated. Genuine deleted URLs remain 404. |
| Discovered, currently not indexed | 93 | Validation was already in progress; wait for Google after sitemap cleanup. |
| Page with redirect | 2 | Intentional exclusion unless an exported URL shows an unexpected target. |
| Duplicate / alternate / noindex | 4 | These can be intentional exclusions; do not convert them to errors without their exported URLs. |

The GSC Coverage UI is account-protected and its URL-level report export (URL, last crawl, validation state and Google-selected canonical) is not exposed by the connected service/API in this run. The Search Console API available to the site supports URL Inspection for supplied URLs and sitemap status/submission; it does not provide a bulk Coverage report export. Therefore no individual GSC URL, last-crawl timestamp, validation detail, 97-pair comparison, 63-page root-cause claim, or 404 redirect was invented.

## Public audit performed before change

At the start of this work, the live sitemap index contained 756 public URLs although the GSC sitemap UI reported 755. A controlled request audit of all 756 entries found HTTP 200, one H1, and an `x-default` alternate for every URL.

| Public URL template | Count | Result before change | Disposition |
| --- | ---: | --- | --- |
| `/en/blog` and `/pt-br/blog` | 2 | Each was in the sitemap, but the page is non-indexable and canonicals to `/es-cl/blog`. | **Fixed:** remove both contradictory sitemap entries. |
| Product detail pages | 282 | HTTP 200; local self canonical and locale alternates present. | **Fixed / wait for recrawl:** add Chile-project context and contextual internal links; no unsupported local-stock or performance claims. |
| Other sitemap URLs | 472 | HTTP 200; self canonical, one H1, `x-default` present. | **Wait for recrawl:** no evidence of a public technical defect from this audit. |
| Sitemap total | 756 | Two entries contradicted their own indexing metadata. | **Fixed:** expected post-deploy total is 754. |

The independently sampled local and global product pages were both reachable. Their full-page lexical overlap was not verbatim, but shared product/model/media signals can still contribute to canonical ambiguity. This is an inference, not a claim that any one of the 97 GSC cases is a product page. The local product additions make the project context and semantic internal-link graph explicit.

## URL/template disposition register

| URL or template | GSC category / count | Action | Status / required evidence |
| --- | --- | --- | --- |
| `/en/blog`, `/pt-br/blog` | Potential duplicate/canonical conflict; 2 observable URLs | Do not publish them in the sitemap while their own metadata is canonical/noindex to Spanish Chile. | **Fixed**, then request sitemap recrawl. |
| `/{locale}/products/{category}/{slug}` | 97 canonical cases cannot yet be mapped | Retain local self canonical; add product-specific Chile project context and links to Chile, the relevant industry and technical solution. | **Waiting for recrawl**; compare exported GSC canonical pairs after Google processes the new sitemap. |
| GSC 97 canonical cases not matching a public template | 97 | No blind canonical/redirect change. | **Evidence insufficient:** import the Coverage export with inspected URL and Google-selected canonical. |
| GSC crawled-not-indexed URLs | 63 | Public templates pass crawlability checks; do not publish thin filler merely to raise counts. | **Evidence insufficient:** import URL, last crawl, rendered title/H1 and template to diagnose each. |
| GSC 404 URLs | 9 | No blanket redirect. A real deleted page stays 404; only a replacement with a clear user intent gets a 301. | **Evidence insufficient:** exact exported URL and intended replacement required. |
| GSC discovered-not-indexed URLs | 93 | Preserve currently valid public sitemap and wait for Google validation. | **Waiting for recrawl / validation**. |
| GSC redirect (2), correct canonical alternate (1), noindex (1) | 4 | Keep intentional routing, canonicalization and private/admin exclusion. | **Intentional exclusion** unless an export identifies an unintended public URL. |
| GSC duplicate (2) | 2 | Do not alter without pairs. | **Evidence insufficient:** URL/canonical pair export required. |

## Verification and GSC follow-up

1. Deploy this change and request `/sitemap.xml`; deployment refresh regenerates the sitemap from the current canonical rules.
2. Confirm the sitemap contains 754 URLs and neither `/en/blog` nor `/pt-br/blog`.
3. Submit/re-submit the sitemap through the site’s Search Console integration (it has a built-in 72-hour rate limit) and record the result.
4. In GSC, submit validation for the three failed categories only after the two sitemap entries are gone: `Google chose different canonical`, `Crawled - currently not indexed`, and `Not found (404)`. Do not submit `Discovered - currently not indexed` while its existing validation is running.
5. To close every row in the register, export the affected-URL CSV from each GSC category, including URL, last crawl, validation state and (for canonical) user-declared/Google-selected canonical, then attach it to this repository or the change record. Process only the URLs in that export; totals do not equal failures.
