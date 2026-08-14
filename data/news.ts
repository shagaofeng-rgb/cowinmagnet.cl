import { unstable_noStore as noStore } from "next/cache";
import { getCmsItems } from "@/lib/cmsStore";
import { Locale, defaultLocale, siteConfig } from "@/data/site";

export type LocalizedNewsContent = {
  title?: string;
  summary?: string;
  body?: string;
  geoSummary?: string;
  seoKeywords?: string[];
};

export type NewsArticle = {
  slug: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  body?: string;
  image?: string;
  categoryTitle?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  canonicalSourceUrl?: string;
  sourceDomain?: string;
  sourceLanguage?: string;
  sourcePublishedAt?: string;
  sourceFetchedAt?: string;
  sourceTimezone?: string;
  sourceFingerprint?: string;
  normalizedTitle?: string;
  contentHash?: string;
  eventFingerprint?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  topicClusterId?: string;
  informationGainScore?: number;
  duplicationScore?: number;
  seoKeywords?: string[];
  geoSummary?: string;
  localized?: Record<string, LocalizedNewsContent>;
  imagePolicy?: string;
  sourceImageUrl?: string;
  imageCredit?: string;
  imageRightsUrl?: string;
  licenseUrl?: string;
  editorialDisclaimer?: string;
  citations?: { title: string; url: string; domain: string }[];
  internalLinks?: { label: string; href: string }[];
  relatedProducts?: { slug: string; category: string; title: string; image?: string; href?: string; relevanceScore?: number; relationshipReason?: string }[];
};

// News is intentionally independent from Blog. Dynamic CMS records render on demand,
// so no static legacy content is mixed into News routes, RSS, or sitemaps.
export const staticPosts: NewsArticle[] = [];

function normalizeNewsItem(item: Record<string, any>): NewsArticle {
  const publishedAt = item.publishedAt || item.createdAt || new Date().toISOString();
  return {
    slug: item.slug,
    title: item.title,
    date: String(publishedAt).slice(0, 10),
    author: item.author || "Equipo editorial",
    summary: item.summary || item.metaDescription || "",
    body: item.body || "",
    image: item.image || item.imageUrl || "",
    categoryTitle: item.categoryTitle || "Noticias de la industria",
    sourceTitle: item.sourceTitle || item.sources?.[0]?.sourceName || item.sources?.[0]?.title || item.sourceDomain || "",
    sourceUrl: item.sourceUrl || item.canonicalSourceUrl || item.sources?.[0]?.url || "",
    canonicalSourceUrl: item.canonicalSourceUrl || item.sourceUrl || item.sources?.[0]?.url || "",
    sourceDomain: item.sourceDomain || item.sources?.[0]?.domain || "",
    sourceLanguage: item.sourceLanguage || item.sources?.[0]?.language || "",
    sourcePublishedAt: item.sourcePublishedAt || item.sources?.[0]?.publishedAt || "",
    sourceFetchedAt: item.sourceFetchedAt || item.createdAt || "",
    sourceTimezone: item.sourceTimezone || "",
    sourceFingerprint: item.sourceFingerprint || "",
    normalizedTitle: item.normalizedTitle || "",
    contentHash: item.contentHash || "",
    eventFingerprint: item.eventFingerprint || "",
    canonicalUrl: item.canonicalUrl || "",
    publishedAt,
    topicClusterId: item.topicClusterId || "",
    informationGainScore: item.informationGainScore,
    duplicationScore: item.duplicationScore,
    seoKeywords: item.seoKeywords || [],
    geoSummary: item.geoSummary || "",
    localized: item.localized || {},
    imagePolicy: item.imagePolicy || "",
    sourceImageUrl: item.sourceImageUrl || "",
    imageCredit: item.imageCredit || "",
    imageRightsUrl: item.imageRightsUrl || "",
    licenseUrl: item.licenseUrl || "",
    editorialDisclaimer: item.editorialDisclaimer || "",
    citations: item.citations || [],
    internalLinks: item.internalLinks || [],
    relatedProducts: item.relatedProducts || []
  };
}

function localizeNews(article: NewsArticle, locale: Locale): NewsArticle {
  const localized = article.localized?.[locale] || article.localized?.[defaultLocale] || article.localized?.es;
  if (!localized) return article;
  return {
    ...article,
    title: localized.title || article.title,
    summary: localized.summary || article.summary,
    body: localized.body || article.body,
    geoSummary: localized.geoSummary || article.geoSummary,
    seoKeywords: localized.seoKeywords || article.seoKeywords
  };
}

export async function getPublishedNews(locale: Locale = defaultLocale): Promise<NewsArticle[]> {
  noStore();
  const items = await getCmsItems("news", { siteId: siteConfig.siteId });
  return items
    .map(normalizeNewsItem)
    .map((article) => localizeNews(article, locale))
    .sort((a, b) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime());
}

export async function getNewsBySlug(slug: string, locale: Locale = defaultLocale): Promise<NewsArticle | undefined> {
  const articles = await getPublishedNews(locale);
  return articles.find((article) => article.slug === slug);
}
