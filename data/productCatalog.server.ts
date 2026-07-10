import "server-only";
import { productCategories as staticCategories, products as staticProducts } from "./catalog";
import { getCachedCatalogProducts } from "@/lib/publicCms";

function normalizeCmsProduct(item: any) {
  return {
    slug: item.slug,
    category: item.categoryId || "uploaded-products",
    sourceCategory: item.categoryTitle || "Managed Products",
    title: item.title,
    summary: item.summary || item.overview || "Technical configuration is confirmed for each project before quotation.",
    image: item.image || "/assets/brief/rcyd-self-cleaning-permanent-magnet.jpg",
    imageGallery: item.imageGallery?.length ? item.imageGallery : [item.image || "/assets/brief/rcyd-self-cleaning-permanent-magnet.jpg"],
    sourceUrl: item.sourceUrl || "",
    features: item.features || [],
    applications: item.applications || (item.application ? [item.application] : []),
    parameters: (item.specifications || []).map((spec: any) => spec.label).filter(Boolean),
    updatedAt: item.updatedAt || item.publishedAt || item.createdAt
  };
}

export async function getPublishedCatalogProducts() {
  const cmsItems = await getCachedCatalogProducts();
  const published = cmsItems.filter((item: any) => item.status === "published").map(normalizeCmsProduct);
  const bySlug = new Map(staticProducts.map((item) => [item.slug, item]));
  for (const item of published) bySlug.set(item.slug, { ...bySlug.get(item.slug), ...item });
  return [...bySlug.values()];
}

export async function getPublishedCatalogCategories(catalogProducts?: Awaited<ReturnType<typeof getPublishedCatalogProducts>>) {
  const products = catalogProducts || await getPublishedCatalogProducts();
  const bySlug = new Map(staticCategories.map((item) => [item.slug, item]));
  for (const product of products) {
    if (!bySlug.has(product.category)) {
      bySlug.set(product.category, {
        slug: product.category,
        sourceTitle: product.sourceCategory,
        key: "application" as const,
        title: product.sourceCategory,
        summary: `Products managed in the Cowinmagnet.cl content system for ${product.sourceCategory}.`
      });
    }
  }
  return [...bySlug.values()];
}
