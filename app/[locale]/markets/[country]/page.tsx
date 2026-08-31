import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { chileRegions, getProductSummary, markets, products } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";

export function generateStaticParams() {
  return markets.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, country: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; country: string }> }) {
  const { locale, country } = await params;
  const market = markets.find((item) => item.slug === country);
  const display = market ? localizedEntityCopy(locale, "market", country, market.title, market.summary) : null;
  return {
    title: display?.seoTitle || "Market",
    description: display?.summary,
    alternates: localizedAlternates(locale, `markets/${country}`)
  };
}

export default async function MarketCountryPage({ params }: { params: Promise<{ locale: Locale; country: string }> }) {
  const { locale, country } = await params;
  const market = markets.find((item) => item.slug === country);
  if (!market) notFound();
  const isChile = market.slug === "chile";
  const display = localizedEntityCopy(locale, "market", country, market.title, market.summary);
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "markets") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={market.image} />
      <section className="band"><div className="geo-grid">
        <article><h3>{t(locale, "Industrias locales", "Industrias locais", "Local industries")}</h3><p>{t(locale, "Mineria, transportadores, cemento, agregados, reciclaje o graneles segun pais.", "Mineracao, transportadores, cimento, agregados, reciclagem ou granéis conforme o pais.", "Mining, conveyors, cement, aggregates, recycling or bulk handling according to the country.")}</p></article>
        <article><h3>{t(locale, "Condiciones ambientales", "Condicoes ambientais", "Environmental conditions")}</h3><p>{t(locale, "Confirmar polvo, altitud, temperatura, humedad, voltaje y frecuencia.", "Confirmar poeira, altitude, temperatura, umidade, tensao e frequencia.", "Confirm dust, altitude, temperature, humidity, voltage and frequency.")}</p></article>
        <article><h3>{t(locale, "Logistica y transporte", "Logistica e transporte", "Logistics and transport")}</h3><p>{t(locale, "Validar destino, puerto, embalaje y requisitos de exportacion.", "Validar destino, porto, embalagem e requisitos de exportacao.", "Validate destination, port, packaging and export requirements.")}</p></article>
      </div></section>
      {isChile ? <section className="band muted"><div className="section-heading"><p className="eyebrow">{t(locale, "Regiones de Chile", "Regioes do Chile", "Chile regions")}</p><h2>{t(locale, "Regiones chilenas", "Regioes chilenas", "Chilean regions")}</h2></div><div className="page-grid">{chileRegions.map((region) => { const regionDisplay = localizedEntityCopy(locale, "region", region.slug, region.title, region.summary); return <ContentCard key={region.slug} title={regionDisplay.title} summary={regionDisplay.summary} image={region.image} href={localizedPath(locale, `markets/chile/${region.slug}`)} />; })}</div></section> : null}
      <section className="band"><div className="section-heading"><p className="eyebrow">{t(locale, "Productos recomendados", "Produtos recomendados", "Recommended products")}</p><h2>{t(locale, "Equipos que pueden evaluarse", "Equipamentos que podem ser avaliados", "Equipment to evaluate")}</h2></div><div className="page-grid">{products.slice(0, 3).map((product) => <ContentCard key={product.slug} title={product.title} summary={getProductSummary(product, locale)} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} />)}</div></section>
    </>
  );
}
