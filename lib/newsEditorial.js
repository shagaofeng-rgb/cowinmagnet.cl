import { createHash } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCmsItems, saveCmsItem, withCmsAdvisoryLock } from "@/lib/cmsStore";
import { getProductTruthCard } from "@/data/productTruth";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";
import { generateEditorialCandidate } from "@/lib/newsGeneration";

const RECENT_WINDOW = 180 * 86400000;
const TWO_DAYS = 48 * 60 * 60 * 1000;
const AUTOMATION_LOCK = "cowinmagnet-cl-editorial-news";
const blockedPublicTerms = /SEO Meta|Primary Keyword|Search Intent|AI Citation Ready|CMS checklist|impacto para separacion magnetica en Americas/i;
const blockedClaims = /stock local|oficina local|fabrica propia|equipo de instalacion local/i;

function revalidatePublishedNews(slug) {
  for (const locale of ["es-cl", "es", "pt-br", "en"]) {
    revalidatePath(`/${locale}/news`);
    revalidatePath(`/${locale}/news/${slug}`);
  }
  revalidatePath("/news-sitemap.xml");
  revalidatePath("/sitemap.xml");
  revalidateTag("public-news", { expire: 0 });
}

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

function rootDomain(url) {
  const host = sourceDomain(url);
  const parts = host.split(".").filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(".") : host;
}

function sourceUrls(item) {
  return [item?.sourceUrl, ...(Array.isArray(item?.sources) ? item.sources.map((source) => source?.url) : [])].filter(Boolean);
}

function maxDuplicationScore(candidate, recentArticles) {
  return recentArticles.reduce((score, article) => Math.max(
    score,
    similarity(candidate.title, article.title),
    similarity(candidate.summary, article.summary),
    similarity(candidate.body, article.body)
  ), 0);
}

export function evaluateEditorialCandidate(candidate, recentArticles = []) {
  const failures = [];
  const sources = Array.isArray(candidate.sources) ? candidate.sources : [];
  const domains = new Set(sources.map((source) => rootDomain(source.url)).filter(Boolean));
  const duplicationScore = maxDuplicationScore(candidate, recentArticles);
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
  return { eligible: failures.length === 0, failures: [...new Set(failures)], duplicationScore };
}

async function loadEditorialState() {
  const [candidates, published] = await Promise.all([
    getCmsItems("news-candidate", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true })
  ]);
  const publishedItems = published.filter((item) => item.status === "published");
  return {
    candidates,
    published: publishedItems,
    recent: publishedItems.filter((item) => Date.now() - new Date(item.publishedAt || item.createdAt || 0).getTime() < RECENT_WINDOW)
  };
}

async function publishOne({ dryRun = false, force = false, generateOnly = false, context = {} } = {}) {
  const state = await loadEditorialState();
  const latest = state.published.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0))[0];
  if (!force && latest && Date.now() - new Date(latest.publishedAt || latest.createdAt).getTime() < TWO_DAYS) {
    return { success: true, status: "waiting_48_hours", published: 0 };
  }

  let candidate = state.candidates.find((item) => item.status === "quality_review" && item.editorialApproved === true);
  let discovery = null;
  if (!candidate) {
    const generation = await generateEditorialCandidate(state.recent, context);
    discovery = generation.discovery;
    if (!generation.generated) {
      return {
        success: false,
        status: "generation_blocked",
        published: 0,
        reason: generation.reason,
        selected_source: null,
        rejected_sources: generation.discovery?.rejectedSources || [],
        duplication_score: null,
        topic_cluster_id: generation.discovery?.cluster?.id || null,
        information_gain_score: generation.discovery?.informationGainScore ?? null,
        source_groups: []
      };
    }
    if (state.published.some((item) => item.slug === generation.candidate.slug)) {
      return {
        success: true,
        status: "duplicate_source_event",
        published: 0,
        slug: generation.candidate.slug,
        selected_source: generation.candidate.selectedSource,
        rejected_sources: generation.candidate.rejectedSources,
        duplication_score: 1,
        topic_cluster_id: generation.candidate.topicClusterId,
        information_gain_score: generation.candidate.informationGainScore,
        source_groups: generation.candidate.selectedSourceGroups
      };
    }
    candidate = await saveCmsItem({ ...generation.candidate, status: "evidence_review", editorialApproved: false });
  }

  const quality = evaluateEditorialCandidate(candidate, state.recent);
  const diagnostics = {
    selected_source: candidate.selectedSource || candidate.sources?.[0]?.url || "",
    rejected_sources: candidate.rejectedSources || discovery?.rejectedSources || [],
    duplication_score: quality.duplicationScore,
    topic_cluster_id: candidate.topicClusterId || null,
    information_gain_score: candidate.informationGainScore || 0,
    source_groups: candidate.selectedSourceGroups || [...new Set((candidate.sources || []).map((source) => source.sourceGroup).filter(Boolean))]
  };

  const run = {
    type: "publication-run",
    slug: `editorial-${Date.now()}`,
    title: `Editorial publication ${new Date().toISOString()}`,
    status: !quality.eligible ? "rejected" : (!candidate.editorialApproved ? "awaiting_editorial_approval" : (dryRun ? "dry_run" : "passed")),
    candidateSlug: candidate.slug,
    failures: quality.failures,
    ...diagnostics,
    createdAt: new Date().toISOString()
  };
  await saveCmsItem(run);
  if (!quality.eligible || dryRun || generateOnly || !candidate.editorialApproved) {
    if (!quality.eligible) {
      await saveCmsItem({
        ...candidate,
        type: "news-candidate",
        status: "rejected",
        qualityFailures: quality.failures,
        ...diagnostics
      });
    }
    return {
      success: quality.eligible,
      status: generateOnly && quality.eligible ? "preview_ready" : (!candidate.editorialApproved ? "awaiting_editorial_approval" : (quality.eligible ? run.status : "candidate_rejected")),
      published: 0,
      failures: quality.failures,
      slug: candidate.slug,
      ...diagnostics,
      preview: generateOnly ? { slug: candidate.slug, title: candidate.title, summary: candidate.summary, body: candidate.body, sources: candidate.sources } : undefined
    };
  }

  const idempotencyKey = candidate.idempotencyKey || createHash("sha256").update(`${candidate.title}|${candidate.body}`).digest("hex");
  if (state.published.some((item) => item.idempotencyKey === idempotencyKey || item.slug === candidate.slug)) {
    return { success: true, status: "duplicate_idempotency_key", published: 0, slug: candidate.slug, ...diagnostics };
  }

  const publishedAt = new Date().toISOString();
  await saveCmsItem({
    ...candidate,
    id: `news-${candidate.slug}`,
    type: "news",
    status: "published",
    idempotencyKey,
    publishedAt,
    sourceUrl: candidate.sources?.[0]?.url || "",
    sourceTitle: candidate.sources?.[0]?.title || "",
    sourcePublishedAt: candidate.sources?.[0]?.publishedAt || "",
    sourceFetchedAt: candidate.sources?.[0]?.accessedAt || "",
    ...diagnostics
  });
  await saveCmsItem({ ...candidate, type: "news-candidate", status: "published", idempotencyKey, publishedAt, ...diagnostics });
  revalidatePublishedNews(candidate.slug);
  queueSitemapRefresh("editorial-news-published");
  return { success: true, status: "published", published: 1, slug: candidate.slug, ...diagnostics };
}

export async function runEditorialPublication(options = {}) {
  if (process.env.NEWS_AUTOPUBLISH_ENABLED !== "true" && !options.generateOnly) return { success: true, status: "disabled", published: 0 };
  return withCmsAdvisoryLock(AUTOMATION_LOCK, async () => publishOne(options));
}
