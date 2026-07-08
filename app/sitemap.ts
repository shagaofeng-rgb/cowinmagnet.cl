import type { MetadataRoute } from "next";
import { productCategories, products, industries, markets, chileRegions, solutions } from "@/data/catalog";
import { getPublishedPosts } from "@/data/blog";

const baseUrl = "https://cowinmagnet.cl";
const locales = ["es-cl", "es", "pt-br", "en"];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function entry(path: string, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = locales.flatMap((locale) => [
    entry(`/${locale}`, 1),
    entry(`/${locale}/products`, 0.9),
    entry(`/${locale}/industries`, 0.8),
    entry(`/${locale}/solutions`, 0.8),
    entry(`/${locale}/markets`, 0.8),
    entry(`/${locale}/technical-support`, 0.7),
    entry(`/${locale}/downloads`, 0.6),
    entry(`/${locale}/about`, 0.6),
    entry(`/${locale}/news`, 0.7),
    entry(`/${locale}/contact`, 0.8),
    entry(`/${locale}/request-a-quote`, 0.9)
  ]);

  const categoryPages = locales.flatMap((locale) =>
    productCategories.map((category) => entry(`/${locale}/products/${category.slug}`, 0.82))
  );
  const productPages = locales.flatMap((locale) =>
    products.map((product) => entry(`/${locale}/products/${product.category}/${product.slug}`, 0.75))
  );
  const industryPages = locales.flatMap((locale) =>
    industries.map((industry) => entry(`/${locale}/industries/${industry.slug}`, 0.72))
  );
  const solutionPages = locales.flatMap((locale) =>
    solutions.map((solution) => entry(`/${locale}/solutions/${solution.slug}`, 0.72))
  );
  const marketPages = locales.flatMap((locale) =>
    markets.map((market) => entry(`/${locale}/markets/${market.slug}`, 0.72))
  );
  const chileRegionPages = locales.flatMap((locale) =>
    chileRegions.map((region) => entry(`/${locale}/markets/chile/${region.slug}`, 0.65))
  );

  const posts = await getPublishedPosts();
  const blogPages = locales.flatMap((locale) =>
    posts.map((post) => entry(`/${locale}/news/${post.slug}`, 0.68))
  );

  return [...staticPages, ...categoryPages, ...productPages, ...industryPages, ...solutionPages, ...marketPages, ...chileRegionPages, ...blogPages];
}
