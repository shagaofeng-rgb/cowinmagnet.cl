import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { products, solutions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import { regionalSolutionContent } from "@/data/regionalContent";
import { productPresentation } from "@/data/productPresentation";

export function generateStaticParams() {
  return solutions.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  const display = solution ? localizedEntityCopy(locale, "solution", slug, solution.title, solution.summary) : null;
  return {
    title: display?.seoTitle || "Solution",
    description: display?.summary,
    alternates: localizedAlternates(locale, `solutions/${slug}`)
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  const display = localizedEntityCopy(locale, "solution", slug, solution.title, solution.summary);
  const content = regionalSolutionContent[slug];
  const recommended = content ? content.productSlugs.map((productSlug) => products.find((item) => item.slug === productSlug)).filter(Boolean) : products.slice(0, 3);
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "solutions") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={solution.image} />
      <section className="band"><div className="geo-grid"><article><h3>Problema operativo</h3><p>{content?.problem || "Riesgo de hierro ferroso en la linea, dano a equipos y detenciones."}</p></article><article><h3>Enfoque de solucion</h3><p>{content?.method || "La configuracion debe definirse con datos reales del proceso."}</p></article><article><h3>Datos de seleccion</h3>{content ? <ul>{content.selection.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Ancho y velocidad de cinta, capa, altura, capacidad, ambiente y contaminante.</p>}</article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Productos</p><h2>Equipos que pueden evaluarse</h2></div><div className="page-grid">{recommended.map((product) => product ? <ContentCard key={product.slug} title={productPresentation(product, locale).title} summary={productPresentation(product, locale).summary} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} /> : null)}</div></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}
