import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior } from "@/components/Interior";
import { ProductInterior } from "@/components/ProductInterior";
import { getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getCatalogProductPage, getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath, t } from "@/data/site";
import { canonicalLocale, localizedAlternates, localizedProductSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

function relatedProductsFor<T extends { slug: string; category: string; title: string }>(current: T, catalogProducts: T[]) {
  const source = `${current.slug} ${current.title}`.toLowerCase();
  const suspended = /(rcyd|rcye|rcyb|rcyp|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rcps|overband|suspended)/.test(source);
  const wet = /(wet|ctb|ctn|cts|hmdn|clt|nct|wbc|hjlh|hjpc|gtc)/.test(source);
  const recycling = /(eddy|stainless|head-pulley|drum-magnet)/.test(source);
  const score = (item: T) => {
    const value = `${item.slug} ${item.title}`.toLowerCase();
    let result = item.category === current.category ? 10 : 0;
    if (suspended && /(suspended|overband|rcyd|rcye|rcyb|rcyp|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rcps|head-pulley|drum-magnet)/.test(value)) result += 8;
    if (wet && /(wet|ctb|ctn|cts|tailing|hjlh|hjpc|gtc|wbc|nct|clt)/.test(value)) result += 8;
    if (recycling && /(eddy|drum-magnet|metal-detector|stainless|head-pulley)/.test(value)) result += 8;
    return result;
  };
  return catalogProducts.filter((item) => item.slug !== current.slug).map((item) => ({ item, score: score(item) })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title)).slice(0, 3).map(({ item }) => item);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; category: string; productSlug: string }> }): Promise<Metadata> {
  const { locale, category, productSlug } = await params;
  const catalogProducts = await getPublishedCatalogProducts();
  const product = catalogProducts.find((item) => item.category === category && item.slug === productSlug);
  const content = product ? (await getCatalogProductPage(product, locale)).content : null;
  const title = product && content ? localizedProductSeo(locale, content.title, content.series) : "Product";
  const description = content?.summary;
  const canonical = `/${canonicalLocale(locale)}/products/${category}/${productSlug}`;
  return {
    title,
    description,
    alternates: localizedAlternates(locale, `products/${category}/${productSlug}`),
    openGraph: product && content ? { title, description, type: "website", url: canonical, images: [{ url: product.image, width: 1200, height: 800, alt: content.title }] } : undefined,
    twitter: product && content ? { card: "summary_large_image", title, description, images: [product.image] } : undefined
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: Locale; category: string; productSlug: string }> }) {
  const { locale, category: categorySlug, productSlug } = await params;
  const catalogProducts = await getPublishedCatalogProducts();
  const categories = await getPublishedCatalogCategories(catalogProducts);
  const product = catalogProducts.find((item) => item.category === categorySlug && item.slug === productSlug);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!product || !category) notFound();

  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const { content, editorial } = await getCatalogProductPage(product, locale);
  const categoryDisplay = productCategories.some((item) => item.slug === category.slug)
    ? getCategoryDisplay(category as (typeof productCategories)[number], locale)
    : { title: category.title, summary: category.summary };
  const relatedProducts = relatedProductsFor(product, catalogProducts);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.title,
    description: content.summary,
    image: product.image.startsWith("http") ? product.image : `https://cowinmagnet.cl${product.image}`,
    brand: { "@type": "Brand", name: "COWIN MAGNET" },
    ...(content.series ? { model: content.series } : {}),
    category: categoryDisplay.title,
    url: `https://cowinmagnet.cl/${canonicalLocale(locale)}/products/${product.category}/${product.slug}`,
    additionalProperty: content.confirmedSpecifications.map((item) => ({ "@type": "PropertyValue", name: item.label, value: item.value }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.products, item: `https://cowinmagnet.cl/${canonicalLocale(locale)}/products` },
      { "@type": "ListItem", position: 2, name: categoryDisplay.title, item: `https://cowinmagnet.cl/${canonicalLocale(locale)}/products/${category.slug}` },
      { "@type": "ListItem", position: 3, name: content.title }
    ]
  };

  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: category.key === "permanent" ? t(locale, "Separadores suspendidos", "Separadores suspensos", "Suspended separators") : categoryDisplay.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: content.series || content.title }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <ProductInterior product={product} content={content} editorialSummary={editorial?.summary} categoryTitle={categoryDisplay.title} related={relatedProducts} locale={locale} />
  </Interior>;
}
