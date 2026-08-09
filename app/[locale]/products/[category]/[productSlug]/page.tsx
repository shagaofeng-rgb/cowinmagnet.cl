import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OperationDocuments, OptionsGrid, ProductApplications, ProductFaq, ProductHero, ProductHowItWorks, ProductQuoteIntro, ProductStickyActions, RelatedProducts, SelectionGuide, SpecGroups } from "@/components/ProductDetailBlocks";
import { ProductInquiryForm } from "@/components/ProductInquiryForm";
import { ProductSectionNav } from "@/components/ProductSectionNav";
import { getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { getProductDetailContent } from "@/data/productDetailContent";
import { Locale, localizedPath } from "@/data/site";
import { localizedProductSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

function sectionCopy(locale: Locale) {
  if (locale === "en") return { overview: "Overview", how: "How it works", applications: "Applications", selection: "Selection", specifications: "Specifications", faq: "FAQ" };
  if (locale === "pt-br") return { overview: "Resumo", how: "Como funciona", applications: "Aplicações", selection: "Seleção", specifications: "Especificações", faq: "Perguntas frequentes" };
  return { overview: "Resumen", how: "Funcionamiento", applications: "Aplicaciones", selection: "Selección", specifications: "Especificaciones", faq: "FAQ" };
}

function relatedProductsFor<T extends { slug: string; category: string; title: string }>(current: T, catalogProducts: T[]) {
  const source = `${current.slug} ${current.title}`.toLowerCase();
  const suspended = /(rcyd|rcye|rcyb|rcyp|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rcps|overband|suspended)/.test(source);
  const wet = /(wet|ctb|ctn|cts|hmdn|clt|nct|wbc|hjlh|hjpc|gtc)/.test(source);
  const recycling = /(eddy|stainless|head-pulley|drum-magnet)/.test(source);
  const score = (item: T) => {
    const value = `${item.slug} ${item.title}`.toLowerCase();
    let result = item.category === current.category ? 3 : 0;
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
  const content = product ? getProductDetailContent(product, locale) : null;
  const title = product && content ? localizedProductSeo(locale, content.title) : "Product";
  const description = content?.summary;
  const canonical = `/${locale}/products/${category}/${productSlug}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "es-CL": `/es-cl/products/${category}/${productSlug}`,
        es: `/es/products/${category}/${productSlug}`,
        "pt-BR": `/pt-br/products/${category}/${productSlug}`,
        en: `/en/products/${category}/${productSlug}`,
        "x-default": `/es-cl/products/${category}/${productSlug}`
      }
    },
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
  const content = getProductDetailContent(product, locale);
  const navigation = sectionCopy(locale);
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
    category: categoryDisplay.title,
    url: `https://cowinmagnet.cl/${locale}/products/${product.category}/${product.slug}`,
    additionalProperty: content.confirmedSpecifications.map((item) => ({ "@type": "PropertyValue", name: item.label, value: item.value }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.products, item: `https://cowinmagnet.cl/${locale}/products` },
      { "@type": "ListItem", position: 2, name: categoryDisplay.title, item: `https://cowinmagnet.cl/${locale}/products/${category.slug}` },
      { "@type": "ListItem", position: 3, name: content.title }
    ]
  };

  return <main className="pd-page">
    <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: categoryDisplay.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: content.title }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <ProductHero product={product} content={content} categoryTitle={categoryDisplay.title} locale={locale} />
    <ProductSectionNav items={[{ id: "funcionamiento", label: navigation.how }, { id: "aplicaciones", label: navigation.applications }, { id: "seleccion", label: navigation.selection }, { id: "especificaciones", label: navigation.specifications }, { id: "faq", label: navigation.faq }]} />
    <ProductHowItWorks product={product} content={content} locale={locale} />
    <ProductApplications product={product} locale={locale} />
    <SelectionGuide product={product} content={content} locale={locale} />
    <SpecGroups content={content} locale={locale} />
    <OptionsGrid content={content} locale={locale} />
    <OperationDocuments content={content} locale={locale} />
    <ProductFaq content={content} locale={locale} />
    <RelatedProducts products={relatedProducts} locale={locale} />
    <section id="cotizacion" className="pd-quote-section"><div className="pd-shell pd-quote-grid"><ProductQuoteIntro locale={locale} /><ProductInquiryForm locale={locale} productName={content.title} model={content.series} /></div></section>
    <ProductStickyActions locale={locale} />
  </main>;
}
