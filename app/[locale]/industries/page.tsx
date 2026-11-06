import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorCard, InteriorHero, InteriorLink, InteriorSection } from "@/components/Interior";
import { PaginationNav } from "@/components/PaginationNav";
import { briefIndustryCards } from "@/data/brief";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedListMetadata } from "@/lib/seo";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import type { Metadata } from "next";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  return {
    title: t(locale, "Soluciones por industria", "Solucoes por industria", "Solutions by industry"),
    description: t(locale, "Soluciones de separacion magnetica para mineria, reciclaje, cemento, carbon, alimentos y procesamiento industrial en Sudamerica.", "Solucoes de separacao magnetica para mineracao, reciclagem, cimento, carvao, alimentos e processamento industrial na America do Sul.", "Magnetic separation solutions for mining, recycling, cement, coal, food and industrial processing in South America."),
    ...localizedListMetadata(locale, "industries", query, briefIndustryCards.length, 9)
  };
}

export default async function IndustriesPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const query = await searchParams;
  const pagination = parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] });
  const { items, meta } = paginateList(briefIndustryCards, pagination);
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: t(locale, "Industrias", "Indústrias", "Industries") }]} />
    <InteriorHero title={t(locale, "Equipos por industria", "Equipamentos por indústria", "Equipment by industry")} summary={t(locale, "Identifique el punto de proceso y el equipo apropiado para su material.", "Identifique o ponto de processo e o equipamento adequado ao material.", "Identify the process point and the right equipment for your material.")}
      image="/assets/home-design/applications-strip.jpg" caption={t(locale, "Imagen de aplicación", "Imagem de aplicação", "Application illustration")} action={<InteriorLink variant="primary" href={localizedPath(locale, "industries/mineria-de-cobre")}>{t(locale, "Explorar minería de cobre", "Explorar mineração de cobre", "Explore copper mining")}</InteriorLink>} />
    <InteriorSection tinted><h2>{t(locale, "Sectores y procesos", "Setores e processos", "Sectors and processes")}</h2>
      <div className="grid">{items.map((card) => <InteriorCard key={card.slug + card.image} title={card.title[locale]} summary={card.summary[locale]} image={card.image} href={localizedPath(locale, "industries/" + card.slug)} label={t(locale, "Ver industria", "Ver indústria", "View industry")} />)}</div>
      <PaginationNav meta={meta} pathname={localizedPath(locale, "industries")} params={query} locale={locale} />
    </InteriorSection>
  </Interior>;
}
