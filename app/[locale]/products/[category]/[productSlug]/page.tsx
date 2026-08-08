import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { getPublishedPosts } from "@/data/blog";
import { getCategoryDisplay, getProductSummary, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath, siteConfig } from "@/data/site";
import { localizedProductSeo } from "@/lib/seo";
import { getProductTruthCard, safeSpanishProductPresentation } from "@/data/productTruth";

export const dynamic = "force-dynamic";

function CatalogImage({ src, alt }: { src: string; alt: string }) {
  const unoptimized = src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://");
  return <Image src={src} alt={alt} width={720} height={540} sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 33vw" unoptimized={unoptimized} />;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; category: string; productSlug: string }> }): Promise<Metadata> {
  const { locale, category, productSlug } = await params;
  const catalogProducts = await getPublishedCatalogProducts();
  const product = catalogProducts.find((item) => item.slug === productSlug);
  const canonical = `/${locale}/products/${category}/${productSlug}`;
  const presentation = product && (locale === "es-cl" || locale === "es") ? safeSpanishProductPresentation(product) : null;
  const title = product ? localizedProductSeo(locale, presentation?.title || product.title) : "Product";
  const description = product ? (presentation?.summary || getProductSummary(product, locale)).slice(0, 155) : undefined;
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
    openGraph: product ? {
      title,
      description,
      type: "website",
      url: canonical,
      images: [{ url: product.image, width: 1200, height: 800, alt: product.title }]
    } : undefined,
    twitter: product ? {
      card: "summary_large_image",
      title,
      description,
      images: [product.image]
    } : undefined
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: Locale; category: string; productSlug: string }> }) {
  const { locale, category: categorySlug, productSlug } = await params;
  const catalogProducts = await getPublishedCatalogProducts();
  const categories = await getPublishedCatalogCategories(catalogProducts);
  const product = catalogProducts.find((item) => item.category === categorySlug && item.slug === productSlug);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!product || !category) notFound();
  const relatedProducts = catalogProducts.filter((item) => item.category === categorySlug && item.slug !== product.slug).slice(0, 3);
  const relatedNews = (await getPublishedPosts(locale))
    .filter((post) => post.relatedProducts?.some((related) => related.slug === product.slug || related.category === product.category))
    .slice(0, 3);
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const truth = getProductTruthCard(product.slug);
  const categoryDisplay = productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary };
  const spanishPresentation = (locale === "es-cl" || locale === "es") ? safeSpanishProductPresentation(product) : null;
  const displayTitle = spanishPresentation?.title || product.title;
  const productSummary = spanishPresentation?.summary || getProductSummary(product, locale);
  const gallery = product.imageGallery?.length ? product.imageGallery : [product.image];
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayTitle,
    description: productSummary,
    image: gallery.map((item) => item.startsWith("http") ? item : `https://cowinmagnet.cl${item}`),
    brand: { "@type": "Brand", name: "Cowinmagnet" },
    category: categoryDisplay.title,
    url: `https://cowinmagnet.cl/${locale}/products/${product.category}/${product.slug}`,
    additionalProperty: (truth?.verifiedSpecifications || []).map((item) => ({
      "@type": "PropertyValue",
      name: item.label,
      value: item.value
    }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.products, item: `https://cowinmagnet.cl/${locale}/products` },
      { "@type": "ListItem", position: 2, name: categoryDisplay.title, item: `https://cowinmagnet.cl/${locale}/products/${category.slug}` },
      { "@type": "ListItem", position: 3, name: displayTitle }
    ]
  };
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: categoryDisplay.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: displayTitle }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <HeroBanner eyebrow={truth?.model || copy.productDetail} title={displayTitle} summary={productSummary} image={product.image} imageMode="product" />
      <section className="band product-actions"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{copy.fullQuote}</Link><a className="button light" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">Hablar con un especialista</a></section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.overview}</h3><p>{productSummary}</p></article>
          <article><h3>{copy.features}</h3><ul>{truth ? [truth.equipmentType, `Fuente magnetica: ${truth.magnetType}`, `Descarga: ${truth.discharge}`].map((item) => <li key={item}>{item}</li>) : <li>Configuracion disponible bajo solicitud y sujeta a validacion tecnica.</li>}</ul></article>
          <article><h3>{copy.applications}</h3><ul>{(truth?.applications || product.applications).map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading">
          <p className="eyebrow">{copy.images}</p>
          <h2>{copy.imagesTitle}</h2>
          <p>{copy.imagesText}</p>
        </div>
        <div className="page-grid">
          <article className="content-card"><CatalogImage src={gallery[0]} alt={`${displayTitle} - vista principal`} /><div className="content-card-body"><h3>{copy.mainView}</h3><p>{copy.mainViewText}</p></div></article>
          <article className="content-card"><CatalogImage src={gallery[1] ?? gallery[0]} alt={`${displayTitle} - vista adicional`} /><div className="content-card-body"><h3>{copy.galleryView}</h3><p>{copy.galleryViewText}</p></div></article>
          <article className="content-card"><CatalogImage src={gallery[2] ?? gallery[0]} alt={`${displayTitle} - referencia de instalacion`} /><div className="content-card-body"><h3>{copy.installationView}</h3><p>{copy.installationViewText}</p></div></article>
        </div>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.principle}</h3><p>{truth?.principle || "El principio y el circuito magnetico se describen en la ficha tecnica disponible bajo solicitud para evitar atribuir caracteristicas de otra serie."}</p></article>
          <article><h3>{copy.installation}</h3><p>{truth?.installation.join(" ") || copy.installationText}</p></article>
          <article><h3>{copy.options}</h3><p>{truth?.options.join(" ") || "Las opciones reales se confirman por modelo y por las condiciones del proyecto."}</p></article>
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading"><p className="eyebrow">{copy.technicalParameters}</p><h2>{copy.technicalParametersTitle}</h2><p>{copy.technicalParametersText}</p></div>
        <table className="spec-table"><tbody>{truth?.verifiedSpecifications.length ? truth.verifiedSpecifications.map((item) => <tr key={item.label}><th>{item.label}</th><td>{item.value}</td></tr>) : <tr><th>Ficha tecnica</th><td>Disponible bajo solicitud</td></tr>}</tbody></table>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.selectionGuide}</h3><ul>{(truth?.selectionInputs || []).map((item) => <li key={item}>{item}</li>)}</ul>{!truth ? <p>{copy.selectionGuideText}</p> : null}</article>
          <article><h3>{copy.operatingConditions}</h3><p>{copy.operatingConditionsText}</p></article>
          <article><h3>{copy.maintenance}</h3><p>{copy.maintenanceText}</p></article>
        </div>
      </section>
      <section className="band muted">
        <div className="geo-grid">
          <article><h3>{copy.spares}</h3><p>{copy.sparesText}</p></article>
          <article><h3>{copy.packaging}</h3><p>{copy.packagingText}</p></article>
          <article><h3>{copy.downloads}</h3><p>{copy.downloadsText}</p><Link className="button light" href="/downloads/selection-questionnaire.txt">{copy.downloadQuestionnaire}</Link></article>
        </div>
      </section>
      <section className="band">
        <FAQAccordion items={truth ? truth.faqs.map((item) => [item.question, item.answer] as [string, string]) : copy.faq} />
      </section>
      <section className="band muted">
        <div className="section-heading"><p className="eyebrow">{copy.related}</p><h2>{copy.relatedTitle}</h2></div>
        <div className="page-grid">{relatedProducts.map((item) => { const relatedPresentation = (locale === "es-cl" || locale === "es") ? safeSpanishProductPresentation(item) : null; return <article className="content-card" key={item.slug}><CatalogImage src={item.image} alt={relatedPresentation?.title || item.title} /><div className="content-card-body"><h3>{relatedPresentation?.title || item.title}</h3><p>{relatedPresentation?.summary || getProductSummary(item, locale)}</p><Link href={localizedPath(locale, `products/${item.category}/${item.slug}`)}>{copy.viewProduct}</Link></div></article>; })}</div>
      </section>
      {relatedNews.length ? (
        <section className="band">
          <div className="section-heading"><p className="eyebrow">News</p><h2>Related industry news</h2></div>
          <div className="page-grid">{relatedNews.map((post) => <article className="content-card" key={post.slug}>{post.image ? <CatalogImage src={post.image} alt={post.title} /> : null}<div className="content-card-body"><h3>{post.title}</h3><p>{post.summary}</p><Link href={localizedPath(locale, `news/${post.slug}`)}>Read news</Link></div></article>)}</div>
        </section>
      ) : null}
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.relatedIndustries}</h3><p>{copy.relatedIndustriesText}</p><Link href={localizedPath(locale, "industries")}>{copy.viewIndustries}</Link></article>
          <article><h3>{copy.relatedSolutions}</h3><p>{copy.relatedSolutionsText}</p><Link href={localizedPath(locale, "solutions")}>{copy.viewSolutions}</Link></article>
          <article><h3>{copy.technicalSupport}</h3><p>{copy.technicalSupportText}</p><Link href={localizedPath(locale, "technical-support")}>{copy.viewSupport}</Link></article>
        </div>
      </section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">{copy.quote}</p><h2>{copy.quoteTitle}</h2></div><QuoteForm locale={locale} /></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{copy.fullQuote}</Link></section>
    </>
  );
}
