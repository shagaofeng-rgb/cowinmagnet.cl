import { createHash } from "node:crypto";
import { getNewsSiteConfig, validateNewsSiteConfig } from "@/lib/newsSiteConfig.mjs";

function clean(value = "") {
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&#8230;/g, "...")
    .replace(/\s+/g, " ").trim();
}

function tag(item, name) {
  return item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || "";
}

function rootDomain(value = "") {
  try {
    const parts = new URL(value).hostname.replace(/^www\./, "").split(".").filter(Boolean);
    return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
  } catch {
    return "";
  }
}

function normalizeUrl(value = "") {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function tokens(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{3,}/g) || [];
}

function similarity(left, right) {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const value of a) if (b.has(value)) common += 1;
  return common / (a.size + b.size - common);
}

function parseFeed(xml, source) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 15).map((match) => {
    const raw = match[1];
    const url = normalizeUrl(clean(tag(raw, "link")));
    const published = new Date(clean(tag(raw, "pubDate")) || 0);
    return {
      title: clean(tag(raw, "title")),
      url,
      excerpt: clean(tag(raw, "description")).slice(0, 1800),
      publishedAt: Number.isNaN(published.getTime()) ? "" : published.toISOString(),
      accessedAt: new Date().toISOString(),
      sourceName: source.name,
      sourceGroup: source.group,
      sourceTrustScore: source.sourceTrustScore,
      country: source.country,
      domain: rootDomain(url || source.rssOrApiUrl)
    };
  }).filter((item) => item.title && item.url && item.excerpt && item.publishedAt);
}

async function fetchFeed(source, site) {
  const response = await fetch(source.rssOrApiUrl, {
    headers: { "user-agent": `${site.brandName}NewsBot/1.0 (+${site.siteUrl}${site.news.listRoute})` },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`${source.name} feed returned ${response.status}`);
  return parseFeed(await response.text(), source);
}

function candidateAgeHours(item) {
  return (Date.now() - new Date(item.publishedAt).getTime()) / 3600000;
}

function themeFor(item, themes) {
  const haystack = `${item.title} ${item.excerpt}`.toLowerCase();
  return themes.find((theme) => theme.terms.some((term) => haystack.includes(term))) || null;
}

function sourceUsage(recent = []) {
  const usage = new Map();
  for (const article of recent.slice(0, 10)) {
    const sources = Array.isArray(article.sources) ? article.sources : [{ url: article.sourceUrl }];
    for (const source of sources) {
      const domain = rootDomain(source?.url || "");
      if (domain) usage.set(domain, (usage.get(domain) || 0) + 1);
    }
  }
  return usage;
}

function topicCount(recent, topic, days) {
  const since = Date.now() - days * 86400000;
  return recent.filter((item) => item.topicClusterId === topic && new Date(item.publishedAt || item.createdAt || 0).getTime() >= since).length;
}

function informationGain(item, theme, recent, usage) {
  const age = candidateAgeHours(item);
  const relevance = theme ? 30 : 0;
  const impact = /seguridad|regul|norma|proyecto|produccion|inversion|agua|energia|logistica|recicl|planta|mineral|cobre|litio/i.test(`${item.title} ${item.excerpt}`) ? 20 : 10;
  const freshness = age <= 24 ? 15 : age <= 48 ? 12 : 8;
  const verification = Math.min(15, Math.round((item.sourceTrustScore || 60) / 6));
  const themeValue = theme ? 15 : 0;
  const domainPenalty = (usage.get(item.domain) || 0) >= 2 ? 10 : 0;
  const topicPenalty = theme ? Math.min(5, topicCount(recent, theme.themeId, 7) * 2) : 5;
  return Math.max(0, relevance + impact + freshness + verification + themeValue - domainPenalty - topicPenalty);
}

export async function discoverNewsCandidates({ siteId, recentArticles = [], fallback = false } = {}) {
  const site = getNewsSiteConfig(siteId);
  const validation = validateNewsSiteConfig(site);
  if (!validation.valid) return { candidates: [], rejectedSources: [], errors: [`invalid_site_config:${validation.missing.join(",")}`], site };

  const configuredSources = [...site.sources.primaryWhitelist, ...(fallback ? site.sources.fallbackWhitelist : [])];
  const settled = await Promise.allSettled(configuredSources.map((source) => fetchFeed(source, site)));
  const sourceErrors = settled.flatMap((result) => result.status === "rejected" ? [String(result.reason?.message || result.reason)] : []);
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const usage = sourceUsage(recentArticles);
  const seenUrls = new Set(recentArticles.flatMap((item) => [item.sourceUrl, ...(item.sources || []).map((source) => source?.url)]).filter(Boolean));
  const rejectedSources = [];
  const candidates = [];
  const maxAgeHours = fallback ? site.news.fallbackCandidateMaxAgeDays * 24 : site.news.candidateMaxAgeHours;

  for (const item of items) {
    const ageHours = candidateAgeHours(item);
    const theme = themeFor(item, site.productThemePlan);
    const duplicateScore = Math.max(0, ...recentArticles.map((article) => similarity(`${item.title} ${item.excerpt}`, `${article.title || ""} ${article.summary || ""} ${article.body || ""}`)));
    let reason = "";
    if (ageHours < 0 || ageHours > maxAgeHours) reason = "outside_candidate_age_window";
    else if (!theme) reason = "outside_industry_scope";
    else if (seenUrls.has(item.url)) reason = "source_url_already_used";
    else if ((usage.get(item.domain) || 0) >= 2) reason = "same_domain_limit_last_ten";
    else if (duplicateScore > 0.85) reason = "semantic_duplicate_recent_publication";
    else if (topicCount(recentArticles, theme.themeId, 1) >= 1) reason = "topic_limit_24h";
    else if (topicCount(recentArticles, theme.themeId, 7) >= 3) reason = "topic_limit_7d";
    if (reason) {
      rejectedSources.push({ url: item.url, domain: item.domain, reason, duplicationScore: duplicateScore });
      continue;
    }

    const score = informationGain(item, theme, recentArticles, usage);
    if (score < site.news.minScore) {
      rejectedSources.push({ url: item.url, domain: item.domain, reason: "information_gain_below_threshold", informationGainScore: score, duplicationScore: duplicateScore });
      continue;
    }
    const sourceFingerprint = createHash("sha256").update(`${site.siteId}|${item.url}|${item.publishedAt}`).digest("hex");
    candidates.push({
      type: "news-candidate",
      siteId: site.siteId,
      slug: `candidate-${sourceFingerprint.slice(0, 16)}`,
      title: item.title,
      summary: item.excerpt.slice(0, 360),
      status: "candidate",
      candidateState: "candidate",
      sourceUrl: item.url,
      sourceTitle: item.title,
      sourceDomain: item.domain,
      sourcePublishedAt: item.publishedAt,
      sourceFetchedAt: item.accessedAt,
      sources: [{ title: item.title, url: item.url, publishedAt: item.publishedAt, accessedAt: item.accessedAt, domain: item.domain, sourceName: item.sourceName, sourceGroup: item.sourceGroup, country: item.country, supportedFact: item.excerpt }],
      selectedSource: item.url,
      selectedSourceGroups: [item.sourceGroup],
      rejectedSources: [],
      topicClusterId: theme.themeId,
      productSlug: theme.productSlug,
      sourceFingerprint,
      eventFingerprint: createHash("sha256").update(`${theme.themeId}|${tokens(item.title).sort().join("-")}`).digest("hex"),
      duplicationScore: duplicateScore,
      informationGainScore: score,
      imagePolicy: "no-external-news-image",
      imageRightsRecord: "No external image stored; use a neutral owned site asset or no image.",
      createdAt: new Date().toISOString()
    });
  }

  candidates.sort((a, b) => b.informationGainScore - a.informationGainScore || new Date(b.sourcePublishedAt) - new Date(a.sourcePublishedAt));
  return { site, candidates, rejectedSources, errors: sourceErrors, sourceGroups: [...new Set(items.map((item) => item.sourceGroup))] };
}
