import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { productCategories as staticCategories, products as staticProducts } from "./catalog";
import { getCmsItems } from "@/lib/cmsStore";
import { PRODUCT_LOCALIZATION_TYPE, PRODUCT_LOCALIZATION_TAG, productLocalizationKey, publicLocalization } from "@/lib/productLocalization";
import type { Locale } from "./site";
import { getProductDetailContent } from "./productDetailContent";
import { productPresentation } from "./productPresentation";

export async function getPublishedCatalogProducts() {
  // Only the synchronized main-site catalog can be rendered publicly. Legacy
  // CMS imports remain stored for administrators and cannot overwrite it.
  return staticProducts;
}

const getLiveLocalizations = unstable_cache(
  () => getCmsItems(PRODUCT_LOCALIZATION_TYPE),
  ["published-product-localizations-v1"],
  { tags: [PRODUCT_LOCALIZATION_TAG], revalidate: 300 }
);

export const getCatalogLocalizations = cache(async (locale: Locale) => {
  const target = locale === "es" ? "es-cl" : locale;
  try {
    const records = await getLiveLocalizations();
    return new Map<string, { title: string; summary: string; overview?: string }>(
      records.filter((item) => publicLocalization(item, target, item.productSlug)).map((item) => [productLocalizationKey(target, item.productSlug), item])
    );
  } catch (error) {
    console.error("[product-localizations] catalogue copy used", error?.message);
    return new Map<string, { title: string; summary: string; overview?: string }>();
  }
});

export function catalogLocalization(records: Awaited<ReturnType<typeof getCatalogLocalizations>>, locale: Locale, slug: string) {
  return records.get(productLocalizationKey(locale === "es" ? "es-cl" : locale, slug));
}

export async function getCatalogProductPage(product: (typeof staticProducts)[number], locale: Locale) {
  const content = getProductDetailContent(product, locale);
  const view = productPresentation(product, locale);
  const editorial = catalogLocalization(await getCatalogLocalizations(locale), locale, product.slug);
  const rcyd = content.series === "RCYD" && product.slug.startsWith("rcyd-type-permanent-magnet-self-dumping");
  const title = rcyd && (locale === "es" || locale === "es-cl") ? content.title.replace(/ RCYD$/, "") : view.title;
  return {
    content: {
      ...content,
      title: editorial?.title || title,
      summary: editorial?.summary || content.summary,
      howItWorks: editorial?.overview || content.howItWorks
    },
    editorial,
    view
  };
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
