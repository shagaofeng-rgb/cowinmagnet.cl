import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { getCmsItem, getCmsItems } from "@/lib/cmsStore";
import { Locale, defaultLocale } from "@/data/site";
import { publishedBlogArticles } from "@/data/publishedBlogArticles";

export type BlogArticle = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  categoryId: string;
  categoryTitle: string;
  image: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  localized?: Record<string, Partial<Pick<BlogArticle, "title" | "summary" | "body">>>;
};

function normalizeArticle(item: any): BlogArticle {
  return {
    slug: item.slug,
    title: item.title,
    summary: item.summary || item.metaDescription || "",
    body: item.body || "",
    author: item.author || "Cowinmagnet LATAM",
    categoryId: item.categoryId || "blog",
    categoryTitle: item.categoryTitle || "Blog",
    image: item.image || item.imageUrl || item.coverImage || "",
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    localized: item.localized || {}
  };
}

function localizeArticle(article: BlogArticle, locale: Locale): BlogArticle {
  const selected = article.localized?.[locale] || article.localized?.[defaultLocale] || article.localized?.es;
  return selected ? { ...article, ...selected } : article;
}

export async function getPublishedBlogArticles(locale: Locale = defaultLocale): Promise<BlogArticle[]> {
  noStore();
  const items = await getCmsItems("blog");
  const bySlug = new Map(publishedBlogArticles.map((article) => [article.slug, article]));
  for (const item of items) bySlug.set(item.slug, normalizeArticle(item));
  return [...bySlug.values()]
    .map((article) => localizeArticle(article, locale))
    .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime());
}

export async function getPublishedBlogArticle(slug: string, locale: Locale = defaultLocale): Promise<BlogArticle | null> {
  noStore();
  const item = await getCmsItem("blog", slug, { includeInactive: false });
  const article = item ? normalizeArticle(item) : publishedBlogArticles.find((candidate) => candidate.slug === slug);
  return article ? localizeArticle(article, locale) : null;
}
