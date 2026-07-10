import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { getProductSummary, products, solutions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";

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
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "solutions") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={solution.image} />
      <section className="band"><div className="geo-grid"><article><h3>Problema del cliente</h3><p>Riesgo de hierro ferroso en la linea, dano a equipos, detenciones y costo operativo.</p></article><article><h3>Parametros de seleccion</h3><p>Ancho y velocidad de cinta, profundidad, altura, capacidad, ambiente y contaminante.</p></article><article><h3>CTA</h3><p>Enviar datos reales para seleccion. No se inventan parametros ni casos.</p></article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Recommended Products</p><h2>Productos recomendados</h2></div><div className="page-grid">{products.slice(0, 3).map((product) => <ContentCard key={product.slug} title={product.title} summary={getProductSummary(product, locale)} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} />)}</div></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}
