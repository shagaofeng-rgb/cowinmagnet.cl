export const DEFAULT_NEWS_SITE_ID = "cowinmagnet_latam";

const sharedScope = [
  "magnetic separation equipment",
  "mining and mineral processing",
  "recycling and metal recovery",
  "bulk materials, conveyors and ports",
  "cement, aggregates and industrial safety",
  "standards, regulation and supply-chain developments relevant to these sectors"
];

export const newsSiteConfigs = [
  {
    siteId: DEFAULT_NEWS_SITE_ID,
    enabled: true,
    brandName: "COWIN MAGNET",
    siteUrl: "https://cowinmagnet.cl",
    industry: "Magnetic separation equipment for mining and industry",
    industryScope: sharedScope,
    targetMarkets: ["CL", "PE", "AR", "BO", "CO", "BR", "Americas"],
    publicationLanguage: "es",
    locale: "es-cl",
    timezone: "America/Santiago",
    news: {
      enabled: true,
      listRoute: "/es-cl/news",
      detailRoutePattern: "/es-cl/news/[slug]",
      rssRoute: "/es-cl/news/rss.xml",
      sitemapRoute: "/news-sitemap.xml",
      desiredWordCount: { min: 1000, max: 1500 },
      ingestIntervalHours: 12,
      publishIntervalHours: 24,
      publishEarliestLocalHour: 9,
      dailyPublicationLimit: 1,
      candidateMaxAgeHours: 72,
      fallbackCandidateMaxAgeDays: 7,
      minScore: 70,
      maxInternalProductLinks: 1,
      defaultAuthorType: "Equipo editorial"
    },
    blog: {
      enabled: true,
      listRoute: "/es-cl/blog",
      detailRoutePattern: "/es-cl/blog/[slug]",
      sitemapRoute: "/sitemap.xml",
      contentSource: "existing-blog-source",
      allowNewsAutomation: false
    },
    productThemePlan: [
      { themeId: "cobre-mineria-procesamiento", productSlug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", startAt: "2026-01-01", endAt: "2026-12-31", status: "active", terms: ["cobre", "mineria", "faena", "chanc", "mineral", "seguridad"] },
      { themeId: "litio-relaves-minerales", productSlug: "wet-drum-magnetic-separator", startAt: "2026-01-01", endAt: "2026-12-31", status: "active", terms: ["litio", "relave", "pulpa", "mineral", "agua"] },
      { themeId: "aridos-cemento", productSlug: "rcyb-type-permanent-magnet-manual-iron-remover", startAt: "2026-01-01", endAt: "2026-12-31", status: "active", terms: ["arido", "cantera", "cemento", "chanc", "construccion"] },
      { themeId: "reciclaje-metales", productSlug: "dry-drum-magnetic-separator", startAt: "2026-01-01", endAt: "2026-12-31", status: "active", terms: ["recicl", "residuo", "metal", "circular"] },
      { themeId: "puertos-graneles", productSlug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", startAt: "2026-01-01", endAt: "2026-12-31", status: "active", terms: ["puerto", "granel", "correa", "transporte", "logistica"] }
    ],
    sources: {
      primaryWhitelist: [
        { domain: "sernageomin.cl", type: "regulator", name: "Sernageomin Chile", group: "government-regulator", country: "Chile", allowedTopics: ["regulation", "safety", "mining"], allowedLanguages: ["es"], rssOrApiUrl: "https://www.sernageomin.cl/feed/", sourceTrustScore: 90 },
        { domain: "cochilco.cl", type: "government-market", name: "COCHILCO", group: "government-market", country: "Chile", allowedTopics: ["copper", "mining", "market"], allowedLanguages: ["es"], rssOrApiUrl: "https://www.cochilco.cl/web/feed/", sourceTrustScore: 90 },
        { domain: "minmineria.cl", type: "government-mining", name: "Ministerio de Mineria Chile", group: "government-mining", country: "Chile", allowedTopics: ["regulation", "mining"], allowedLanguages: ["es"], rssOrApiUrl: "https://www.minmineria.cl/feed/", sourceTrustScore: 90 },
        { domain: "portalminero.com", type: "trade-media", name: "Portal Minero", group: "regional-industry-media", country: "Chile", allowedTopics: ["mining", "technology"], allowedLanguages: ["es"], rssOrApiUrl: "https://www.portalminero.com/wp/feed/", sourceTrustScore: 80 }
      ],
      fallbackWhitelist: [
        { domain: "mineria-pa.com", type: "trade-media", name: "Mineria Pan-Americana", group: "trade-publication-latam", country: "Latin America", allowedTopics: ["mining", "technology"], allowedLanguages: ["es"], rssOrApiUrl: "https://www.mineria-pa.com/feed/", sourceTrustScore: 80 },
        { domain: "canadianminingjournal.com", type: "trade-media", name: "Canadian Mining Journal", group: "trade-publication", country: "Canada", allowedTopics: ["mining", "technology"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.canadianminingjournal.com/feed/", sourceTrustScore: 80 },
        { domain: "mining-technology.com", type: "trade-media", name: "Mining Technology", group: "trade-publication", country: "Americas", allowedTopics: ["mining", "technology"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.mining-technology.com/feed/", sourceTrustScore: 75 },
        { domain: "northernminer.com", type: "trade-media", name: "The Northern Miner", group: "trade-publication", country: "Canada", allowedTopics: ["mining", "technology"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.northernminer.com/feed/", sourceTrustScore: 75 }
      ]
    },
    publishing: {
      cmsAdapter: "cmsStore",
      contentStatusAfterPublish: "published",
      requireFrontendVerification: true,
      alertChannel: "application-log",
      productionEnabled: true
    }
  }
];

export function getNewsSiteConfig(siteId = DEFAULT_NEWS_SITE_ID) {
  return newsSiteConfigs.find((site) => site.siteId === siteId) || null;
}

export function validateNewsSiteConfig(site) {
  const missing = [];
  if (!site?.siteId) missing.push("siteId");
  if (!site?.siteUrl) missing.push("siteUrl");
  if (!site?.industryScope?.length) missing.push("industryScope");
  if (!site?.publicationLanguage) missing.push("publicationLanguage");
  if (!site?.timezone) missing.push("timezone");
  if (!site?.news?.listRoute || !site?.news?.detailRoutePattern) missing.push("news routes");
  if (!site?.productThemePlan?.length) missing.push("productThemePlan");
  if (!site?.sources?.primaryWhitelist?.length || !site?.sources?.fallbackWhitelist?.length) missing.push("source whitelists");
  return { valid: missing.length === 0, missing };
}

export function activeThemeForSite(site, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const themes = (site?.productThemePlan || []).filter((theme) => theme.status === "active" && theme.startAt <= day && theme.endAt >= day);
  if (!themes.length) return null;
  const cycle = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  return themes[cycle % themes.length];
}
