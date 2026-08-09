import "server-only";
import { productCategories as staticCategories, products as staticProducts } from "./catalog";

export async function getPublishedCatalogProducts() {
  // Only the synchronized main-site catalog can be rendered publicly. Legacy
  // CMS imports remain stored for administrators and cannot overwrite it.
  return staticProducts;
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
