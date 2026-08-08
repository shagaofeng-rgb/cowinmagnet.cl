const SOURCE_FEEDS = [
  { group: "government-regulator", name: "Sernageomin Chile", url: "https://www.sernageomin.cl/feed/", country: "Chile" },
  { group: "government-market", name: "COCHILCO", url: "https://www.cochilco.cl/web/feed/", country: "Chile" },
  { group: "government-mining", name: "Ministerio de Mineria Chile", url: "https://www.minmineria.cl/feed/", country: "Chile" }
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
  { id: "puertos-graneles", productSlug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", image: "/assets/markets/colombia-coal.jpg", terms: /puerto|granel|correa|transporte|logistica/i }
];

export async function discoverEditorialEvidence(recentArticles = []) {
  const settled = await Promise.allSettled(SOURCE_FEEDS.map(fetchFeed));
  const articles = settled.flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .filter((item) => !item.publishedAt || Date.now() - new Date(item.publishedAt).getTime() <= 90 * 86400000);
  const recentTopics = recentArticles.slice(0, 4).map((item) => item.topicClusterId).filter(Boolean);
  for (const cluster of clusters) {
    if (recentTopics[0] === cluster.id) continue;
    const matches = articles.filter((item) => cluster.terms.test(`${item.title} ${item.excerpt}`));
    const selected = [];
    const domains = new Set();
    for (const item of matches) {
      if (domains.has(item.domain)) continue;
      selected.push(item); domains.add(item.domain);
      if (selected.length === 2) break;
    }
    if (selected.length === 2) return { cluster, sources: selected };
  }
  return { cluster: null, sources: [], errors: settled.filter((item) => item.status === "rejected").map((item) => String(item.reason?.message || item.reason)) };
}
