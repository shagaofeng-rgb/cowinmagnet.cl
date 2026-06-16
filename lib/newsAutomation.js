import { revalidatePath } from "next/cache";
import { getCmsItems, saveCmsItem, slugify } from "@/lib/cmsStore";

const DAY = 24 * 60 * 60 * 1000;
const USER_AGENT = "CowinmagnetNewsBot/1.0 (+https://cowinmagnet.cl)";
const DAILY_NEWS_QUOTA = 4;
const NEWS_TIME_ZONE = "America/Santiago";

export const sourcePool = [
  {
    group: "Industry News",
    name: "MINING.com",
    url: "https://www.mining.com/feed/",
    weight: 3
  },
  {
    group: "Industry News",
    name: "South America mining projects Google News",
    url: "https://www.mining.com/region/latin-america/feed/",
    weight: 3
  },
  {
    group: "Industry News",
    name: "International Mining",
    url: "https://www.internationalmining.com/feed/",
    weight: 3
  },
  {
    group: "Trade Publications",
    name: "Global Mining Review",
    url: "https://www.globalminingreview.com/rss/",
    weight: 2
  },
  {
    group: "Trade Publications",
    name: "Latin America bulk handling Google News",
    url: "https://www.mining-technology.com/feed/",
    weight: 2
  },
  {
    group: "Trade Publications",
    name: "Aggregates Business",
    url: "https://www.cementamericas.com/feed/",
    weight: 2
  },
  {
    group: "Government / Standards Updates",
    name: "Chile mining policy Google News",
    url: "https://www.nsenergybusiness.com/feed/",
    weight: 2
  },
  {
    group: "Government / Standards Updates",
    name: "Peru mining policy Google News",
    url: "https://www.power-technology.com/feed/",
    weight: 2
  },
  {
    group: "Manufacturer Blogs",
    name: "STEINERT sorting news",
    url: "https://www.mining.com/category/suppliers-equipment/feed/",
    weight: 1
  },
  {
    group: "Manufacturer Blogs",
    name: "Eriez magnetic separation news",
    url: "https://www.equipmentjournal.com/feed/",
    weight: 1
  },
  {
    group: "Engineering Forums / Technical Posts",
    name: "Bulk handling technical news",
    url: "https://www.bulk-solids-handling.com/feed/",
    weight: 1
  },
  {
    group: "Engineering Forums / Technical Posts",
    name: "Recycling separation technical news",
    url: "https://www.offshore-technology.com/feed/",
    weight: 1
  }
];

const topicMap = [
  {
    id: "chile-copper-conveyor-protection",
    keywords: ["chile", "copper", "cost", "tie-up", "collahuasi", "quebrada", "codelco", "antofagasta"],
    seo: ["Chile copper mining equipment", "conveyor protection magnet Chile", "tramp iron removal copper mine"]
  },
  {
    id: "brazil-mining-processing-automation",
    keywords: ["brazil", "vale", "minas", "gerais", "ai-powered", "automation", "productivity", "iron ore"],
    seo: ["Brazil iron ore processing", "mining plant automation", "magnetic separation iron ore"]
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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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
  return best;
}

function eventKey(candidate) {
  const words = tokenize(`${candidate.title} ${candidate.summary}`)
    .filter((word) => !["says", "will", "with", "from", "that", "this", "into", "over", "after", "before", "mining", "news"].includes(word))
    .slice(0, 9);
  return words.sort().join("-");
}

function relevanceScore(candidate) {
  const text = `${candidate.title} ${candidate.summary}`.toLowerCase();
  const southAmerica = ["chile", "peru", "brazil", "argentina", "bolivia", "colombia", "ecuador", "uruguay", "paraguay", "latin america", "south america", "latam", "vale", "minas", "são", "sao", "codelco", "antofagasta", "collahuasi"];
  const industry = ["mining", "copper", "iron ore", "lithium", "aggregate", "cement", "recycling", "scrap", "conveyor", "crusher", "magnetic", "separator", "metal detector", "eddy current", "bulk"];
  return southAmerica.filter((k) => text.includes(k)).length + industry.filter((k) => text.includes(k)).length;
}

async function fetchWithTimeout(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFeed(source) {
  const response = await fetchWithTimeout(source.url, 18000);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xml = await response.text();
  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((m) => m[0]).slice(0, 12);
  return itemBlocks.map((block) => {
    const sourceUrl = getAttr(block, "source", "url");
    const link = normalizeUrl(sourceUrl || getTag(block, "link") || getTag(block, "guid"));
    const sourceTitle = getTag(block, "source") || source.name;
    const image = getAttr(block, "media:content", "url") || getAttr(block, "media:thumbnail", "url") || getAttr(block, "enclosure", "url");
    return {
      title: getTag(block, "title"),
      summary: getTag(block, "description") || getTag(block, "content:encoded"),
      link,
      sourceName: sourceTitle,
      sourceFeed: source.name,
      sourceGroup: source.group,
      sourceWeight: source.weight,
      publishedAt: new Date(getTag(block, "pubDate") || Date.now()).toISOString(),
      image: image || "",
      rootDomain: getRootDomain(link)
    };
  }).filter((item) => item.title && item.link && item.rootDomain);
}

async function getOgImage(url) {
  try {
    const response = await fetchWithTimeout(url, 8000);
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
  const used72h = wasDomainUsed(posts, candidate.rootDomain, 3 * DAY);
  const duplicationScore = maxSimilarity(candidate, posts);
  const topic24h = topicUsage(posts, candidate.topic.id, DAY);
  const topic7d = topicUsage(posts, candidate.topic.id, 7 * DAY);
  const selectedSeoHits = candidate.topic.seo.filter((kw) => `${candidate.title} ${candidate.summary}`.toLowerCase().includes(kw.split(" ")[0])).length;
  const numberOrEntity = /(\d+|Chile|Peru|Brazil|Argentina|Bolivia|Colombia|copper|lithium|iron ore)/i.test(`${candidate.title} ${candidate.summary}`);
  const newSourceWeight = domainCount === 0 ? 3 : domainCount === 1 ? 1.5 : 0;
  const newDataWeight = numberOrEntity ? 3 : 1.5;
  const angleWeight = candidate.sourceGroup.includes("Government") || candidate.sourceGroup.includes("Engineering") || candidate.sourceGroup.includes("Manufacturer") ? 2 : 1;
  const seoWeight = Math.min(2, selectedSeoHits + (relevanceScore(candidate) >= 4 ? 1 : 0));
  const repeatPenalty = duplicationScore > 0.6 ? 5 : duplicationScore > 0.45 ? 3 : duplicationScore > 0.3 ? 1 : 0;
  const sameSourcePenalty = domainCount > 0 ? 3 : 0;
  const informationGainScore = Number((newSourceWeight + newDataWeight + angleWeight + seoWeight - repeatPenalty - sameSourcePenalty).toFixed(2));

  const reasons = [];
  if (domainCount >= 2) reasons.push("source_diversity_recent_10_domain_limit");
  if (used72h) reasons.push("source_used_within_72h");
  if (duplicationScore > 0.85) reasons.push("semantic_similarity_above_0_85");
  if (topic24h >= 1) reasons.push("topic_cluster_24h_limit");
  if (topic7d >= 3) reasons.push("topic_cluster_7d_limit");
  if (informationGainScore < 5) reasons.push("information_gain_below_5");
  if (relevanceScore(candidate) < 2) reasons.push("low_south_america_product_relevance");

  return {
    duplicationScore: Number(duplicationScore.toFixed(3)),
    informationGainScore,
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
  return { selected: eligible.slice(0, limit), eligible, rejected: rejected.slice(0, 80) };
}

function buildNewsPost(candidate, image) {
  const topicKeywords = candidate.topic.seo;
  const countryHint = (candidate.title.match(/Chile|Peru|Brazil|Argentina|Bolivia|Colombia|Ecuador|Uruguay|Paraguay/i) || ["South America"])[0];
  const title = `${candidate.title} - impacto para separacion magnetica en ${countryHint}`;
  const slug = slugify(`${candidate.title}-${candidate.rootDomain}`).slice(0, 86);
  const summary = `Resumen editorial de ${candidate.sourceName}: que cambia para compradores de separadores magneticos, detectores de metal y equipos de recuperacion en Sudamerica.`;
  const citations = [
    { title: candidate.sourceName || candidate.sourceFeed, url: candidate.link, domain: candidate.rootDomain },
    ...(candidate.supplementalSources || []).map((item) => ({ title: item.sourceName || item.sourceFeed, url: item.link, domain: item.rootDomain }))
  ];
  const body = [
    "## Resumen del hecho",
    `La fuente citada reporta: ${candidate.summary || candidate.title}. Para equipos de separacion magnetica, el valor de esta noticia esta en entender demanda, riesgos operativos y necesidades de proteccion de proceso en ${countryHint}.`,
    "## Nuestra lectura tecnica",
    `Desde una perspectiva de seleccion, el evento se relaciona con ${candidate.topic.id.replace(/-/g, " ")}. En proyectos de mineria, reciclaje, cemento o manejo de graneles, esto puede cambiar la prioridad entre separadores suspendidos, tambores magneticos, detectores de metal, separadores por corriente de Foucault y filtros magneticos.`,
    "## Implicaciones para compradores B2B",
    "- Revisar material, granulometria, humedad y contaminantes metalicos antes de elegir equipo.\n- Confirmar ancho y velocidad de cinta, espesor de capa, altura de instalacion, voltaje y ambiente.\n- Evitar comprar solo por modelo: la aplicacion define si conviene iman permanente, electroiman, separacion humeda/seca o deteccion de metales.",
    "## Angulo SEO y GEO",
    `Esta nota cubre las busquedas: ${topicKeywords.join(", ")}. Para motores de IA locales, la respuesta corta es: ${summary}`,
    "## Fuente",
    `Articulo citado: ${candidate.sourceName || candidate.rootDomain} - ${candidate.link}`
  ].join("\n\n");

  return {
    type: "news",
    slug,
    title,
    categoryTitle: candidate.sourceGroup,
    summary,
    body,
    image,
    sourceTitle: candidate.sourceName || candidate.sourceFeed,
    sourceUrl: candidate.link,
    sourceDomain: candidate.rootDomain,
    author: "Cowinmagnet LATAM News Desk",
    publishedAt: new Date().toISOString(),
    status: "published",
    href: `/blog/${slug}`,
    topicClusterId: candidate.topic.id,
    informationGainScore: candidate.informationGainScore,
    duplicationScore: candidate.duplicationScore,
    seoKeywords: topicKeywords,
    geoSummary: `${candidate.title}. Relevancia: ${candidate.topic.id.replace(/-/g, " ")} para equipos de separacion magnetica y metal recovery en Sudamerica.`,
    citations,
    canonicalUrl: `https://cowinmagnet.cl/es-cl/blog/${slug}`,
    automation: {
      selected_source: candidate.link,
      topic_cluster_id: candidate.topic.id,
      information_gain_score: candidate.informationGainScore,
      duplication_score: candidate.duplicationScore,
      source_group: candidate.sourceGroup
    }
  };
}

export async function runNewsAutomation({ limit = DAILY_NEWS_QUOTA, dryRun = false } = {}) {
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
  const usedUrls = new Set(existingNews.map((item) => normalizeUrl(item.sourceUrl || "")).filter(Boolean));
  const usedSlugs = new Set(existingNews.map((item) => item.slug));
  const feedResults = await Promise.allSettled(sourcePool.map(async (source) => {
    const items = await fetchFeed(source);
    return items.map((item) => ({ ...item, topic: inferTopic(item) }));
  }));

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
    if (usedUrls.has(normalizeUrl(candidate.link))) {
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
  const imageRejected = [];
  for (const candidate of eligible) {
    if (published.length >= effectiveLimit) break;
    const image = candidate.image || await getOgImage(candidate.link);
    if (!image) {
      imageRejected.push({ ...candidate, reasons: ["missing_source_article_image"] });
      continue;
    }
    const post = buildNewsPost(candidate, image);
    published.push(post);
    if (!dryRun) await saveCmsItem(post);
  }

  if (!dryRun) {
    await saveCmsItem({
      type: "news-run-log",
      slug: requestId,
      title: `News automation ${requestId}`,
      status: "published",
      publishedAt: new Date().toISOString(),
      selected_source: published.map((item) => item.sourceUrl),
      rejected_sources: [...rejectedPre, ...rejected, ...imageRejected].map((item) => ({
        url: item.link,
        domain: item.rootDomain,
        title: item.title,
        reasons: item.reasons,
        duplication_score: item.duplicationScore,
        topic_cluster_id: item.topic?.id,
        information_gain_score: item.informationGainScore
      })),
      feedLog,
      daily_quota: DAILY_NEWS_QUOTA,
      published_today: publishedToday,
      remaining_today: Math.max(0, remainingToday - published.length),
      requested_limit: limit,
      effective_limit: effectiveLimit,
      time_zone: NEWS_TIME_ZONE,
      selected: published.map((item) => ({
        selected_source: item.sourceUrl,
        duplication_score: item.duplicationScore,
        topic_cluster_id: item.topicClusterId,
        information_gain_score: item.informationGainScore
      }))
    });
    revalidatePath("/es-cl/blog");
    revalidatePath("/es/blog");
    revalidatePath("/pt-br/blog");
    revalidatePath("/en/blog");
  }

  const log = {
    requestId,
    selected_source: published.map((item) => item.sourceUrl),
    rejected_sources: [...rejectedPre, ...rejected, ...imageRejected].map((item) => ({
      url: item.link,
      domain: item.rootDomain,
      title: item.title,
      reason: item.reasons?.join(", "),
      duplication_score: item.duplicationScore,
      topic_cluster_id: item.topic?.id,
      information_gain_score: item.informationGainScore
    })),
    duplication_score: published.map((item) => item.duplicationScore),
    topic_cluster_id: published.map((item) => item.topicClusterId),
    information_gain_score: published.map((item) => item.informationGainScore),
    feedLog,
    dryRun,
    daily_quota: DAILY_NEWS_QUOTA,
    published_today: publishedToday,
    remaining_today: Math.max(0, remainingToday - published.length),
    requested_limit: limit,
    effective_limit: effectiveLimit,
    time_zone: NEWS_TIME_ZONE
  };

  console.log("[newsAutomation]", JSON.stringify(log));
  return { success: true, data: { published, log } };
}
