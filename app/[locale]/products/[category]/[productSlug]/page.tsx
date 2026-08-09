import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductInquiryForm } from "@/components/ProductInquiryForm";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import { getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { getProductDetailContent } from "@/data/productDetailContent";
import { Locale, localizedPath, siteConfig } from "@/data/site";
import { localizedProductSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

function detailText(locale: Locale) {
  if (locale === "pt-br") return {
    principle: "Como funciona", features: "Características principais", applications: "Aplicações típicas", problems: "O que ajuda a resolver", installation: "Instalação e seleção", specifications: "Especificações técnicas", pending: "Dados a confirmar", options: "Opções e personalização", operation: "Operação e manutenção", faq: "Perguntas frequentes", related: "Produtos relacionados", quote: "Solicite uma seleção técnica", speak: "Falar com um especialista", view: "Ver produto", pendingText: "Disponível sob solicitação e confirmação da engenharia COWIN."
  };
  if (locale === "en") return {
    principle: "How it works", features: "Key features", applications: "Typical applications", problems: "What it helps solve", installation: "Installation and selection", specifications: "Technical specifications", pending: "Data to confirm", options: "Options and customization", operation: "Operation and maintenance", faq: "Frequently asked questions", related: "Related products", quote: "Request technical selection", speak: "Talk to a specialist", view: "View product", pendingText: "Available on request and subject to confirmation by COWIN engineering."
  };
  return {
    principle: "Cómo funciona", features: "Características principales", applications: "Aplicaciones típicas", problems: "Qué problema ayuda a resolver", installation: "Instalación y guía de selección", specifications: "Especificaciones técnicas", pending: "Datos por confirmar", options: "Opciones y personalización", operation: "Operación y mantenimiento", faq: "Preguntas frecuentes", related: "Productos relacionados", quote: "Solicite una selección técnica", speak: "Hablar con un especialista", view: "Ver producto", pendingText: "Disponible bajo solicitud y sujeto a confirmación por ingeniería de COWIN."
  };
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
  const text = detailText(locale);
  const content = getProductDetailContent(product, locale);
  const categoryDisplay = productCategories.some((item) => item.slug === category.slug)
    ? getCategoryDisplay(category as (typeof productCategories)[number], locale)
    : { title: category.title, summary: category.summary };
  const relatedProducts = catalogProducts.filter((item) => item.category === categorySlug && item.slug !== product.slug).slice(0, 3);
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

  return <>
    <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: categoryDisplay.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: content.title }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

    <section className="product-detail-hero">
      <div className="product-detail-wrap product-detail-top">
        <ProductMediaGallery images={product.imageGallery?.length ? product.imageGallery : [product.image]} alt={content.title} />
        <article className="product-detail-intro">
          <p className="eyebrow">{categoryDisplay.title}</p>
          <h1>{content.title}</h1>
          <p className="product-detail-lead">{content.summary}</p>
          <dl className="product-identity-list">
            {content.series ? <><dt>{locale === "pt-br" ? "Série" : locale === "en" ? "Series" : "Serie"}</dt><dd>{content.series}</dd></> : null}
            <dt>{locale === "pt-br" ? "Cobertura" : locale === "en" ? "Coverage" : "Cobertura"}</dt><dd>{locale === "pt-br" ? "Chile e América Latina" : locale === "en" ? "Chile and Latin America" : "Chile y Latinoamérica"}</dd>
            <dt>{locale === "pt-br" ? "Seleção" : locale === "en" ? "Selection" : "Selección"}</dt><dd>{locale === "pt-br" ? "Validada por projeto" : locale === "en" ? "Validated by project" : "Validada por proyecto"}</dd>
          </dl>
          <div className="product-detail-actions">
            <Link className="button primary" href="#cotizacion">{copy.fullQuote}</Link>
            <a className="button light" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">{text.speak}</a>
          </div>
        </article>
      </div>
    </section>

    <nav className="product-section-nav" aria-label="Product page sections"><div className="product-detail-wrap"><a href="#funcionamiento">{text.principle}</a><a href="#aplicaciones">{text.applications}</a><a href="#especificaciones">{text.specifications}</a><a href="#cotizacion">{copy.fullQuote}</a></div></nav>

    <section id="funcionamiento" className="product-section"><div className="product-detail-wrap product-two-column">
      <div><p className="eyebrow">{categoryDisplay.title}</p><h2>{text.principle}</h2><p className="section-lead">{content.howItWorks}</p></div>
      <div className="product-content-stack"><article className="product-info-card"><h3>{text.features}</h3><ul>{content.features.map((item) => <li key={item}>{item}</li>)}</ul></article><article className="product-info-card"><h3>{text.problems}</h3><ul>{content.problems.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
    </div></section>

    <section id="aplicaciones" className="product-section product-section-muted"><div className="product-detail-wrap product-two-column">
      <div><p className="eyebrow">Chile y Latinoamérica</p><h2>{text.applications}</h2><p className="section-lead">{locale === "es-cl" || locale === "es" ? "Las aplicaciones se validan con el material, el punto de proceso y el objetivo técnico de cada proyecto." : "Applications are validated against material, process location and the technical objective of each project."}</p></div>
      <ul className="product-application-list">{content.applications.map((item) => <li key={item}>{item}</li>)}</ul>
    </div></section>

    <section id="seleccion" className="product-section"><div className="product-detail-wrap product-two-column">
      <div><p className="eyebrow">COWIN MAGNET</p><h2>{text.installation}</h2><p className="section-lead">{locale === "es-cl" || locale === "es" ? "La selección se cierra con información de proceso y espacio real; no se sustituyen esos datos por supuestos de catálogo." : "Selection is completed with real process and layout information, not catalogue assumptions."}</p></div>
      <div className="product-selection-grid"><article><h3>{locale === "pt-br" ? "Instalação" : locale === "en" ? "Installation" : "Instalación"}</h3><ol>{content.installation.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></article><article><h3>{locale === "pt-br" ? "Dados para seleção" : locale === "en" ? "Selection inputs" : "Datos para selección"}</h3><ul>{content.selectionInputs.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
    </div></section>

    <section id="especificaciones" className="product-section product-section-muted"><div className="product-detail-wrap product-data-layout">
      <div><p className="eyebrow">{categoryDisplay.title}</p><h2>{text.specifications}</h2><p className="section-lead">{content.confirmedSpecifications.length ? text.pendingText : `${text.pendingText} ${locale === "es-cl" || locale === "es" ? "No se publican cifras no confirmadas." : "Unconfirmed values are not published."}`}</p></div>
      <dl className="product-data-list">{content.confirmedSpecifications.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}{content.pendingSpecifications.map((item) => <div key={item}><dt>{item}</dt><dd>{text.pendingText}</dd></div>)}</dl>
    </div></section>

    <section className="product-section"><div className="product-detail-wrap product-two-column">
      <div><p className="eyebrow">{content.series || categoryDisplay.title}</p><h2>{text.options}</h2><p className="section-lead">{locale === "es-cl" || locale === "es" ? "Las opciones se confirman solo cuando corresponden al modelo y a la condición de proceso indicada por el proyecto." : "Options are confirmed only when they apply to the selected model and stated process conditions."}</p></div>
      <div className="product-content-stack"><article className="product-info-card"><h3>{locale === "pt-br" ? "Configuração disponível" : locale === "en" ? "Available configuration" : "Configuración disponible"}</h3><ul>{content.options.map((item) => <li key={item}>{item}</li>)}</ul></article><article className="product-info-card"><h3>{text.operation}</h3><ul>{content.operation.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
    </div></section>

    <section className="product-section product-section-muted"><div className="product-detail-wrap product-faq-layout"><div><p className="eyebrow">COWIN MAGNET</p><h2>{text.faq}</h2></div><div>{content.faqs.map((faq) => <details className="product-faq" key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></div></section>

    {relatedProducts.length ? <section className="product-section"><div className="product-detail-wrap"><div className="product-section-heading"><p className="eyebrow">{categoryDisplay.title}</p><h2>{text.related}</h2></div><div className="product-related-grid">{relatedProducts.map((item) => { const related = getProductDetailContent(item, locale); return <article key={item.slug}><Image src={item.image} alt={related.title} width={640} height={480} sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 33vw" /><div><h3>{related.title}</h3><p>{related.summary}</p><Link href={localizedPath(locale, `products/${item.category}/${item.slug}`)}>{text.view}</Link></div></article>; })}</div></div></section> : null}

    <section id="cotizacion" className="product-quote-section"><div className="product-detail-wrap product-quote-layout"><div><p className="eyebrow">{text.quote}</p><h2>{content.title}</h2><p>{locale === "es-cl" || locale === "es" ? "Comparta los datos que conoce del proceso. El equipo técnico revisará la información antes de proponer una configuración." : "Share the process information available. The technical team will review it before proposing a configuration."}</p></div><ProductInquiryForm locale={locale} productName={content.title} model={content.series} /></div></section>
  </>;
}
