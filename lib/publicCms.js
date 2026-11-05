import "server-only";
import { gzipSync, gunzipSync } from "node:zlib";
import { unstable_cache } from "next/cache";
import { getCmsItems } from "@/lib/cmsStore";

const SITE_ID = "cowinmagnet_latam";
const REVALIDATE_SECONDS = 2 * 60 * 60;

function cacheArticles(type) {
  const load = () => getCmsItems(type, { siteId: SITE_ID });
  const cache = unstable_cache(async () => {
    const compressed = gzipSync(JSON.stringify(await load())).toString("base64");
    return compressed.length < 1_750_000 ? compressed : null;
  }, [`public-cms-${type}-collection-v2`], { revalidate: REVALIDATE_SECONDS, tags: [`public-${type}`] });
  return async () => {
    const value = await cache();
    return value ? JSON.parse(gunzipSync(Buffer.from(value, "base64")).toString()) : load();
  };
}

const publishedNews = cacheArticles("news");
const publishedBlog = cacheArticles("blog");

function withoutBody(items) {
  return items.map(({ body, ...item }) => item);
}

export async function getCachedPublishedNews({ includeBody = false } = {}) {
  const items = await publishedNews();
  return includeBody ? items : withoutBody(items);
}

export async function getCachedPublishedNewsItem(slug) {
  return (await publishedNews()).find((item) => item.slug === slug) || null;
}

export async function getCachedPublishedBlog({ includeBody = false } = {}) {
  const items = await publishedBlog();
  return includeBody ? items : withoutBody(items);
}

export async function getCachedPublishedBlogItem(slug) {
  return (await publishedBlog()).find((item) => item.slug === slug) || null;
}

export const getCachedCatalogProducts = unstable_cache(
  () => getCmsItems("product", { includeInactive: true }),
  ["public-cms-products"],
  { revalidate: REVALIDATE_SECONDS, tags: ["public-products"] }
);
