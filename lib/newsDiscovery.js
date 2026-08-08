const SOURCE_FEEDS = [
  { group: "government-regulator", name: "Sernageomin Chile", url: "https://www.sernageomin.cl/feed/", country: "Chile" },
  { group: "government-market", name: "COCHILCO", url: "https://www.cochilco.cl/web/feed/", country: "Chile" },
  { group: "government-mining", name: "Ministerio de Mineria Chile", url: "https://www.minmineria.cl/feed/", country: "Chile" },
  { group: "trade-publication", name: "Canadian Mining Journal", url: "https://www.canadianminingjournal.com/feed/", country: "Canada" },
  { group: "trade-publication", name: "Mining Technology", url: "https://www.mining-technology.com/feed/", country: "Americas" },
  { group: "trade-publication", name: "The Northern Miner", url: "https://www.northernminer.com/feed/", country: "Canada" }
];

function decode(value = "") {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&#8230;/g, "...")
    .replace(/\s+/g, " ").trim();
}

function tag(item, name) {
  return item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || "";
}

function parseFeed(xml, source) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 12).map((match) => {
    const raw = match[1];
    const url = decode(tag(raw, "link"));
    const publishedAt = new Date(decode(tag(raw, "pubDate")) || 0);
    return {
      sourceName: source.name, sourceGroup: source.group, country: source.country,
      title: decode(tag(raw, "title")), url,
      excerpt: decode(tag(raw, "description")).slice(0, 1800),
      publishedAt: Number.isNaN(publishedAt.getTime()) ? "" : publishedAt.toISOString(),
      accessedAt: new Date().toISOString(), domain: new URL(source.url).hostname.replace(/^www\./, "")
    };
  }).filter((item) => item.title && item.url && item.excerpt);
}

async function fetchFeed(source) {
  const response = await fetch(source.url, { headers: { "user-agent": "CowinmagnetEditorialBot/1.0 (+https://cowinmagnet.cl/es-cl/news)" }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`${source.name} feed returned ${response.status}`);
  return parseFeed(await response.text(), source);
}

const clusters = [
  { id: "cobre-mineria-procesamiento", productSlug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", image: "/assets/markets/chile-copper-ore.jpg", terms: /cobre|mineri|faena|chanc|mineral|seguridad/i },
  { id: "litio-relaves-minerales", productSlug: "wet-drum-magnetic-separator", image: "/assets/markets/antofagasta-copper.jpg", terms: /litio|relave|pulpa|mineral|agua/i },
  { id: "aridos-cemento", productSlug: "rcyb-type-permanent-magnet-manual-iron-remover", image: "/assets/markets/argentina-limestone.jpg", terms: /arido|cantera|cemento|chanc|construccion/i },
  { id: "reciclaje-metales", productSlug: "dry-drum-magnetic-separator", image: "/assets/markets/uruguay-recycling-line.jpg", terms: /recicl|residuo|metal|circular/i },
  { id: "puertos-graneles", productSlug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", image: "/assets/markets/colombia-coal.jpg", terms: /puerto|granel|correa|transporte|logistica/i },
  { id: "seguridad-y-proteccion-de-planta", productSlug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", image: "/assets/markets/chile-copper-ore.jpg", terms: /seguridad|mantenimiento|planta|trituradora|correa/i },
  { id: "agua-y-procesamiento-mineral", productSlug: "wet-drum-magnetic-separator", image: "/assets/markets/antofagasta-copper.jpg", terms: /agua|proceso|mineral|concentradora|beneficio/i },
  { id: "infraestructura-y-materiales", productSlug: "rcyb-type-permanent-magnet-manual-iron-remover", image: "/assets/markets/argentina-limestone.jpg", terms: /infraestructura|construccion|agregado|materiales|cantera/i },
  { id: "recuperacion-y-economia-circular", productSlug: "dry-drum-magnetic-separator", image: "/assets/markets/uruguay-recycling-line.jpg", terms: /recuperacion|circular|chatarra|residuo|valorizacion/i }
];

function rootDomain(value = "") {
  const parts = String(value).toLowerCase().replace(/^www\./, "").split(".").filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
}

function sourceUrls(article) {
  return [article?.sourceUrl, ...(Array.isArray(article?.sources) ? article.sources.map((source) => source?.url) : [])].filter(Boolean);
}

function sourceDomains(article) {
  return sourceUrls(article).map((url) => {
    try { return rootDomain(new URL(url).hostname); } catch { return ""; }
  }).filter(Boolean);
}

function withinDays(value, days) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) && Date.now() - time < days * 86400000;
}

function topicCount(recentArticles, clusterId, days) {
  return recentArticles.filter((article) => article.topicClusterId === clusterId && withinDays(article.publishedAt || article.createdAt, days)).length;
}

export async function discoverEditorialEvidence(recentArticles = [], context = {}) {
  const settled = await Promise.allSettled(SOURCE_FEEDS.map(fetchFeed));
  const articles = settled.flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .filter((item) => !item.publishedAt || Date.now() - new Date(item.publishedAt).getTime() <= 90 * 86400000);
  const selectedUrls = new Set([...(context.selectedUrls || []), ...recentArticles.flatMap(sourceUrls)]);
  const recentDomainUsage = new Map();
  for (const article of recentArticles.slice(0, 10)) {
    for (const domain of sourceDomains(article)) recentDomainUsage.set(domain, (recentDomainUsage.get(domain) || 0) + 1);
  }
  const batchDomainUsage = new Map(context.domainUsage || []);
  const recentTopics = recentArticles.slice(0, 4).map((item) => item.topicClusterId).filter(Boolean);
  const recentProducts = recentArticles.slice(0, 3).map((item) => item.productSlug).filter(Boolean);
  const rejectedSources = [];
  for (const cluster of clusters) {
    if (recentTopics[0] === cluster.id || recentProducts.includes(cluster.productSlug) || topicCount(recentArticles, cluster.id, 1) >= 1 || topicCount(recentArticles, cluster.id, 7) >= 3) continue;
    const matches = articles.filter((item) => cluster.terms.test(`${item.title} ${item.excerpt}`) && !selectedUrls.has(item.url));
    const selected = [];
    const domains = new Set();
    for (const item of matches) {
      const domain = rootDomain(item.domain);
      const usage = (recentDomainUsage.get(domain) || 0) + (batchDomainUsage.get(domain) || 0);
      if (domains.has(domain)) { rejectedSources.push({ url: item.url, reason: "same_domain_in_candidate" }); continue; }
      if (usage >= 2) { rejectedSources.push({ url: item.url, reason: "domain_limit_last_ten" }); continue; }
      selected.push(item); domains.add(domain);
      if (selected.length === 2) break;
    }
    if (selected.length === 2) {
      const countryFocus = selected[0].country || "Americas";
      const selectedDomains = selected.map((item) => rootDomain(item.domain));
      const newDomainWeight = selectedDomains.reduce((score, domain) => score + ((recentDomainUsage.get(domain) || 0) === 0 ? 1.5 : 0.5), 0);
      return { cluster, sources: selected, countryFocus, rejectedSources, informationGainScore: 3 + newDomainWeight + 2, selectedDomains };
    }
  }
  return { cluster: null, sources: [], rejectedSources, errors: settled.filter((item) => item.status === "rejected").map((item) => String(item.reason?.message || item.reason)) };
}
