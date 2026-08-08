import { createHash } from "node:crypto";
import { getCmsItems, saveCmsItem } from "@/lib/cmsStore";
import { getProductTruthCard } from "@/data/productTruth";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";
import { generateEditorialCandidate } from "@/lib/newsGeneration";

const TWO_DAYS = 48 * 60 * 60 * 1000;
const blockedPublicTerms = /SEO Meta|Primary Keyword|Search Intent|AI Citation Ready|CMS checklist|impacto para separacion magnetica en Americas/i;
const blockedClaims = /stock local|oficina local|fabrica propia|equipo de instalacion local/i;

function words(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{3,}/g) || [];
}

function similarity(a, b) {
  const left = new Set(words(a));
  const right = new Set(words(b));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function sourceDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export function evaluateEditorialCandidate(candidate, recentArticles = []) {
  const failures = [];
  const sources = Array.isArray(candidate.sources) ? candidate.sources : [];
  const domains = new Set(sources.map((source) => sourceDomain(source.url)).filter(Boolean));
  if (!getProductTruthCard(candidate.productSlug)) failures.push("missing_product_truth_card");
  if (sources.length < 2 || domains.size < 2) failures.push("fewer_than_two_independent_sources");
  if (sources.some((source) => !source.url || !source.publishedAt || !source.accessedAt || !source.supportedFact)) failures.push("incomplete_source_evidence");
  if (!candidate.title || !candidate.summary || !candidate.body) failures.push("incomplete_article");
  if (words(candidate.body).length < 900) failures.push("article_below_900_words");
  if (blockedPublicTerms.test(`${candidate.title} ${candidate.summary} ${candidate.body}`)) failures.push("internal_editorial_language_visible");
  if (blockedClaims.test(`${candidate.title} ${candidate.summary} ${candidate.body}`)) failures.push("unverified_local_or_manufacturing_claim");
  if (!candidate.image || !candidate.imageRightsRecord) failures.push("missing_owned_or_licensed_image_record");
  for (const article of recentArticles) {
    if (similarity(candidate.title, article.title) > 0.82) failures.push(`duplicate_title:${article.slug}`);
    if (similarity(candidate.summary, article.summary) > 0.78) failures.push(`duplicate_summary:${article.slug}`);
    if (similarity(candidate.body, article.body) > 0.72) failures.push(`duplicate_body:${article.slug}`);
  }
  return { eligible: failures.length === 0, failures: [...new Set(failures)] };
}

export async function runEditorialPublication({ dryRun = false, force = false, generateOnly = false } = {}) {
  if (process.env.NEWS_AUTOPUBLISH_ENABLED !== "true") return { success: true, status: "disabled", published: 0 };
  const [candidates, published] = await Promise.all([
    getCmsItems("news-candidate", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true })
  ]);
  const latest = published.filter((item) => item.status === "published").sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))[0];
  if (!force && latest && Date.now() - new Date(latest.publishedAt || latest.createdAt).getTime() < TWO_DAYS) return { success: true, status: "waiting_48_hours", published: 0 };
  const recent = published.filter((item) => Date.now() - new Date(item.publishedAt || item.createdAt || 0).getTime() < 180 * 86400000);
  let candidate = candidates.find((item) => item.status === "quality_review" && item.editorialApproved === true);
  if (!candidate) {
    const generation = await generateEditorialCandidate(recent);
    if (!generation.generated) return { success: false, status: "generation_blocked", published: 0, reason: generation.reason, discoveryErrors: generation.discovery?.errors || [] };
    candidate = await saveCmsItem(generation.candidate);
  }
  const quality = evaluateEditorialCandidate(candidate, recent);
  const run = {
    type: "publication-run", slug: `editorial-${Date.now()}`, title: `Editorial publication ${new Date().toISOString()}`,
    status: quality.eligible ? (dryRun ? "dry_run" : "passed") : "rejected", candidateSlug: candidate.slug,
    failures: quality.failures, createdAt: new Date().toISOString()
  };
  await saveCmsItem(run);
  if (!quality.eligible || dryRun || generateOnly) return { success: quality.eligible, status: generateOnly && quality.eligible ? "preview_ready" : run.status, published: 0, failures: quality.failures, preview: generateOnly ? { slug: candidate.slug, title: candidate.title, summary: candidate.summary, body: candidate.body, sources: candidate.sources } : undefined };
  const idempotencyKey = candidate.idempotencyKey || createHash("sha256").update(`${candidate.title}|${candidate.body}`).digest("hex");
  if (published.some((item) => item.idempotencyKey === idempotencyKey)) return { success: true, status: "duplicate_idempotency_key", published: 0 };
  const publishedAt = new Date().toISOString();
  await saveCmsItem({ ...candidate, type: "news", status: "published", idempotencyKey, publishedAt, sourceUrl: candidate.sources?.[0]?.url || "", sourceTitle: candidate.sources?.[0]?.title || "", sourcePublishedAt: candidate.sources?.[0]?.publishedAt || "", sourceFetchedAt: candidate.sources?.[0]?.accessedAt || "" });
  await saveCmsItem({ ...candidate, type: "news-candidate", status: "published", idempotencyKey, publishedAt });
  queueSitemapRefresh("editorial-news-published");
  return { success: true, status: "published", published: 1, slug: candidate.slug };
}
