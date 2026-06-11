import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { chileRegions, getProductSummary, markets, products } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export function generateStaticParams() {
  return markets.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, country: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const market = markets.find((item) => item.slug === country);
  return {
    title: market ? `Market ${market.title}` : "Market",
    description: market?.summary
  };
}

export default async function MarketCountryPage({ params }: { params: Promise<{ locale: Locale; country: string }> }) {
  const { locale, country } = await params;
  const market = markets.find((item) => item.slug === country);
  if (!market) notFound();
  const isChile = market.slug === "chile";
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Markets", href: localizedPath(locale, "markets") }, { label: market.title }]} />
      <HeroBanner eyebrow="Market" title={market.title} summary={market.summary} image={market.image} />
      <section className="band"><div className="geo-grid"><article><h3>Industrias locales</h3><p>Mineria, transportadores, cemento, agregados, reciclaje o graneles segun pais.</p></article><article><h3>Condiciones ambientales</h3><p>Confirmar polvo, altitud, temperatura, humedad, voltaje y frecuencia.</p></article><article><h3>Logistica y transporte</h3><p>Validar destino, puerto, embalaje y requisitos de exportacion.</p></article></div></section>
      {isChile ? <section className="band muted"><div className="section-heading"><p className="eyebrow">Chile Regions</p><h2>Regiones chilenas</h2></div><div className="page-grid">{chileRegions.map((region) => <ContentCard key={region.slug} title={region.title} summary={region.summary} image={market.image} href={localizedPath(locale, `markets/chile/${region.slug}`)} />)}</div></section> : null}
      <section className="band"><div className="section-heading"><p className="eyebrow">Recommended Products</p><h2>Productos recomendados</h2></div><div className="page-grid">{products.slice(0, 3).map((product) => <ContentCard key={product.slug} title={product.title} summary={getProductSummary(product, locale)} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} />)}</div></section>
    </>
  );
}
