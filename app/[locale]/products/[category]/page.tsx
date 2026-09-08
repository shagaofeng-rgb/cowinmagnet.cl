import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath } from "@/data/site";
import type { Metadata } from "next";
import { localizedAlternates, localizedProductSeo } from "@/lib/seo";
import { productPresentation } from "@/data/productPresentation";
import { PaginationNav } from "@/components/PaginationNav";
import { paginateList, parseListPagination } from "@/lib/listPagination";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; category: string }> }): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const categories = await getPublishedCatalogCategories();
  const category = categories.find((item) => item.slug === categorySlug);
  const display = category ? (productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary }) : null;
  return {
    title: display ? localizedProductSeo(locale, display.title) : "Product Category",
    description: display?.summary,
    alternates: localizedAlternates(locale, `products/${categorySlug}`)
  };
}

export default async function ProductCategoryPage({ params, searchParams }: { params: Promise<{ locale: Locale; category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, category: categorySlug } = await params;
  const query = await searchParams;
  const catalogProducts = await getPublishedCatalogProducts();
  const categories = await getPublishedCatalogCategories(catalogProducts);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) notFound();
  const list = catalogProducts.filter((item) => item.category === categorySlug);
  const paged = paginateList(list, parseListPagination(query, { defaultPageSize: 12, allowedPageSizes: [12] }));
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const display = productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary };
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: display.title }]} />
      <HeroBanner eyebrow={copy.productCategory} title={display.title} summary={display.summary} image={categoryImages[category.key]} />
      <section className="band"><div className="page-grid">{paged.items.map((product) => { const presentation = productPresentation(product, locale); return <ContentCard key={product.slug} title={presentation.title} summary={presentation.summary} image={product.image} href={localizedPath(locale, `products/${categorySlug}/${product.slug}`)} />; })}</div><PaginationNav meta={paged.meta} pathname={localizedPath(locale, `products/${categorySlug}`)} params={query} locale={locale} /></section>
    </>
  );
}
