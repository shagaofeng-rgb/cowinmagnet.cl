import { revalidatePath, revalidateTag } from "next/cache";
import { getCmsItems, saveCmsItem, slugify, withCmsLease } from "@/lib/cmsStore";
import { products } from "@/data/catalog";
import crypto from "node:crypto";

const DAY = 24 * 60 * 60 * 1000;
const USER_AGENT = "CowinmagnetNewsBot/1.0 (+https://cowinmagnet.cl)";
const DAILY_NEWS_QUOTA = Number(process.env.NEWS_DAILY_TARGET || 4);
const NEWS_TIME_ZONE = process.env.NEWS_TIMEZONE || "America/Santiago";
const NEWS_LOOKBACK_HOURS = Number(process.env.NEWS_LOOKBACK_HOURS || 72);
const NEWS_DEDUP_DAYS = Number(process.env.NEWS_DEDUP_DAYS || 7);
const NEWS_RELEVANCE_THRESHOLD = Number(process.env.NEWS_RELEVANCE_THRESHOLD || 2);
const AMERICAS_REGION = "Americas";
const GOOGLE_NEWS_BASE = "https://news.google.com/rss/search";

function googleNewsRss(query, locale = "es-419", country = "CL") {
  const lookbackDays = Math.max(1, Math.ceil(NEWS_LOOKBACK_HOURS / 24));
  const params = new URLSearchParams({
    q: `${query} when:${lookbackDays}d`,
    hl: locale,
    gl: country,
    ceid: `${country}:${locale}`
  });
  return `${GOOGLE_NEWS_BASE}?${params.toString()}`;
}

export const sourcePool = [
  {
    group: "Industry News",
    name: "MINING.com Latin America",
    url: "https://www.mining.com/feed/",
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "MINING.com Latin America region",
    url: "https://www.mining.com/region/latin-america/feed/",
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Mining Technology Americas",
    url: "https://www.internationalmining.com/feed/",
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Trade Publications",
    name: "Cement Americas",
    url: "https://www.cementamericas.com/feed/",
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Trade Publications",
    name: "Mining Technology project news",
    url: "https://www.mining-technology.com/feed/",
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Trade Publications",
    name: "Equipment Journal North America",
    url: "https://www.equipmentjournal.com/feed/",
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Government / Standards Updates",
    name: "NS Energy Americas",
    url: "https://www.nsenergybusiness.com/feed/",
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Manufacturer Blogs",
    name: "Suppliers and equipment mining news",
    url: "https://www.mining.com/category/suppliers-equipment/feed/",
    weight: 1,
    region: AMERICAS_REGION
  },
  {
    group: "Manufacturer Blogs",
    name: "North American equipment suppliers",
    url: "https://www.equipmentjournal.com/feed/",
    weight: 1,
    region: AMERICAS_REGION
  },
  {
    group: "Engineering Forums / Technical Posts",
    name: "Bulk handling Americas technical watch",
    url: "https://www.bulk-solids-handling.com/feed/",
    weight: 1,
    region: AMERICAS_REGION
  },
  {
    group: "Trade Publications",
    name: "Canadian Mining Journal",
    url: "https://www.canadianminingjournal.com/feed/",
    weight: 3,
    region: AMERICAS_REGION,
    market: "canada"
  },
  {
    group: "Industry News",
    name: "The Northern Miner",
    url: "https://www.northernminer.com/feed/",
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Peru Minero",
    url: "https://peruminero.pe/feed/",
    weight: 3,
    region: AMERICAS_REGION,
    market: "peru"
  },
  {
    group: "Industry News",
    name: "Mineria y Desarrollo Latinoamerica",
    url: "https://www.mineriaydesarrollo.com/rss/latinoamerica/",
    weight: 3,
    region: AMERICAS_REGION,
    market: "latin america"
  },
  {
    group: "Engineering Forums / Technical Posts",
    name: "REDIMIN Chile technical mining",
    url: "https://www.redimin.cl/rss",
    weight: 2,
    region: AMERICAS_REGION,
    market: "chile"
  },
  {
    group: "Trade Publications",
    name: "Heavy Equipment Guide aggregates",
    url: "https://www.heavyequipmentguide.ca/rss/aggregates-1.xml",
    weight: 2,
    region: AMERICAS_REGION,
    market: "canada"
  },
  {
    group: "Manufacturer Blogs",
    name: "Heavy Equipment Guide equipment",
    url: "https://www.heavyequipmentguide.ca/rss/equipment-75.xml",
    weight: 2,
    region: AMERICAS_REGION,
    market: "canada"
  },
  {
    group: "Industry News",
    name: "Google News Chile mining equipment watch",
    url: googleNewsRss("Chile mineria cobre equipos transportadores chancadores separacion magnetica OR detector de metales"),
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Google News Peru mining equipment watch",
    url: googleNewsRss("Peru mineria cobre equipos transportadores chancadoras separacion magnetica OR detector de metales", "es-419", "PE"),
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Google News Brazil mining processing watch",
    url: googleNewsRss("Brasil mineracao minerio ferro correias transportadoras separador magnetico detector metais", "pt-BR", "BR"),
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Trade Publications",
    name: "Google News Americas cement aggregates watch",
    url: googleNewsRss("Latin America cement aggregates conveyor crusher metal detector magnetic separator", "en-US", "US"),
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Engineering Forums / Technical Posts",
    name: "Google News Americas recycling metal sorting watch",
    url: googleNewsRss("Americas recycling metal sorting eddy current separator magnetic separator", "en-US", "US"),
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Government / Standards Updates",
    name: "Google News Americas critical minerals policy watch",
    url: googleNewsRss("Americas critical minerals mining processing plant permitting safety conveyor equipment", "en-US", "US"),
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Google News Chile copper project watch",
    url: googleNewsRss("Chile Codelco Antofagasta copper mining project conveyor equipment", "en-US", "US"),
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Google News Peru copper plant watch",
    url: googleNewsRss("Peru mining copper project processing plant conveyor equipment", "en-US", "US"),
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Industry News",
    name: "Google News Brazil iron ore plant watch",
    url: googleNewsRss("Brazil iron ore mining processing plant conveyor equipment", "en-US", "US"),
    weight: 3,
    region: AMERICAS_REGION
  },
  {
    group: "Trade Publications",
    name: "Google News North America mine equipment watch",
    url: googleNewsRss("Canada United States mining equipment conveyor magnetic separator metal detector", "en-US", "US"),
    weight: 2,
    region: AMERICAS_REGION
  },
  {
    group: "Engineering Forums / Technical Posts",
    name: "Google News Americas bulk handling watch",
    url: googleNewsRss("Americas bulk material handling conveyor crusher quarry aggregate equipment", "en-US", "US"),
    weight: 2,
    region: AMERICAS_REGION
  }
];

const topicMap = [
  {
    id: "chile-copper-conveyor-protection",
    keywords: ["chile", "copper", "cost", "tie-up", "collahuasi", "quebrada", "codelco", "antofagasta"],
    seo: ["Chile copper mining equipment", "conveyor protection magnet Chile", "tramp iron removal copper mine"]
  },
  {
    id: "chile-copper-project-infrastructure",
    keywords: ["chile", "codelco", "anglo american", "los bronces", "andina", "copper mines", "power lines", "transmission", "copper"],
    seo: ["Chile copper mining equipment", "copper mine conveyor protection", "magnetic separator Chile mining"]
  },
  {
    id: "peru-mining-projects-and-permitting",
    keywords: ["peru", "peruvian", "mina justa", "las bambas", "antamina", "quellaveco", "permitting", "investment"],
    seo: ["Peru mining equipment", "tramp iron removal Peru", "magnetic separator for copper mine"]
  },
  {
    id: "brazil-mining-processing-automation",
    keywords: ["brazil", "vale", "minas", "gerais", "ai-powered", "automation", "productivity", "iron ore"],
    seo: ["Brazil iron ore processing", "mining plant automation", "magnetic separation iron ore"]
  },
  {
    id: "north-america-equipment-and-workforce",
    keywords: ["canada", "ontario", "quebec", "british columbia", "north america", "haul truck", "excavator", "workforce", "wage", "equipment"],
    seo: ["North America mining equipment", "mine conveyor protection", "magnetic separation equipment"]
  },
  {
    id: "critical-minerals-processing-americas",
    keywords: ["critical minerals", "rare earth", "lithium", "cobalt", "nickel", "battery", "processing", "refinery", "supply chain"],
    seo: ["critical minerals processing equipment", "magnetic separation critical minerals", "metal recovery equipment Americas"]
  },
  {
    id: "latin-america-cement-material-handling",
    keywords: ["latin america", "cement", "clinker", "hydration", "dust", "aggregate", "limestone", "materials"],
    seo: ["cement conveyor iron remover", "Latin America cement industry", "magnetic separator for cement plant"]
  },
  {
    id: "equipment-monitoring-and-safety",
    keywords: ["hazard", "monitoring", "sensor", "camera", "collision", "ai in mining", "automation", "safety"],
    seo: ["mining equipment monitoring", "conveyor safety sensor", "metal detector for conveyor"]
  },
  {
    id: "south-america-mining-magnetic-separation",
    keywords: ["mining", "mine", "copper", "iron ore", "lithium", "ore", "mineral", "tailings"],
    seo: ["magnetic separator for mining", "South America mining equipment", "tramp iron removal"]
  },
  {
    id: "recycling-metal-recovery-sorting",
    keywords: ["recycling", "scrap", "waste", "eddy current", "non-ferrous", "sorting", "aluminum"],
    seo: ["eddy current separator", "metal recovery recycling", "recycling sorting equipment"]
  },
  {
    id: "battery-recycling-metal-recovery",
    keywords: ["battery", "ev battery", "repurposing", "black mass", "recycling", "metal recovery", "sorting"],
    seo: ["battery recycling metal recovery", "eddy current separator recycling", "magnetic separator recycling"]
  },
  {
    id: "cement-aggregates-crusher-protection",
    keywords: ["cement", "aggregate", "quarry", "crusher", "conveyor", "limestone", "bulk handling"],
    seo: ["crusher protection magnet", "aggregate conveyor metal detector", "iron remover for cement"]
  },
  {
    id: "technical-equipment-innovation",
    keywords: ["separator", "magnetic", "electromagnetic", "wet", "dry", "cooling", "sensor", "detection"],
    seo: ["wet magnetic separator", "dry magnetic separator", "electromagnetic separator cooling"]
  },
  {
    id: "policy-standards-permitting",
    keywords: ["policy", "regulation", "standard", "environment", "permit", "government", "safety"],
    seo: ["mining environmental compliance", "metal contamination control", "mining safety equipment"]
  }
];

function decodeEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/â/g, "'")
    .replace(/â/g, "'")
    .replace(/â/g, '"')
    .replace(/â/g, '"')
    .replace(/â|â/g, "-")
    .replace(/â¦/g, "...")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeEntities(match?.[1] || "");
}

function getAttr(block, tag, attr) {
  const match = block.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return decodeEntities(match?.[1] || "");
}

function getRootDomain(url = "") {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    const parts = host.split(".");
    if (parts.length <= 2) return host;
    const secondLevel = ["com", "org", "net", "gov", "edu", "co"].includes(parts.at(-2));
    return secondLevel && parts.length >= 3 ? parts.slice(-3).join(".") : parts.slice(-2).join(".");
  } catch {
    return "";
  }
}

function normalizeUrl(url = "") {
  try {
    const parsed = new URL(url);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => parsed.searchParams.delete(key));
    return parsed.toString();
  } catch {
    return url;
  }
}

function hash(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function normalizedTitle(value = "") {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIsoDate(value = "") {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : "";
}

function isWithinLookback(value, hours = NEWS_LOOKBACK_HOURS) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return false;
  return Date.now() - time <= hours * 60 * 60 * 1000 && time <= Date.now() + 10 * 60 * 1000;
}

function tokenize(value = "") {
  return decodeEntities(value).toLowerCase().split(/[^a-z0-9áéíóúñü]+/i).filter((word) => word.length > 2);
}

function vectorize(value = "") {
  const tokens = tokenize(value);
  const map = new Map();
  for (const token of tokens) map.set(token, (map.get(token) || 0) + 1);
  return map;
}

function cosine(a, b) {
  const va = vectorize(a);
  const vb = vectorize(b);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const value of va.values()) magA += value * value;
  for (const value of vb.values()) magB += value * value;
  for (const [key, value] of va.entries()) dot += value * (vb.get(key) || 0);
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function countrySignal(candidate) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.sourceName} ${candidate.market || ""} ${candidate.link}`.toLowerCase();
  const pairs = [
    ["chile", ["chile", "codelco", "antofagasta", "atacama", "collahuasi"]],
    ["peru", ["peru", "peruvian", "antamina", "quellaveco", "las bambas"]],
    ["brazil", ["brazil", "brasil", "vale", "minas gerais", "sao paulo", "s茫o paulo"]],
    ["argentina", ["argentina", "salta", "jujuy"]],
    ["canada", ["canada", "ontario", "quebec", "qu茅bec", "british columbia", "alberta"]],
    ["usa", ["united states", "usa", "u.s.", "nevada", "arizona", "utah", "california", "texas", "new york"]],
    ["americas", ["america", "americas", "latin america", "south america", "north america"]]
  ];
  return pairs.find(([, keys]) => keys.some((key) => text.includes(key)))?.[0] || "americas";
}

function angleSignal(candidate) {
  const text = `${candidate.title} ${candidate.summary}`.toLowerCase();
  if (/(permit|permitting|policy|regulation|standard|environment|approval|approved|government)/i.test(text)) return "policy";
  if (/(equipment|truck|excavator|conveyor|crusher|separator|magnet|detector|sensor|automation|technology|plant)/i.test(text)) return "equipment";
  if (/(investment|finance|funding|sale|acquire|deal|joint|agreement|merger|project|expansion|production)/i.test(text)) return "market";
  if (/(recycling|battery|scrap|recovery|waste|sorting)/i.test(text)) return "recycling";
  return "industry";
}

function inferTopic(candidate) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.sourceName}`.toLowerCase();
  let best = topicMap[0];
  let bestScore = -1;
  for (const topic of topicMap) {
    const score = topic.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  const country = countrySignal(candidate);
  const angle = angleSignal(candidate);
  return {
    ...best,
    baseId: best.id,
    id: `${best.id}-${country}-${angle}`
  };
}

function eventKey(candidate) {
  const words = tokenize(`${candidate.title} ${candidate.summary}`)
    .filter((word) => !["says", "will", "with", "from", "that", "this", "into", "over", "after", "before", "mining", "news"].includes(word))
    .slice(0, 9);
  return words.sort().join("-");
}

function isSoftTopicReason(reason) {
  return ["topic_cluster_24h_limit", "topic_cluster_7d_limit", "topic_cluster_already_selected_this_run"].includes(reason);
}

function americasRelevanceScore(candidate) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.market || ""} ${candidate.link || candidate.url || ""}`.toLowerCase();
  const places = [
    "america", "americas", "latin america", "latam", "south america", "north america", "central america",
    "chile", "peru", "brazil", "brasil", "argentina", "bolivia", "colombia", "ecuador", "uruguay", "paraguay",
    "venezuela", "suriname", "guyana", "french guiana", "mexico", "canada", "united states", "usa", "u.s.",
    "panama", "costa rica", "guatemala", "dominican", "jamaica", "caribbean",
    "british columbia", "quebec", "québec", "ontario", "alberta", "saskatchewan", "nunavut", "yukon",
    "northwest territories", "toronto", "arizona", "nevada", "alaska", "montana", "idaho", "colorado",
    "texas", "california", "utah", "new york", "minas gerais", "atacama", "antofagasta"
  ];
  const companies = [
    "codelco", "vale", "sqm", "antofagasta", "collahuasi", "freeport", "southern copper", "teck",
    "lithium americas", "albemarle", "rio tinto", "bhp", "arcelormittal", "first quantum"
  ];
  const placeHits = places.filter((key) => text.includes(key)).length;
  if (!placeHits) return 0;
  return placeHits + companies.filter((key) => text.includes(key)).length;
}

function isAmericasRelevant(candidate) {
  return americasRelevanceScore(candidate) >= 1;
}

function relevanceScore(candidate) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.market || ""}`.toLowerCase();
  const southAmerica = ["chile", "peru", "brazil", "argentina", "bolivia", "colombia", "ecuador", "uruguay", "paraguay", "latin america", "south america", "latam", "vale", "minas", "são", "sao", "codelco", "antofagasta", "collahuasi"];
  const industry = ["mining", "copper", "iron ore", "lithium", "aggregate", "cement", "recycling", "scrap", "conveyor", "crusher", "magnetic", "separator", "metal detector", "eddy current", "bulk"];
  return southAmerica.filter((k) => text.includes(k)).length + industry.filter((k) => text.includes(k)).length;
}

function industryIntentScore(candidate) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.topic?.id || ""}`.toLowerCase();
  const primary = [
    "mining", "mine", "copper", "iron ore", "lithium", "ore", "mineral", "tailings", "quarry",
    "cement", "aggregate", "crusher", "conveyor", "bulk material", "material handling",
    "recycling", "scrap", "metal sorting", "metal detector", "magnetic separator", "eddy current"
  ];
  return primary.filter((keyword) => text.includes(keyword)).length;
}

function findRelatedProducts(candidate, limit = 3) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.topic?.id || ""}`.toLowerCase();
  const intentScore = industryIntentScore(candidate);
  if (intentScore < 2) return [];
  const scored = products.map((product) => {
    const haystack = [
      product.title,
      product.sourceCategory,
      product.summary,
      ...(product.features || []),
      ...(product.applications || []),
      product.category
    ].join(" ").toLowerCase();
    const titleHits = tokenize(product.title).filter((token) => text.includes(token)).length * 3;
    const categoryHits = tokenize(product.sourceCategory || product.category).filter((token) => text.includes(token)).length * 2;
    const applicationHits = (product.applications || []).flatMap(tokenize).filter((token) => text.includes(token)).length;
    const keywordHits = ["magnetic", "separator", "conveyor", "metal", "detector", "recycling", "mining", "cement", "crusher", "iron", "copper", "ore", "bulk"]
      .filter((token) => text.includes(token) && haystack.includes(token)).length;
    const score = titleHits + categoryHits + applicationHits + keywordHits;
    return {
      slug: product.slug,
      category: product.category,
      title: product.title,
      image: product.image,
      href: `/products/${product.category}/${product.slug}`,
      relevanceScore: score,
      relationshipReason: score
        ? "Matched by article topic, industry keywords and Cowinmagnet product application data."
        : "Fallback product selected from the magnetic separation catalog."
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  const matched = scored.filter((item) => item.relevanceScore >= NEWS_RELEVANCE_THRESHOLD).slice(0, limit);
  if (matched.length) return matched;
  return scored.slice(0, limit).map((item, index) => ({
    ...item,
    relevanceScore: Math.max(1, item.relevanceScore || (limit - index)),
    relationshipReason: "Fallback product selected because the article is broadly related to magnetic separation or industrial material handling."
  }));
}

async function fetchWithTimeout(url, timeoutMs = 6500, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { status: "fulfilled", value: await mapper(items[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

async function fetchFeed(source) {
  const response = await fetchWithTimeout(source.url, 6500);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xml = await response.text();
  const rssBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => ({ block: match[0], atom: false }));
  const atomBlocks = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => ({ block: match[0], atom: true }));
  const itemBlocks = [...rssBlocks, ...atomBlocks].slice(0, 14);
  const sourceFetchedAt = new Date().toISOString();
  return itemBlocks.map(({ block, atom }) => {
    const sourceUrl = getAttr(block, "source", "url");
    const itemLink = atom ? getAttr(block, "link", "href") : getTag(block, "link");
    const link = normalizeUrl(itemLink || getTag(block, "guid") || sourceUrl);
    const sourceTitle = getTag(block, "source") || source.name;
    const image = getAttr(block, "media:content", "url") || getAttr(block, "media:thumbnail", "url") || getAttr(block, "enclosure", "url");
    const sourcePublishedRaw = getTag(block, "pubDate") || getTag(block, "published") || getTag(block, "updated");
    const sourcePublishedAt = toIsoDate(sourcePublishedRaw);
    return {
      title: getTag(block, "title"),
      summary: getTag(block, "description") || getTag(block, "content:encoded"),
      link,
      canonicalSourceUrl: link,
      sourceName: sourceTitle,
      sourceFeed: source.name,
      sourceGroup: source.group,
      sourceWeight: source.weight,
      market: source.market || "",
      publishedAt: sourcePublishedAt,
      sourcePublishedAt,
      sourceFetchedAt,
      sourceTimezone: "source-provided",
      image: image || "",
      rootDomain: getRootDomain(sourceUrl || link)
    };
  }).filter((item) => item.title && item.link && item.rootDomain && item.sourcePublishedAt);
}

async function getOgImage(url) {
  try {
    const response = await fetchWithTimeout(url, 4500);
    if (!response.ok) return "";
    const html = await response.text();
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
      || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
    if (!og) return "";
    return new URL(decodeEntities(og), url).toString();
  } catch {
    return "";
  }
}

const fallbackNewsImages = [
  {
    match: /(recycling|scrap|waste|eddy current|sorting|metal recovery)/i,
    url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1400&q=80",
    credit: "Unsplash public image search, recycling and industrial sorting"
  },
  {
    match: /(cement|aggregate|quarry|crusher|limestone|bulk handling)/i,
    url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80",
    credit: "Unsplash public image search, aggregates and heavy industry"
  },
  {
    match: /(lithium|critical minerals|battery|cobalt|nickel)/i,
    url: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1400&q=80",
    credit: "Unsplash public image search, mineral processing industry"
  },
  {
    match: /(copper|chile|peru|mine|mining|iron ore|ore|tailings|brazil)/i,
    url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1400&q=80",
    credit: "Unsplash public image search, mining and material handling"
  },
  {
    match: /(conveyor|equipment|separator|magnetic|detector|plant|automation)/i,
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80",
    credit: "Unsplash public image search, industrial equipment"
  }
];

function fallbackNewsImage(candidate) {
  const text = `${candidate.title} ${candidate.summary} ${candidate.topic?.id || ""}`;
  const selected = fallbackNewsImages.find((item) => item.match.test(text)) || fallbackNewsImages[Math.abs(hash(text).charCodeAt(0)) % fallbackNewsImages.length];
  return selected;
}

async function isReachableImage(url = "") {
  if (!/^https?:\/\//i.test(url)) return false;
  if (url.includes("images.unsplash.com")) return true;
  try {
    const response = await fetchWithTimeout(url, 3500, { method: "HEAD" });
    const contentType = response.headers.get("content-type") || "";
    return response.ok && (contentType.startsWith("image/") || url.includes("images.unsplash.com"));
  } catch {
    return false;
  }
}

async function chooseNewsImage(candidate) {
  const fromFeed = candidate.image || "";
  if (fromFeed && await isReachableImage(fromFeed)) {
    return {
      url: fromFeed,
      policy: "cited_article_image",
      credit: candidate.sourceName || candidate.rootDomain,
      rightsUrl: candidate.link,
      status: "verified"
    };
  }

  const fromArticle = await getOgImage(candidate.link);
  if (fromArticle && await isReachableImage(fromArticle)) {
    return {
      url: fromArticle,
      policy: "cited_article_image",
      credit: candidate.sourceName || candidate.rootDomain,
      rightsUrl: candidate.link,
      status: "verified"
    };
  }

  const fallback = fallbackNewsImage(candidate);
  if (fallback.url && await isReachableImage(fallback.url)) {
    return {
      url: fallback.url,
      policy: "internet_topic_image_with_credit",
      credit: fallback.credit,
      rightsUrl: "https://unsplash.com/license",
      status: "verified_fallback"
    };
  }

  return {
    url: "",
    policy: "missing_image",
    credit: "",
    rightsUrl: "",
    status: "failed"
  };
}

function sourceUsage(posts) {
  const recent10 = posts.slice(0, 10);
  const counts = new Map();
  for (const post of recent10) {
    const domain = post.sourceDomain || getRootDomain(post.sourceUrl);
    if (domain) counts.set(domain, (counts.get(domain) || 0) + 1);
  }
  return counts;
}

function topicUsage(posts, topicId, windowMs) {
  const since = Date.now() - windowMs;
  return posts.filter((post) => post.topicClusterId === topicId && new Date(post.publishedAt || post.createdAt || post.date).getTime() >= since).length;
}

function wasDomainUsed(posts, domain, windowMs) {
  const since = Date.now() - windowMs;
  return posts.some((post) => (post.sourceDomain || getRootDomain(post.sourceUrl)) === domain && new Date(post.publishedAt || post.createdAt || post.date).getTime() >= since);
}

function wasSourceUsed(posts, canonicalUrl, windowMs) {
  const since = Date.now() - windowMs;
  return posts.some((post) => {
    const postUrl = normalizeUrl(post.canonicalSourceUrl || post.sourceUrl || "");
    const postTime = new Date(post.publishedAt || post.createdAt || post.date).getTime();
    return postUrl && postUrl === canonicalUrl && postTime >= since;
  });
}

function localDateKey(value = new Date(), timeZone = NEWS_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function countPublishedToday(posts) {
  const today = localDateKey();
  return posts.filter((post) => {
    if (post.type !== "news") return false;
    if (["offline", "draft"].includes(post.status)) return false;
    return localDateKey(post.publishedAt || post.createdAt || post.date) === today;
  }).length;
}

function maxSimilarity(candidate, posts) {
  const current = `${candidate.title} ${candidate.summary} ${candidate.topic.id}`;
  return posts.slice(0, 30).reduce((max, post) => {
    const past = `${post.title} ${post.summary || ""} ${post.topicClusterId || ""}`;
    return Math.max(max, cosine(current, past));
  }, 0);
}

function scoreCandidate(candidate, posts, domainCounts) {
  const domainCount = domainCounts.get(candidate.rootDomain) || 0;
  const americaHits = americasRelevanceScore(candidate);
  const used72h = wasDomainUsed(posts, candidate.rootDomain, 3 * DAY);
  const duplicationScore = maxSimilarity(candidate, posts);
  const intentScore = industryIntentScore(candidate);
  const topic24h = topicUsage(posts, candidate.topic.id, DAY);
  const topic7d = topicUsage(posts, candidate.topic.id, NEWS_DEDUP_DAYS * DAY);
  const selectedSeoHits = candidate.topic.seo.filter((kw) => `${candidate.title} ${candidate.summary}`.toLowerCase().includes(kw.split(" ")[0])).length;
  const numberOrEntity = /(\d+|Chile|Peru|Brazil|Argentina|Bolivia|Colombia|copper|lithium|iron ore)/i.test(`${candidate.title} ${candidate.summary}`);
  const newSourceWeight = domainCount === 0 ? 3 : domainCount === 1 ? 1.5 : 0;
  const newDataWeight = numberOrEntity ? 3 : 1.5;
  const angleWeight = candidate.sourceGroup.includes("Government") || candidate.sourceGroup.includes("Engineering") || candidate.sourceGroup.includes("Manufacturer") ? 2 : 1;
  const seoWeight = Math.min(2, selectedSeoHits + (relevanceScore(candidate) >= 4 ? 1 : 0));
  const repeatPenalty = duplicationScore > 0.6 ? 5 : duplicationScore > 0.45 ? 3 : duplicationScore > 0.3 ? 1 : 0;
  const sameSourcePenalty = domainCount > 0 ? 3 : 0;
  const informationGainScore = Number((newSourceWeight + newDataWeight + angleWeight + seoWeight - repeatPenalty - sameSourcePenalty).toFixed(2));
  const adjacentIndustryTopics = new Set([
    "south-america-mining-magnetic-separation",
    "latin-america-cement-material-handling",
    "cement-aggregates-crusher-protection",
    "equipment-monitoring-and-safety",
    "recycling-metal-recovery-sorting",
    "battery-recycling-metal-recovery",
    "critical-minerals-processing-americas",
    "north-america-equipment-and-workforce"
  ]);
  const productAdjacentHighValue = adjacentIndustryTopics.has(candidate.topic.baseId || candidate.topic.id)
    && informationGainScore >= 6.5
    && americaHits >= 1;

  const reasons = [];
  if (domainCount >= 2) reasons.push("source_diversity_recent_10_domain_limit");
  if (used72h) reasons.push("source_used_within_72h");
  if (duplicationScore > 0.85) reasons.push("semantic_similarity_above_0_85");
  if (topic24h >= 1) reasons.push("topic_cluster_24h_limit");
  if (topic7d >= 3) reasons.push("topic_cluster_7d_limit");
  if (informationGainScore < 5) reasons.push("information_gain_below_5");
  if (americaHits < 1) reasons.push("not_americas_relevant");
  if (intentScore < 2) reasons.push("weak_industry_intent");
  if (relevanceScore(candidate) < 2 && !productAdjacentHighValue) reasons.push("low_americas_product_relevance");
  if (!candidate.relatedProducts?.length) reasons.push("no_related_product");
  if (!isWithinLookback(candidate.sourcePublishedAt)) reasons.push("source_published_outside_72h");

  return {
    duplicationScore: Number(duplicationScore.toFixed(3)),
    informationGainScore,
    americasRelevanceScore: americaHits,
    rejected: reasons.some((reason) => reason !== "source_used_within_72h"),
    reasons
  };
}

function selectCandidates(candidates, posts, limit) {
  const domainCounts = sourceUsage(posts);
  const runDomainCounts = new Map();
  const selectedTopics = new Set();
  const clustered = new Map();
  for (const candidate of candidates) {
    const key = eventKey(candidate);
    const score = scoreCandidate(candidate, posts, domainCounts);
    const enriched = { ...candidate, ...score, eventKey: key };
    const current = clustered.get(key);
    if (!current || enriched.informationGainScore > current.informationGainScore) {
      if (current) enriched.supplementalSources = [current, ...(current.supplementalSources || [])].slice(0, 2);
      clustered.set(key, enriched);
    } else {
      current.supplementalSources = [enriched, ...(current.supplementalSources || [])].slice(0, 2);
    }
  }

  const eligible = [];
  const rejected = [];
  const groupSeen = new Set();
  const domainSeen = new Set();
  const sorted = [...clustered.values()].sort((a, b) => b.informationGainScore - a.informationGainScore);
  for (const candidate of sorted) {
    if (candidate.rejected) {
      rejected.push(candidate);
      continue;
    }
    if (selectedTopics.has(candidate.topic.id)) {
      rejected.push({ ...candidate, reasons: [...candidate.reasons, "topic_cluster_already_selected_this_run"] });
      continue;
    }
    const runDomainCount = runDomainCounts.get(candidate.rootDomain) || 0;
    if ((domainCounts.get(candidate.rootDomain) || 0) + runDomainCount >= 2) {
      rejected.push({ ...candidate, reasons: [...candidate.reasons, "source_diversity_recent_10_domain_limit_including_this_run"] });
      continue;
    }
    const improvesGroup = !groupSeen.has(candidate.sourceGroup);
    const improvesDomain = !domainSeen.has(candidate.rootDomain);
    if (eligible.length < 2 || improvesGroup || improvesDomain || groupSeen.size >= 3) {
      eligible.push(candidate);
      groupSeen.add(candidate.sourceGroup);
      domainSeen.add(candidate.rootDomain);
      runDomainCounts.set(candidate.rootDomain, runDomainCount + 1);
      selectedTopics.add(candidate.topic.id);
    } else {
      rejected.push({ ...candidate, reasons: [...candidate.reasons, "selection_rotation_needs_more_source_group_or_new_domain"] });
    }
  }
  if (eligible.length < limit) {
    const recovery = rejected
      .filter((candidate) => candidate.reasons?.length && candidate.reasons.every(isSoftTopicReason))
      .sort((a, b) => b.informationGainScore - a.informationGainScore);
    for (const candidate of recovery) {
      if (eligible.length >= limit) break;
      const runDomainCount = runDomainCounts.get(candidate.rootDomain) || 0;
      if ((domainCounts.get(candidate.rootDomain) || 0) + runDomainCount >= 2) continue;
      eligible.push({
        ...candidate,
        topic: { ...candidate.topic, id: `${candidate.topic.id}-${eventKey(candidate).slice(0, 24)}` },
        recoveredForDailyQuota: true,
        reasons: [...candidate.reasons, "recovered_with_event_level_topic_expansion"]
      });
      runDomainCounts.set(candidate.rootDomain, runDomainCount + 1);
    }
  }

  if (eligible.length < limit) {
    const quotaRecovery = rejected
      .filter((candidate) => {
        const reasons = new Set(candidate.reasons || []);
        if (candidate.duplicationScore > 0.85) return false;
        if ((candidate.americasRelevanceScore || 0) < 1) return false;
        if (reasons.has("source_diversity_recent_10_domain_limit")) return false;
        if (reasons.has("semantic_similarity_above_0_85")) return false;
        return reasons.has("information_gain_below_5") || reasons.has("low_americas_product_relevance") || reasons.has("source_used_within_72h");
      })
      .sort((a, b) => {
        const aScore = (a.americasRelevanceScore || 0) * 2 + (a.informationGainScore || 0) + relevanceScore(a);
        const bScore = (b.americasRelevanceScore || 0) * 2 + (b.informationGainScore || 0) + relevanceScore(b);
        return bScore - aScore;
      });

    for (const candidate of quotaRecovery) {
      if (eligible.length >= limit) break;
      const runDomainCount = runDomainCounts.get(candidate.rootDomain) || 0;
      const totalDomainCount = (domainCounts.get(candidate.rootDomain) || 0) + runDomainCount;
      if (totalDomainCount >= 2) continue;

      eligible.push({
        ...candidate,
        topic: { ...candidate.topic, id: `${candidate.topic.id}-daily-quota-${eventKey(candidate).slice(0, 18)}` },
        informationGainScore: Math.max(5, candidate.informationGainScore || 0),
        recoveredForDailyQuota: true,
        reasons: [...candidate.reasons, "daily_quota_recovery_relaxed_relevance"]
      });
      runDomainCounts.set(candidate.rootDomain, runDomainCount + 1);
      selectedTopics.add(candidate.topic.id);
    }
  }
  return { selected: eligible.slice(0, limit), eligible, rejected: rejected.slice(0, 80) };
}

function languagePack(candidate, topicKeywords, countryHint) {
  const source = candidate.sourceName || candidate.rootDomain;
  return {
    "es-cl": {
      title: `${candidate.title} - impacto para separacion magnetica en ${countryHint}`,
      summary: `Resumen editorial de ${source}: que cambia para compradores de separadores magneticos, detectores de metal y equipos de recuperacion en Americas.`,
      geoSummary: `${candidate.title}. Relevancia: ${candidate.topic.id.replace(/-/g, " ")} para equipos de separacion magnetica y recuperacion metalica en Americas.`,
      body: [
        "## Resumen del hecho",
        `La fuente citada reporta: ${candidate.summary || candidate.title}. Para equipos de separacion magnetica, el valor de esta noticia esta en entender demanda, riesgos operativos y necesidades de proteccion de proceso en ${countryHint}.`,
        "## Nuestra lectura tecnica",
        `Desde una perspectiva de seleccion, el evento se relaciona con ${candidate.topic.id.replace(/-/g, " ")}. En proyectos de mineria, reciclaje, cemento o manejo de graneles, esto puede cambiar la prioridad entre separadores suspendidos, tambores magneticos, detectores de metal, separadores por corriente de Foucault y filtros magneticos.`,
        "## Implicaciones para compradores B2B",
        "- Revisar material, granulometria, humedad y contaminantes metalicos antes de elegir equipo.\n- Confirmar ancho y velocidad de cinta, espesor de capa, altura de instalacion, voltaje y ambiente.\n- Evitar comprar solo por modelo: la aplicacion define si conviene iman permanente, electroiman, separacion humeda/seca o deteccion de metales.",
        "## Angulo SEO y GEO",
        `Esta nota cubre las busquedas: ${topicKeywords.join(", ")}.`,
        "## Fuente",
        `Articulo citado: ${source} - ${candidate.link}`
      ].join("\n\n")
    },
    es: null,
    "pt-br": {
      title: `${candidate.title} - impacto para separacao magnetica nas Americas`,
      summary: `Resumo editorial de ${source}: o que muda para compradores de separadores magneticos, detectores de metal e equipamentos de recuperacao nas Americas.`,
      geoSummary: `${candidate.title}. Relevancia: ${candidate.topic.id.replace(/-/g, " ")} para separacao magnetica e recuperacao metalica nas Americas.`,
      body: [
        "## Resumo do fato",
        `A fonte citada informa: ${candidate.summary || candidate.title}. Para equipamentos de separacao magnetica, a noticia ajuda a entender demanda, risco operacional e protecao de processo em ${countryHint}.`,
        "## Nossa leitura tecnica",
        `Do ponto de vista de selecao, o evento esta ligado a ${candidate.topic.id.replace(/-/g, " ")}. Em mineracao, reciclagem, cimento e manuseio de graneis, isso pode mudar a escolha entre separadores suspensos, tambores magneticos, detectores de metal, separadores por corrente de Foucault e filtros magneticos.`,
        "## Implicacoes para compradores B2B",
        "- Revisar material, granulometria, umidade e contaminantes metalicos antes da escolha.\n- Confirmar largura e velocidade da correia, camada de material, altura de instalacao, tensao e ambiente.\n- Evitar comprar apenas pelo modelo: a aplicacao define se convem ima permanente, eletroima, separacao umida/seca ou deteccao de metais.",
        "## Angulo SEO e GEO",
        `Esta nota cobre buscas como: ${topicKeywords.join(", ")}.`,
        "## Fonte",
        `Artigo citado: ${source} - ${candidate.link}`
      ].join("\n\n")
    },
    en: {
      title: `${candidate.title} - impact on magnetic separation in the Americas`,
      summary: `Editorial brief from ${source}: what changes for buyers of magnetic separators, metal detectors and recovery equipment in the Americas.`,
      geoSummary: `${candidate.title}. Relevance: ${candidate.topic.id.replace(/-/g, " ")} for magnetic separation and metal recovery equipment in the Americas.`,
      body: [
        "## Event summary",
        `The cited source reports: ${candidate.summary || candidate.title}. For magnetic separation equipment, the value of this news is understanding demand, operating risk and process protection needs in ${countryHint}.`,
        "## Our technical view",
        `From a selection perspective, the event relates to ${candidate.topic.id.replace(/-/g, " ")}. In mining, recycling, cement and bulk handling projects, this can change the priority between suspended magnets, magnetic drums, metal detectors, eddy current separators and magnetic filters.`,
        "## B2B buyer implications",
        "- Check material, particle size, moisture and metal contaminants before selecting equipment.\n- Confirm belt width and speed, material layer, suspension height, voltage and site environment.\n- Avoid buying only by model name: the application decides whether permanent magnets, electromagnets, wet/dry separation or metal detection is needed.",
        "## SEO and GEO angle",
        `This note covers searches such as: ${topicKeywords.join(", ")}.`,
        "## Source",
        `Cited article: ${source} - ${candidate.link}`
      ].join("\n\n")
    }
  };
}

function buildNewsPost(candidate, image) {
  const topicKeywords = candidate.topic.seo;
  const countryHint = (candidate.title.match(/Chile|Peru|Brazil|Brasil|Argentina|Bolivia|Colombia|Ecuador|Uruguay|Paraguay|Mexico|Canada|United States|USA/i) || ["Americas"])[0];
  const localized = languagePack(candidate, topicKeywords, countryHint);
  localized.es = localized["es-cl"];
  const title = localized["es-cl"].title;
  const slug = slugify(`${candidate.title}-${candidate.rootDomain}`).slice(0, 86);
  const summary = localized["es-cl"].summary;
  const coverImage = image.url;
  const citations = [
    { title: candidate.sourceName || candidate.sourceFeed, url: candidate.link, domain: candidate.rootDomain },
    ...(candidate.supplementalSources || []).map((item) => ({ title: item.sourceName || item.sourceFeed, url: item.link, domain: item.rootDomain }))
  ];
  const body = localized["es-cl"].body;

  return {
    type: "news",
    slug,
    title,
    categoryTitle: candidate.sourceGroup,
    summary,
    body,
    image: coverImage,
    imagePolicy: image.policy,
    sourceImageUrl: image.url,
    localImagePath: "",
    imageCredit: image.credit,
    imageRightsUrl: image.rightsUrl,
    licenseUrl: image.rightsUrl,
    coverImageStatus: image.status,
    coverImageFetchedAt: new Date().toISOString(),
    coverImageHash: hash(image.url),
    sourceTitle: candidate.sourceName || candidate.sourceFeed,
    sourceUrl: candidate.link,
    canonicalSourceUrl: candidate.canonicalSourceUrl || normalizeUrl(candidate.link),
    sourceDomain: candidate.rootDomain,
    sourceLanguage: candidate.sourceLanguage || "",
    sourcePublishedAt: candidate.sourcePublishedAt,
    sourceFetchedAt: candidate.sourceFetchedAt,
    sourceTimezone: candidate.sourceTimezone || "source-provided",
    sourceFingerprint: hash(`${candidate.rootDomain}|${candidate.canonicalSourceUrl || candidate.link}|${candidate.sourcePublishedAt}`),
    normalizedTitle: normalizedTitle(candidate.title),
    contentHash: hash(`${candidate.title}|${candidate.summary}`),
    eventFingerprint: hash(eventKey(candidate)),
    author: "Cowinmagnet LATAM News Desk",
    publishedAt: new Date().toISOString(),
    status: "published",
    href: `/news/${slug}`,
    topicClusterId: candidate.topic.id,
    informationGainScore: candidate.informationGainScore,
    duplicationScore: candidate.duplicationScore,
    americasRelevanceScore: candidate.americasRelevanceScore,
    seoKeywords: topicKeywords,
    geoSummary: localized["es-cl"].geoSummary,
    localized,
    citations,
    relatedProducts: candidate.relatedProducts || [],
    canonicalUrl: `https://cowinmagnet.cl/es-cl/news/${slug}`,
    automation: {
      selected_source: candidate.link,
      topic_cluster_id: candidate.topic.id,
      information_gain_score: candidate.informationGainScore,
      duplication_score: candidate.duplicationScore,
      source_group: candidate.sourceGroup,
      source_published_at: candidate.sourcePublishedAt,
      source_fetched_at: candidate.sourceFetchedAt,
      related_products: candidate.relatedProducts?.map((item) => item.slug) || []
    }
  };
}

async function runNewsAutomationUnlocked({ limit = DAILY_NEWS_QUOTA, dryRun = false, trigger = "manual", slot = "" } = {}) {
  const requestId = `news-${Date.now()}`;
  const existingNews = await getCmsItems("news", { includeInactive: true });
  const publishedToday = countPublishedToday(existingNews);
  const remainingToday = Math.max(0, DAILY_NEWS_QUOTA - publishedToday);
  const effectiveLimit = Math.min(Math.max(1, Number(limit) || DAILY_NEWS_QUOTA), DAILY_NEWS_QUOTA, remainingToday || 0);
  if (effectiveLimit <= 0) {
    const log = {
      requestId,
      selected_source: [],
      rejected_sources: [],
      duplication_score: [],
      topic_cluster_id: [],
      information_gain_score: [],
      daily_quota: DAILY_NEWS_QUOTA,
      published_today: publishedToday,
      remaining_today: 0,
      time_zone: NEWS_TIME_ZONE,
      dryRun
    };
    console.log("[newsAutomation]", JSON.stringify(log));
    return { success: true, data: { published: [], log } };
  }
  const usedUrls = new Set(existingNews.map((item) => normalizeUrl(item.canonicalSourceUrl || item.sourceUrl || "")).filter(Boolean));
  const usedSlugs = new Set(existingNews.map((item) => item.slug));
  const feedResults = await mapWithConcurrency(sourcePool, 6, async (source) => {
    const items = await fetchFeed(source);
    return items.map((item) => {
      const topic = inferTopic(item);
      return { ...item, topic, relatedProducts: findRelatedProducts({ ...item, topic }) };
    });
  });

  const feedLog = [];
  const candidates = [];
  feedResults.forEach((result, index) => {
    const source = sourcePool[index];
    if (result.status === "fulfilled") {
      feedLog.push({ source: source.name, group: source.group, status: "ok", count: result.value.length });
      candidates.push(...result.value);
    } else {
      feedLog.push({ source: source.name, group: source.group, status: "error", reason: result.reason?.message || String(result.reason) });
    }
  });

  const rejectedPre = [];
  const prefiltered = candidates.filter((candidate) => {
    if (!isAmericasRelevant(candidate)) {
      rejectedPre.push({ ...candidate, reasons: ["not_americas_relevant"], americasRelevanceScore: americasRelevanceScore(candidate) });
      return false;
    }
    if (!isWithinLookback(candidate.sourcePublishedAt)) {
      rejectedPre.push({ ...candidate, reasons: ["source_published_outside_72h"], americasRelevanceScore: americasRelevanceScore(candidate) });
      return false;
    }
    if (usedUrls.has(normalizeUrl(candidate.link)) || wasSourceUsed(existingNews, normalizeUrl(candidate.link), NEWS_DEDUP_DAYS * DAY)) {
      rejectedPre.push({ ...candidate, reasons: ["source_article_already_used"] });
      return false;
    }
    if (usedSlugs.has(slugify(`${candidate.title}-${candidate.rootDomain}`).slice(0, 86))) {
      rejectedPre.push({ ...candidate, reasons: ["slug_already_used"] });
      return false;
    }
    return true;
  });

  const { eligible, rejected } = selectCandidates(prefiltered, existingNews, effectiveLimit);
  const published = [];
  const imageNotes = [];
  const publishWindow = eligible.slice(0, Math.max(effectiveLimit * 3, 8));
  const imageResults = await mapWithConcurrency(publishWindow, 2, (candidate) => chooseNewsImage(candidate));
  for (let index = 0; index < publishWindow.length; index += 1) {
    const candidate = publishWindow[index];
    if (published.length >= effectiveLimit) break;
    if (!isWithinLookback(candidate.sourcePublishedAt)) {
      imageNotes.push({ ...candidate, reasons: ["source_published_outside_72h_at_publish_time"] });
      continue;
    }
    const imageResult = imageResults[index];
    const image = imageResult?.status === "fulfilled" ? imageResult.value : { url: "" };
    if (!image.url) {
      imageNotes.push({ ...candidate, reasons: ["missing_verified_news_image_publish_blocked"] });
      continue;
    }
    const post = buildNewsPost(candidate, image);
    published.push(post);
    if (!dryRun) await saveCmsItem(post);
  }

  if (!dryRun) {
    revalidateTag("public-news", { expire: 0 });
    revalidatePath("/es-cl/news");
    revalidatePath("/es/news");
    revalidatePath("/pt-br/news");
    revalidatePath("/en/news");
    revalidatePath("/news-sitemap.xml");
    revalidatePath("/sitemap.xml");

    try {
      await saveCmsItem({
        type: "news-run-log",
        slug: requestId,
        title: `News automation ${requestId}`,
        status: "published",
        publishedAt: new Date().toISOString(),
        selected_source: published.map((item) => item.sourceUrl),
        rejected_sources: [...rejectedPre, ...rejected, ...imageNotes].slice(0, 80).map((item) => ({
          url: item.link,
          domain: item.rootDomain,
          title: item.title,
          reasons: item.reasons,
          duplication_score: item.duplicationScore,
          topic_cluster_id: item.topic?.id,
          information_gain_score: item.informationGainScore,
          americas_relevance_score: item.americasRelevanceScore,
          source_published_at: item.sourcePublishedAt,
          source_fetched_at: item.sourceFetchedAt,
          related_products: item.relatedProducts?.map((product) => product.slug) || []
        })),
        rejected_total: rejectedPre.length + rejected.length + imageNotes.length,
        feedLog,
        scope: "americas_only",
        daily_quota: DAILY_NEWS_QUOTA,
        published_today: publishedToday,
        remaining_today: Math.max(0, remainingToday - published.length),
        requested_limit: limit,
        effective_limit: effectiveLimit,
        trigger,
        slot,
        time_zone: NEWS_TIME_ZONE,
        lookback_hours: NEWS_LOOKBACK_HOURS,
        dedup_days: NEWS_DEDUP_DAYS,
        selected: published.map((item) => ({
          selected_source: item.sourceUrl,
          duplication_score: item.duplicationScore,
          topic_cluster_id: item.topicClusterId,
          information_gain_score: item.informationGainScore,
          source_published_at: item.sourcePublishedAt,
          related_products: item.relatedProducts?.map((product) => product.slug) || []
        }))
      });
    } catch (error) {
      console.warn("[newsAutomation] run log save failed", error?.message || error);
    }
  }

  const log = {
    requestId,
    selected_source: published.map((item) => item.sourceUrl),
    rejected_sources: [...rejectedPre, ...rejected, ...imageNotes].map((item) => ({
      url: item.link,
      domain: item.rootDomain,
      title: item.title,
      reason: item.reasons?.join(", "),
      duplication_score: item.duplicationScore,
      topic_cluster_id: item.topic?.id,
      information_gain_score: item.informationGainScore,
      americas_relevance_score: item.americasRelevanceScore,
      source_published_at: item.sourcePublishedAt,
      source_fetched_at: item.sourceFetchedAt,
      related_products: item.relatedProducts?.map((product) => product.slug) || []
    })),
    duplication_score: published.map((item) => item.duplicationScore),
    topic_cluster_id: published.map((item) => item.topicClusterId),
    information_gain_score: published.map((item) => item.informationGainScore),
    feedLog,
    scope: "americas_only",
    dryRun,
    daily_quota: DAILY_NEWS_QUOTA,
    published_today: publishedToday,
    remaining_today: Math.max(0, remainingToday - published.length),
    requested_limit: limit,
    effective_limit: effectiveLimit,
    trigger,
    slot,
    time_zone: NEWS_TIME_ZONE,
    lookback_hours: NEWS_LOOKBACK_HOURS,
    dedup_days: NEWS_DEDUP_DAYS
  };

  console.log("[newsAutomation]", JSON.stringify(log));
  return { success: true, data: { published, log } };
}

export async function runNewsAutomation(options = {}) {
  const requestId = `news-lease-${Date.now()}`;
  const lease = await withCmsLease("news-automation", () => runNewsAutomationUnlocked(options), { leaseMs: 150000 });
  if (lease.acquired) return lease.value;

  const log = {
    requestId,
    skipped: "another_news_run_is_active",
    selected_source: [],
    rejected_sources: [],
    duplication_score: [],
    topic_cluster_id: [],
    information_gain_score: [],
    trigger: options.trigger || "manual",
    slot: options.slot || "",
    time_zone: NEWS_TIME_ZONE
  };
  console.log("[newsAutomation]", JSON.stringify(log));
  return { success: true, skipped: true, data: { published: [], log } };
}
