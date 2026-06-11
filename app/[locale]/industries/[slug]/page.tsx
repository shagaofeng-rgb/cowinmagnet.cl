import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { industries, products, solutions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export function generateStaticParams() {
  return industries.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  return {
    title: industry ? industry.title : "Industry",
    description: industry?.summary
  };
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Industries", href: localizedPath(locale, "industries") }, { label: industry.title }]} />
      <HeroBanner eyebrow="Industry" title={industry.title} summary={industry.summary} image={industry.image} />
      <section className="band"><div className="geo-grid"><article><h3>Resumen del sector</h3><p>{industry.summary}</p></article><article><h3>Problemas comunes</h3><p>Hierro trampa, dano en chancadores, desgaste de cinta y contaminacion ferrosa.</p></article><article><h3>Factores de seleccion</h3><p>Material, capacidad, ancho de cinta, velocidad, altura y ambiente.</p></article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Recommended Equipment</p><h2>Equipos recomendados</h2></div><div className="page-grid">{products.slice(0, 3).map((product) => <ContentCard key={product.slug} title={product.title} summary={product.summary} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} />)}</div></section>
      <section className="band"><div className="section-heading"><p className="eyebrow">Related Solutions</p><h2>Soluciones relacionadas</h2></div><div className="page-grid">{solutions.slice(0, 3).map((solution) => <ContentCard key={solution.slug} {...solution} href={localizedPath(locale, `solutions/${solution.slug}`)} />)}</div></section>
      <section className="band muted"><FAQAccordion items={[["Se declaran proyectos locales?", "No. Esta pagina evita casos o clientes no verificados."], ["Que se necesita para cotizar?", "Datos de cinta, material, capacidad, altura, contaminante y condiciones ambientales."]]} /><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}
