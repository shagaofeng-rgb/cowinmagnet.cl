import { getCmsItems, saveCmsItem, withCmsAdvisoryLock } from "@/lib/cmsStore";
import { DEFAULT_NEWS_SITE_ID } from "@/lib/newsSiteConfig.mjs";
import { sourceCatalog } from "@/data/news/cowinmagnet-cl-source-catalog.mjs";
import { buildValidationResult, classifySource } from "@/lib/newsSourceValidation.mjs";

const USER_AGENT = "COWIN-Magnet-News-Source-Health/1.0 (+https://cowinmagnet.cl/es-cl/news)";
const MAX_BATCH_SIZE = 6;

function absoluteUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function robotsPermits(text = "") {
  const lines = String(text).split(/\r?\n/).map((line) => line.replace(/#.*/, "").trim());
  let applies = false;
  let blocked = false;
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.*)$/i);
    if (!match) continue;
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (key === "user-agent") {
      applies = value === "*" || /cowin|newsbot/i.test(value);
      continue;
    }
    if (applies && key === "disallow" && (value === "/" || value === "/*")) blocked = true;
  }
  return !blocked;
}

function discoverFeedUrls(html = "", pageUrl = "") {
  const matches = [...String(html).matchAll(/<link\b[^>]*>/gi)];
  return matches.flatMap((match) => {
    const tag = match[0];
    const type = tag.match(/type=["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1] || "";
    if (!/alternate/.test(rel) || !/(rss|atom|json)/.test(type)) return [];
    const value = absoluteUrl(href, pageUrl);
    const method = /atom/.test(type) ? "atom" : /json/.test(type) ? "json-feed" : "rss";
    return value ? [{ url: value, method }] : [];
  });
}

async function fetchSafe(url, { accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" } = {}) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept },
    redirect: "follow",
    signal: AbortSignal.timeout(12000)
  });
  return {
    status: response.status,
    finalUrl: response.url || url,
    contentType: response.headers.get("content-type") || "",
    text: await response.text()
  };
}

async function validateCatalogSource(entry) {
  if (entry.tier === "discovery-only") {
    return buildValidationResult(entry, {
      status: 200,
      finalUrl: `https://${entry.canonicalDomain}/`,
      robotsAllowed: false,
      discoveryMethod: [],
      reason: "discovery_only_source"
    });
  }

  const homeUrl = `https://${entry.requestedDomain}/`;
  try {
    const robots = await fetchSafe(`${homeUrl}robots.txt`, { accept: "text/plain,*/*;q=0.8" });
    const robotsAllowed = robots.status === 404 ? true : robots.status >= 200 && robots.status < 400 ? robotsPermits(robots.text) : false;
    if (!robotsAllowed) {
      return buildValidationResult(entry, { status: robots.status, finalUrl: robots.finalUrl, robotsAllowed: false, discoveryMethod: [], reason: "robots_disallow_or_unavailable" });
    }

    const home = await fetchSafe(homeUrl);
    if (home.status < 200 || home.status >= 400) {
      return buildValidationResult(entry, { status: home.status, finalUrl: home.finalUrl, robotsAllowed, discoveryMethod: [], reason: "source_home_unavailable" });
    }
    if (entry.rssOrApiUrl) {
      const feed = await fetchSafe(entry.rssOrApiUrl, { accept: "application/rss+xml,application/atom+xml,application/feed+json,application/json,text/xml,application/xml;q=0.9,*/*;q=0.8" });
      const method = entry.discoveryMethod?.[0] || "rss";
      const hasEntries = method === "json-feed" ? /"items"\s*:/.test(feed.text) : method === "atom" ? /<entry(?:\s|>)/i.test(feed.text) : /<item(?:\s|>)/i.test(feed.text);
      if (feed.status >= 200 && feed.status < 400 && hasEntries) {
        return buildValidationResult(entry, {
          status: feed.status,
          finalUrl: feed.finalUrl,
          robotsAllowed,
          discoveryMethod: [method],
          contentLanguages: entry.contentLanguages,
          rssOrApiUrl: entry.rssOrApiUrl,
          reason: "verified_legacy_feed_endpoint"
        });
      }
    }
    const discovered = discoverFeedUrls(home.text, home.finalUrl);
    const feed = discovered[0] || null;
    const rssOrApiUrl = feed?.url || "";
    return buildValidationResult(entry, {
      status: home.status,
      finalUrl: home.finalUrl,
      robotsAllowed,
      discoveryMethod: feed ? [feed.method] : ["public-page"],
      contentLanguages: entry.contentLanguages,
      reason: feed ? `verified_${feed.method}_discovery` : "public_page_only_needs_adapter",
      rssOrApiUrl
    });
  } catch (error) {
    return buildValidationResult(entry, {
      status: 0,
      finalUrl: homeUrl,
      robotsAllowed: false,
      discoveryMethod: [],
      reason: `validation_request_failed:${String(error?.message || error).slice(0, 140)}`
    });
  }
}

function healthRecord(entry, validation, siteId) {
  return {
    type: "news-source-health",
    siteId,
    slug: entry.id,
    title: entry.name,
    status: validation.active ? "verified" : "inactive",
    sourceId: entry.id,
    sourceOrdinal: entry.sourceOrdinal,
    sourceGroup: entry.sourceGroup,
    tier: classifySource(entry),
    region: entry.region,
    requestedDomain: entry.requestedDomain,
    canonicalDomain: validation.canonicalDomain,
    contentLanguages: validation.contentLanguages?.length ? validation.contentLanguages : entry.contentLanguages,
    discoveryMethod: validation.discoveryMethod,
    feedFormat: validation.discoveryMethod?.[0] || "",
    rssOrApiUrl: validation.rssOrApiUrl || "",
    active: validation.active,
    validationStatus: validation.validationStatus,
    robotsAllowed: validation.robotsAllowed,
    httpStatus: validation.httpStatus,
    finalUrl: validation.finalUrl,
    reason: validation.reason,
    checkedAt: validation.checkedAt
  };
}

export async function runNewsSourceHealthCheck({ siteId = DEFAULT_NEWS_SITE_ID, limit = MAX_BATCH_SIZE, force = false, trigger = "cron" } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || MAX_BATCH_SIZE, MAX_BATCH_SIZE));
  return withCmsAdvisoryLock(`news:source-health:${siteId}`, async () => {
    const existing = await getCmsItems("news-source-health", { includeInactive: true, siteId });
    const known = new Map(existing.map((entry) => [entry.sourceId, entry]));
    const staleBefore = Date.now() - 14 * 86400000;
    const pending = sourceCatalog.filter((entry) => {
      if (entry.tier === "discovery-only") return false;
      const check = known.get(entry.id);
      return force || !check || new Date(check.checkedAt || 0).getTime() < staleBefore;
    }).sort((left, right) => Number(Boolean(right.rssOrApiUrl)) - Number(Boolean(left.rssOrApiUrl)) || left.sourceOrdinal - right.sourceOrdinal).slice(0, safeLimit);
    const validations = [];
    for (const entry of pending) {
      const validation = await validateCatalogSource(entry);
      const record = healthRecord(entry, validation, siteId);
      await saveCmsItem(record);
      validations.push(record);
    }
    const result = {
      success: true,
      status: "source_health_completed",
      siteId,
      trigger,
      checked: validations.length,
      verified: validations.filter((item) => item.active).length,
      inactive: validations.filter((item) => !item.active).length,
      nextRunAt: new Date(Date.now() + 12 * 3600000).toISOString(),
      results: validations.map((item) => ({ sourceId: item.sourceId, domain: item.canonicalDomain, status: item.validationStatus, reason: item.reason }))
    };
    await saveCmsItem({
      type: "news-source-health-run",
      siteId,
      slug: `news-source-health-run-${Date.now()}`,
      title: "News source health run",
      status: "completed",
      ...result,
      createdAt: new Date().toISOString()
    });
    return result;
  });
}
