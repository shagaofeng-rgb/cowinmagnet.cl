import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import { QuoteForm } from "@/components/QuoteForm";
import { getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { productPresentation } from "@/data/productPresentation";
import { getProductTruthCard } from "@/data/productTruth";
import { Locale, localizedPath, siteConfig } from "@/data/site";
import { localizedProductSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

function detailText(locale: Locale) {
  if (locale === "pt-br") return {
    overview: "Visão do equipamento", structure: "Configuração e escopo", applications: "Aplicações", data: "Dados técnicos", dataText: "Informações publicadas somente quando confirmadas para esta série.", selection: "Para selecionar este equipamento", related: "Produtos relacionados", quote: "Solicite uma seleção técnica", quoteText: "Compartilhe o material, a capacidade e as condições do local. A equipe COWIN responde com a configuração aplicável ao seu processo.", speak: "Falar com um especialista", view: "Ver produto"
  };
  if (locale === "en") return {
    overview: "Equipment overview", structure: "Configuration and scope", applications: "Applications", data: "Technical data", dataText: "Information is published only when it is confirmed for this series.", selection: "To select this equipment", related: "Related products", quote: "Request technical selection", quoteText: "Share the material, capacity and site conditions. COWIN will respond with the configuration applicable to your process.", speak: "Talk to a specialist", view: "View product"
  };
  return {
    overview: "Visión del equipo", structure: "Configuración y alcance", applications: "Aplicaciones", data: "Datos técnicos", dataText: "La información se publica solo cuando está confirmada para esta serie.", selection: "Para seleccionar este equipo", related: "Productos relacionados", quote: "Solicite una selección técnica", quoteText: "Comparta el material, la capacidad y las condiciones del sitio. COWIN responderá con la configuración aplicable a su proceso.", speak: "Hablar con un especialista", view: "Ver producto"
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; category: string; productSlug: string }> }): Promise<Metadata> {
  const { locale, category, productSlug } = await params;
  const catalogProducts = await getPublishedCatalogProducts();
  const product = catalogProducts.find((item) => item.category === category && item.slug === productSlug);
  const presentation = product ? productPresentation(product, locale) : null;
  const title = product && presentation ? localizedProductSeo(locale, presentation.title) : "Product";
  const description = presentation?.summary;
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
    openGraph: product && presentation ? { title, description, type: "website", url: canonical, images: [{ url: product.image, width: 1200, height: 800, alt: presentation.title }] } : undefined,
    twitter: product && presentation ? { card: "summary_large_image", title, description, images: [product.image] } : undefined
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
  const truth = getProductTruthCard(product.slug);
  const presentation = productPresentation(product, locale);
  const categoryDisplay = productCategories.some((item) => item.slug === category.slug)
    ? getCategoryDisplay(category as (typeof productCategories)[number], locale)
    : { title: category.title, summary: category.summary };
  const relatedProducts = catalogProducts.filter((item) => item.category === categorySlug && item.slug !== product.slug).slice(0, 3);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: presentation.title,
    description: presentation.summary,
    image: product.image.startsWith("http") ? product.image : `https://cowinmagnet.cl${product.image}`,
    brand: { "@type": "Brand", name: "Cowinmagnet" },
    category: categoryDisplay.title,
    url: `https://cowinmagnet.cl/${locale}/products/${product.category}/${product.slug}`,
    additionalProperty: (truth?.verifiedSpecifications || []).map((item) => ({ "@type": "PropertyValue", name: item.label, value: item.value }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.products, item: `https://cowinmagnet.cl/${locale}/products` },
      { "@type": "ListItem", position: 2, name: categoryDisplay.title, item: `https://cowinmagnet.cl/${locale}/products/${category.slug}` },
      { "@type": "ListItem", position: 3, name: presentation.title }
    ]
  };

  return <>
    <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: categoryDisplay.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: presentation.title }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

    <section className="product-detail-hero">
      <div className="product-detail-wrap product-detail-top">
        <ProductMediaGallery images={product.imageGallery?.length ? product.imageGallery : [product.image]} alt={presentation.title} />
        <article className="product-detail-intro">
          <p className="eyebrow">{categoryDisplay.title}</p>
          <h1>{presentation.title}</h1>
          <p className="product-detail-lead">{presentation.summary}</p>
          <dl className="product-identity-list">
            {truth?.model ? <><dt>{locale === "pt-br" ? "Série" : locale === "en" ? "Series" : "Serie"}</dt><dd>{truth.model}</dd></> : null}
            <dt>{locale === "pt-br" ? "Atendimento" : locale === "en" ? "Coverage" : "Cobertura"}</dt><dd>{locale === "pt-br" ? "Chile e América Latina" : locale === "en" ? "Chile and Latin America" : "Chile y Latinoamérica"}</dd>
            <dt>{locale === "pt-br" ? "Seleção" : locale === "en" ? "Selection" : "Selección"}</dt><dd>{locale === "pt-br" ? "Validada por projeto" : locale === "en" ? "Validated by project" : "Validada por proyecto"}</dd>
          </dl>
          <div className="product-detail-actions">
            <Link className="button primary" href="#cotizacion">{copy.fullQuote}</Link>
            <a className="button light" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">{text.speak}</a>
          </div>
        </article>
      </div>
    </section>

    <nav className="product-section-nav" aria-label="Product page sections"><div className="product-detail-wrap"><a href="#configuracion">{text.structure}</a><a href="#aplicaciones">{text.applications}</a><a href="#datos">{text.data}</a><a href="#cotizacion">{copy.fullQuote}</a></div></nav>

    <section id="configuracion" className="product-section"><div className="product-detail-wrap product-two-column">
      <div><p className="eyebrow">{text.overview}</p><h2>{text.structure}</h2><p className="section-lead">{presentation.summary}</p></div>
      <div className="product-info-card"><ol>{presentation.structure.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></div>
    </div></section>

    <section id="aplicaciones" className="product-section product-section-muted"><div className="product-detail-wrap product-two-column">
      <div><p className="eyebrow">{categoryDisplay.title}</p><h2>{text.applications}</h2><p className="section-lead">{locale === "pt-br" ? "Aplicações a avaliar conforme o material e o objetivo de processo." : locale === "en" ? "Applications to evaluate against the material and process objective." : "Aplicaciones a evaluar según el material y el objetivo de proceso."}</p></div>
      <ul className="product-application-list">{presentation.applications.map((item) => <li key={item}>{item}</li>)}</ul>
    </div></section>

    <section id="datos" className="product-section"><div className="product-detail-wrap product-data-layout">
      <div><p className="eyebrow">{text.data}</p><h2>{truth ? text.data : text.selection}</h2><p className="section-lead">{text.dataText}</p></div>
      <dl className="product-data-list">{presentation.technicalRows.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      <p className="product-data-note">{presentation.selectionNote}</p>
    </div></section>

    {relatedProducts.length ? <section className="product-section product-section-muted"><div className="product-detail-wrap"><div className="product-section-heading"><p className="eyebrow">{categoryDisplay.title}</p><h2>{text.related}</h2></div><div className="product-related-grid">{relatedProducts.map((item) => { const related = productPresentation(item, locale); return <article key={item.slug}><img src={item.image} alt={related.title} /><div><h3>{related.title}</h3><p>{related.summary}</p><Link href={localizedPath(locale, `products/${item.category}/${item.slug}`)}>{text.view}</Link></div></article>; })}</div></div></section> : null}

    <section id="cotizacion" className="product-quote-section"><div className="product-detail-wrap product-quote-layout"><div><p className="eyebrow">{text.quote}</p><h2>{presentation.title}</h2><p>{text.quoteText}</p></div><QuoteForm locale={locale} /></div></section>
  </>;
}
