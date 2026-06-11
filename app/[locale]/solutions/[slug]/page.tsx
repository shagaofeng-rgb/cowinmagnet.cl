import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { products, solutions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export function generateStaticParams() {
  return solutions.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  return {
    title: solution ? solution.title : "Solution",
    description: solution?.summary
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Solutions", href: localizedPath(locale, "solutions") }, { label: solution.title }]} />
      <HeroBanner eyebrow="Solution" title={solution.title} summary={solution.summary} image={solution.image} />
      <section className="band"><div className="geo-grid"><article><h3>Problema del cliente</h3><p>Riesgo de hierro ferroso en la linea, dano a equipos, detenciones y costo operativo.</p></article><article><h3>Parametros de seleccion</h3><p>Ancho y velocidad de cinta, profundidad, altura, capacidad, ambiente y contaminante.</p></article><article><h3>CTA</h3><p>Enviar datos reales para seleccion. No se inventan parametros ni casos.</p></article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Recommended Products</p><h2>Productos recomendados</h2></div><div className="page-grid">{products.slice(0, 3).map((product) => <ContentCard key={product.slug} title={product.title} summary={product.summary} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} />)}</div></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}
