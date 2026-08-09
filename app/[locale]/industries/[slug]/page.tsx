import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { industries, products, solutions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import { regionalIndustryContent } from "@/data/regionalContent";
import { productPresentation } from "@/data/productPresentation";

export function generateStaticParams() {
  return industries.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  const display = industry ? localizedEntityCopy(locale, "industry", slug, industry.title, industry.summary) : null;
  return {
    title: display?.seoTitle || "Industry",
    description: display?.summary,
    alternates: localizedAlternates(locale, `industries/${slug}`)
  };
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  const display = localizedEntityCopy(locale, "industry", slug, industry.title, industry.summary);
  const content = regionalIndustryContent[slug];
  const recommended = content ? content.productSlugs.map((productSlug) => products.find((item) => item.slug === productSlug)).filter(Boolean) : products.slice(0, 3);
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "industries") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={industry.image} />
      <section className="band"><div className="geo-grid"><article><h3>Contexto del sector</h3><p>{content?.overview || industry.summary}</p></article><article><h3>Problemas que se deben confirmar</h3>{content ? <ul>{content.problems.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Hierro trampa, dano en chancadores, desgaste de cinta y contaminacion ferrosa.</p>}</article><article><h3>Datos para seleccionar</h3>{content ? <ul>{content.selection.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Material, capacidad, ancho de cinta, velocidad, altura y ambiente.</p>}</article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Equipos</p><h2>Equipos que pueden evaluarse</h2></div><div className="page-grid">{recommended.map((product) => product ? <ContentCard key={product.slug} title={productPresentation(product, locale).title} summary={productPresentation(product, locale).summary} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} /> : null)}</div></section>
      <section className="band"><div className="section-heading"><p className="eyebrow">Related Solutions</p><h2>Soluciones relacionadas</h2></div><div className="page-grid">{solutions.slice(0, 3).map((solution) => <ContentCard key={solution.slug} {...solution} href={localizedPath(locale, `solutions/${solution.slug}`)} />)}</div></section>
      <section className="band muted"><FAQAccordion items={[["¿COWIN opera una oficina o inventario local?", "No se declara oficina ni inventario local. COWIN presta soporte para proyectos en Chile y Latinoamerica desde su estructura de exportacion."], ["¿Que se necesita para cotizar?", "Datos del material, proceso, capacidad, punto de instalacion y condiciones ambientales."]]} /><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}
