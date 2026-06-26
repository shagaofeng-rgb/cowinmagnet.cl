import { getCmsItems } from "@/lib/cmsStore";
import { Locale, defaultLocale } from "@/data/site";
import { unstable_noStore as noStore } from "next/cache";

export type LocalizedNewsContent = {
  title?: string;
  summary?: string;
  body?: string;
  geoSummary?: string;
  seoKeywords?: string[];
};

export type BlogPost = {
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
  sourceDomain?: string;
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
  citations?: { title: string; url: string; domain: string }[];
  internalLinks?: { label: string; href: string }[];
};

export const staticPosts: BlogPost[] = [
  {
    slug: "como-seleccionar-separador-magnetico-para-cinta",
    title: "Como seleccionar un separador magnetico para cinta transportadora",
    date: "2026-06-09",
    author: "Cowinmagnet LATAM",
    summary: "Datos necesarios para revisar material, cinta, altura de instalacion y contaminante ferroso."
  },
  {
    slug: "proteccion-de-chancadores-contra-hierro-trampa",
    title: "Proteccion de chancadores contra hierro trampa",
    date: "2026-06-09",
    author: "Cowinmagnet LATAM",
    summary: "Riesgos comunes, puntos de instalacion y parametros iniciales para cotizacion."
  }
];

export const posts = staticPosts;

function normalizeCmsPost(item: any): BlogPost {
  return {
    slug: item.slug,
    title: item.title,
    date: (item.publishedAt || item.createdAt || new Date().toISOString()).slice(0, 10),
    author: item.author || "Cowinmagnet LATAM News Desk",
    summary: item.summary || item.metaDescription || "",
    body: item.body || "",
    image: item.image || item.imageUrl || "",
    categoryTitle: item.categoryTitle || "Industry News",
    sourceTitle: item.sourceTitle || item.sourceDomain || "",
    sourceUrl: item.sourceUrl || "",
    sourceDomain: item.sourceDomain || "",
    canonicalUrl: item.canonicalUrl || "",
    publishedAt: item.publishedAt || item.createdAt,
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
    citations: item.citations || [],
    internalLinks: item.internalLinks || []
  };
}

function localizePost(post: BlogPost, locale: Locale = defaultLocale): BlogPost {
  const selected = post.localized?.[locale] || post.localized?.[defaultLocale] || post.localized?.es;
  if (!selected) return post;
  return {
    ...post,
    title: selected.title || post.title,
    summary: selected.summary || post.summary,
    body: selected.body || post.body,
    geoSummary: selected.geoSummary || post.geoSummary,
    seoKeywords: selected.seoKeywords || post.seoKeywords
  };
}

export async function getPublishedPosts(locale: Locale = defaultLocale): Promise<BlogPost[]> {
  noStore();
  const cmsPosts = await getCmsItems("news");
  return [...cmsPosts.map(normalizeCmsPost), ...staticPosts].map((post) => localizePost(post, locale)).sort((a, b) => {
    return new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime();
  });
}

export async function getPostBySlug(slug: string, locale: Locale = defaultLocale): Promise<BlogPost | undefined> {
  const allPosts = await getPublishedPosts(locale);
  return allPosts.find((item) => item.slug === slug);
}
