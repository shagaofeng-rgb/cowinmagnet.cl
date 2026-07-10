import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, getCategoryDisplay, getProductSummary, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath } from "@/data/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; category: string }> }): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const categories = await getPublishedCatalogCategories();
  const category = categories.find((item) => item.slug === categorySlug);
  const display = category ? (productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary }) : null;
  return {
    title: display ? display.title : "Product Category",
    description: display?.summary,
    alternates: {
      canonical: `/${locale}/products/${categorySlug}`,
      languages: {
        "es-CL": `/es-cl/products/${categorySlug}`,
        es: `/es/products/${categorySlug}`,
        "pt-BR": `/pt-br/products/${categorySlug}`,
        en: `/en/products/${categorySlug}`,
        "x-default": `/es-cl/products/${categorySlug}`
      }
    }
  };
}

export default async function ProductCategoryPage({ params }: { params: Promise<{ locale: Locale; category: string }> }) {
  const { locale, category: categorySlug } = await params;
  const catalogProducts = await getPublishedCatalogProducts();
  const categories = await getPublishedCatalogCategories(catalogProducts);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) notFound();
  const list = catalogProducts.filter((item) => item.category === categorySlug);
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const display = productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary };
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: display.title }]} />
      <HeroBanner eyebrow={copy.productCategory} title={display.title} summary={display.summary} image={categoryImages[category.key]} />
      <section className="band"><div className="page-grid">{list.map((product) => <ContentCard key={product.slug} title={product.title} summary={getProductSummary(product, locale)} image={product.image} href={localizedPath(locale, `products/${categorySlug}/${product.slug}`)} />)}</div></section>
    </>
  );
}
