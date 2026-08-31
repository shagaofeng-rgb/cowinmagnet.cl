import "server-only";
import { unstable_cache } from "next/cache";
import { getCmsItems } from "@/lib/cmsStore";

export const getCachedPublishedNews = unstable_cache(
  () => getCmsItems("news", { siteId: "cowinmagnet_latam" }),
  ["public-cms-news"],
  { revalidate: 300, tags: ["public-news"] }
);

export const getCachedPublishedBlog = unstable_cache(
  () => getCmsItems("blog", { siteId: "cowinmagnet_latam" }),
  ["public-cms-blog"],
  { revalidate: 300, tags: ["public-blog"] }
);

export const getCachedCatalogProducts = unstable_cache(
  () => getCmsItems("product", { includeInactive: true }),
  ["public-cms-products"],
  { revalidate: 300, tags: ["public-products"] }
);
