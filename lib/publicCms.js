import "server-only";
import { unstable_cache } from "next/cache";
import { getCmsItems } from "@/lib/cmsStore";

export const getCachedPublishedNews = unstable_cache(
  () => getCmsItems("news"),
  ["public-cms-news"],
  { revalidate: 300, tags: ["public-news"] }
);

export const getCachedCatalogProducts = unstable_cache(
  () => getCmsItems("product", { includeInactive: true }),
  ["public-cms-products"],
  { revalidate: 300, tags: ["public-products"] }
);
