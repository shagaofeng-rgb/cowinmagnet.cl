import { sourceCatalog } from "../data/news/cowinmagnet-cl-source-catalog.mjs";
import { getCmsItems } from "./cmsStore.js";

export function canonicalDomain(value = "") {
  try {
    const hostname = new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, "");
    const parts = hostname.split(".").filter(Boolean);
    const compoundPublicSuffixes = new Set(["co.uk", "org.uk", "ac.uk", "com.au", "com.br", "com.ar", "com.pe", "com.mx", "co.za", "co.nz"]);
    const suffix = parts.slice(-2).join(".");
    return parts.length > 3 && compoundPublicSuffixes.has(suffix) ? parts.slice(-3).join(".") : parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
  } catch {
    return "";
  }
}

export function verifiedCatalogEntry(domain) {
  const canonical = canonicalDomain(domain);
  return sourceCatalog.find((entry) => entry.canonicalDomain === canonical) || null;
}

function configuredCatalogEntry(source, sourceOrdinal, existing) {
  const domain = canonicalDomain(source.domain || source.rssOrApiUrl);
  return {
    ...existing,
    id: existing?.id || `configured-${domain.replace(/[^a-z0-9]+/g, "-")}`,
    sourceId: existing?.sourceId || existing?.id || `configured-${domain.replace(/[^a-z0-9]+/g, "-")}`,
    sourceOrdinal,
    name: source.name,
    title: source.name,
    requestedDomain: source.domain,
    canonicalDomain: domain,
    sourceGroup: source.group,
    region: source.country,
    contentLanguages: source.allowedLanguages || [],
    discoveryMethod: [source.feedFormat || "rss"],
    rssOrApiUrl: source.rssOrApiUrl,
    tier: existing?.tier || (source.type === "regulator" || source.type === "government-market" || source.type === "government-mining" ? "A" : "B"),
    active: existing?.active || false,
    validationStatus: existing?.validationStatus || "pending",
    robotsAllowed: existing?.robotsAllowed ?? null,
    configuredPriority: true
  };
}

export function sourceCatalogForNewsSite(site) {
  const configured = [...(site?.sources?.primaryWhitelist || []), ...(site?.sources?.fallbackWhitelist || [])];
  const staticByDomain = new Map(sourceCatalog.map((entry) => [entry.canonicalDomain, entry]));
  const priority = configured.map((source, index) => configuredCatalogEntry(source, index, staticByDomain.get(canonicalDomain(source.domain))));
  const priorityDomains = new Set(priority.map((entry) => entry.canonicalDomain));
  return [...priority, ...sourceCatalog.filter((entry) => !priorityDomains.has(entry.canonicalDomain))];
}

function asDiscoverySource(entry) {
  return {
    domain: entry.canonicalDomain,
    sourceId: entry.sourceId || entry.id,
    type: entry.tier === "A" ? "official-source" : "trade-media",
    name: entry.title || entry.name,
    group: entry.sourceGroup,
    country: entry.region,
    allowedTopics: entry.industryTags || [],
    allowedLanguages: entry.contentLanguages || [],
    rssOrApiUrl: entry.rssOrApiUrl,
    feedFormat: entry.feedFormat || entry.discoveryMethod?.[0] || "rss",
    sourceTrustScore: entry.tier === "A" ? 90 : entry.tier === "B" ? 80 : 70,
    tier: entry.tier,
    region: entry.region,
    contentLanguages: entry.contentLanguages
  };
}

function activeCatalogSource(entry) {
  return Boolean(entry?.active && entry.validationStatus === "verified" && entry.robotsAllowed === true && entry.tier !== "discovery-only" && entry.discoveryMethod?.some((method) => ["rss", "atom", "json-feed"].includes(method)) && entry.rssOrApiUrl);
}

export async function activeSourcesForNewsSite(site, { fallback = false } = {}) {
  const configured = [...(site?.sources?.primaryWhitelist || []), ...(fallback ? site?.sources?.fallbackWhitelist || [] : [])];
  const health = await getCmsItems("news-source-health", { includeInactive: true, siteId: site?.siteId });
  const validatedByDomain = new Map(health.filter(activeCatalogSource).map((entry) => [entry.canonicalDomain, entry]));
  const configuredSources = configured.flatMap((source) => {
    const catalogEntry = sourceCatalogForNewsSite(site).find((entry) => entry.canonicalDomain === canonicalDomain(source.domain)) || null;
    const validated = validatedByDomain.get(canonicalDomain(source.domain));
    const eligible = validated || (activeCatalogSource(catalogEntry) ? catalogEntry : null);
    if (!eligible) return [];
    const feed = validated?.rssOrApiUrl || source.rssOrApiUrl || catalogEntry?.rssOrApiUrl;
    if (!feed) return [];
    return [{
      ...source,
      domain: eligible.canonicalDomain,
      sourceId: eligible.sourceId || eligible.id,
      rssOrApiUrl: feed,
      feedFormat: validated?.feedFormat || eligible.discoveryMethod?.[0] || "rss",
      tier: eligible.tier,
      region: eligible.region,
      contentLanguages: eligible.contentLanguages
    }];
  });
  const configuredDomains = new Set(configuredSources.map((source) => source.domain));
  const validatedSources = health.filter(activeCatalogSource).filter((entry) => !configuredDomains.has(entry.canonicalDomain)).map(asDiscoverySource);
  return [...configuredSources, ...validatedSources];
}

export function sourceIsEligibleForPublishing(entry) {
  return Boolean(entry?.active && entry.validationStatus === "verified" && entry.robotsAllowed === true && entry.tier !== "discovery-only");
}
