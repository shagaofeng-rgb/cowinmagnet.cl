import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { PaginationNav } from "@/components/PaginationNav";
import { solutions } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Soluciones de separacion magnetica", "Solucoes de separacao magnetica", "Magnetic separation solutions"),
    description: t(locale, "Soluciones por problema industrial: hierro trampa, proteccion de chancadores, proteccion de cintas, reciclaje y ambientes exigentes.", "Solucoes por problema industrial: ferro tramp, protecao de britadores, protecao de correias, reciclagem e ambientes exigentes.", "Solutions by industrial problem: tramp iron, crusher protection, belt protection, recycling and demanding environments."),
    alternates: localizedAlternates(locale, "solutions")
  };
}

export default async function SolutionsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const query = await searchParams;
  const pagination = parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] });
  const { items, meta } = paginateList(solutions, pagination);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Soluciones", "Solucoes", "Solutions") }]} />
      <HeroBanner
        eyebrow={t(locale, "Soluciones", "Solucoes", "Solutions")}
        title={t(locale, "Soluciones por problema industrial", "Solucoes por problema industrial", "Solutions by industrial problem")}
        summary={t(locale, "Eliminacion de hierro trampa, proteccion de chancadores, proteccion de cintas y ambientes exigentes.", "Remocao de ferro tramp, protecao de britadores, protecao de correias e ambientes exigentes.", "Tramp iron removal, crusher protection, belt protection and demanding environments.")}
      />
      <section className="band"><div className="page-grid">{items.map((item) => {
        const display = localizedEntityCopy(locale, "solution", item.slug, item.title, item.summary);
        return <ContentCard key={item.slug} title={display.title} summary={display.summary} image={item.image} href={localizedPath(locale, `solutions/${item.slug}`)} />;
      })}</div><PaginationNav meta={meta} pathname={`/${locale}/solutions`} params={query} locale={locale} /></section>
    </>
  );
}
