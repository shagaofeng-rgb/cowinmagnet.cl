import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorCard, InteriorHero, InteriorLink, InteriorRow, InteriorSection } from "@/components/Interior";
import { getIndustryMarketRows } from "@/data/brief";
import { markets } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Mercados de Chile y Sudamerica", "Mercados do Chile e America do Sul", "Chile and South America markets"),
    description: t(locale, "Mercados regionales para equipos de separacion magnetica en mineria, agregados, cemento y reciclaje.", "Mercados regionais para equipamentos de separacao magnetica em mineracao, agregados, cimento e reciclagem.", "Regional markets for magnetic separation equipment in mining, aggregates, cement and recycling."),
    alternates: localizedAlternates(locale, "markets")
  };
}

export default async function MarketsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const others = markets.filter((item) => item.slug !== "chile");
  const view = (item: typeof markets[number]) => localizedEntityCopy(locale, "market", item.slug, item.title, item.summary);
  const viewMarket = t(locale, "Ver mercado", "Ver mercado", "View market");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: t(locale, "Mercados", "Mercados", "Markets") }]} />
    <InteriorHero title={t(locale, "Mercados de Sudamérica", "Mercados da América do Sul", "South American markets")} summary={t(locale, "Aplicaciones de separación magnética para minería, reciclaje e industria.", "Aplicações de separação magnética para mineração, reciclagem e indústria.", "Magnetic separation applications for mining, recycling and industry.")} image="/assets/home-design/south-america-map.jpg" fit
      action={<InteriorLink variant="primary" href={localizedPath(locale, "markets/chile")}>{t(locale, "Explorar Chile", "Explorar Chile", "Explore Chile")}</InteriorLink>} />
    <InteriorSection tinted>
      <h2>{t(locale, "Países y aplicaciones", "Países e aplicações", "Countries and applications")}</h2>
      <div className="grid">{others.slice(0, 3).map((item) => <InteriorCard key={item.slug} image={item.image} title={view(item).title} summary={view(item).summary} href={localizedPath(locale, "markets/" + item.slug)} label={viewMarket} equipment />)}</div>
      <div className="editorial-list">{others.slice(3, 8).map((item) => <InteriorRow key={item.slug} icon="world" title={view(item).title} summary={view(item).summary} action={<InteriorLink href={localizedPath(locale, "markets/" + item.slug)}>{viewMarket}</InteriorLink>} />)}</div>
    </InteriorSection>
    <InteriorSection><details className="form-extra"><summary>{t(locale, "Aplicaciones por industria", "Aplicações por indústria", "Applications by industry")}</summary>
      <table className="route-table"><thead><tr><th scope="col">{t(locale, "Industria", "Indústria", "Industry")}</th><th scope="col">{t(locale, "Problema", "Problema", "Challenge")}</th><th scope="col">{t(locale, "Equipos", "Equipamentos", "Equipment")}</th></tr></thead>
      <tbody>{getIndustryMarketRows(locale).map((row) => <tr key={row.industry}><th scope="row">{row.industry}</th><td>{row.problem}</td><td>{row.equipment}</td></tr>)}</tbody></table>
    </details></InteriorSection>
  </Interior>;
}
