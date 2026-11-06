import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorCard, InteriorHero, InteriorLink, InteriorRow, InteriorSection } from "@/components/Interior";
import { PaginationNav } from "@/components/PaginationNav";
import { chileRegions, markets, products } from "@/data/catalog";
import { productPresentation } from "@/data/productPresentation";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedListMetadata, localizedEntityCopy } from "@/lib/seo";
import { paginateList, parseListPagination } from "@/lib/listPagination";

export function generateStaticParams() {
  return markets.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, country: item.slug })));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: Locale; country: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ locale, country }, query] = await Promise.all([params, searchParams]);
  const market = markets.find((item) => item.slug === country);
  const display = market ? localizedEntityCopy(locale, "market", country, market.title, market.summary) : null;
  return {
    title: display?.seoTitle || "Market",
    description: display?.summary,
    ...localizedListMetadata(locale, "markets/" + country, query, country === "chile" ? chileRegions.length : 0, 6)
  };
}

export default async function MarketCountryPage({ params, searchParams }: { params: Promise<{ locale: Locale; country: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, country } = await params;
  const query = await searchParams;
  const market = markets.find((item) => item.slug === country);
  if (!market) notFound();
  const isChile = market.slug === "chile";
  const display = localizedEntityCopy(locale, "market", country, market.title, market.summary);
  const regionPagination = parseListPagination(query, { defaultPageSize: 6, allowedPageSizes: [6] });
  const { items: visibleRegions, meta: regionMeta } = paginateList(chileRegions, regionPagination);
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "markets") }, { label: display.title }]} />
    <InteriorHero title={isChile ? t(locale, "Equipos magnéticos para Chile", "Equipamentos magnéticos para o Chile", "Magnetic equipment for Chile") : display.title} summary={display.summary} image={isChile ? "/assets/markets/markets-hero.jpg" : market.image}
      action={<InteriorLink variant="primary" href={localizedPath(locale, "request-a-quote")}>{t(locale, "Consultar por un proyecto", "Consultar sobre um projeto", "Discuss a project")}</InteriorLink>} />
    {isChile ? <InteriorSection tinted><h2>{t(locale, "Regiones de Chile", "Regiões do Chile", "Regions of Chile")}</h2>
      <div className="grid">{visibleRegions.map((region) => { const item = localizedEntityCopy(locale, "region", region.slug, region.title, region.summary); return <InteriorCard key={region.slug} title={item.title} summary={item.summary} image={region.image} href={localizedPath(locale, "markets/chile/" + region.slug)} label={t(locale, "Ver región", "Ver região", "View region")} />; })}</div>
      <PaginationNav meta={regionMeta} pathname={localizedPath(locale, "markets/" + country)} params={query} locale={locale} />
    </InteriorSection> : null}
    <InteriorSection><div className="split"><div><h2>{t(locale, "Datos para el proyecto", "Dados para o projeto", "Project details")}</h2>
      <InteriorRow icon="settings" title={t(locale, "Condiciones ambientales", "Condições ambientais", "Environmental conditions")} summary={t(locale, "Confirme polvo, altitud, temperatura, humedad, voltaje y frecuencia.", "Confirme poeira, altitude, temperatura, umidade, tensão e frequência.", "Confirm dust, altitude, temperature, humidity, voltage and frequency.")} />
      <InteriorRow icon="truck" title={t(locale, "Logística y transporte", "Logística e transporte", "Logistics and transport")} summary={t(locale, "Valide destino, puerto, embalaje y requisitos de exportación.", "Valide destino, porto, embalagem e requisitos de exportação.", "Confirm destination, port, packaging and export requirements.")} />
    </div><div><h2>{t(locale, "Equipos que puede evaluar", "Equipamentos que pode avaliar", "Equipment to evaluate")}</h2><div className="grid">{products.slice(0, 3).map((product) => {
      const item = productPresentation(product, locale);
      return <InteriorCard key={product.slug} title={item.title} summary={item.applications[0]} image={product.image} href={localizedPath(locale, "products/" + product.category + "/" + product.slug)} label={t(locale, "Ver ficha", "Ver ficha", "View product")} equipment />;
    })}</div></div></div></InteriorSection>
  </Interior>;
}
