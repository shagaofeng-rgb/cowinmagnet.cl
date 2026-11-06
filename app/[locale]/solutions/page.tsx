import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorLink, InteriorRow, InteriorSection, Intro, solutionIcon } from "@/components/Interior";
import { PaginationNav } from "@/components/PaginationNav";
import { solutions } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedListMetadata, localizedEntityCopy } from "@/lib/seo";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import type { Metadata } from "next";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  return {
    title: t(locale, "Soluciones de separacion magnetica", "Solucoes de separacao magnetica", "Magnetic separation solutions"),
    description: t(locale, "Soluciones por problema industrial: hierro trampa, proteccion de chancadores, proteccion de cintas, reciclaje y ambientes exigentes.", "Solucoes por problema industrial: ferro tramp, protecao de britadores, protecao de correias, reciclagem e ambientes exigentes.", "Solutions by industrial problem: tramp iron, crusher protection, belt protection, recycling and demanding environments."),
    ...localizedListMetadata(locale, "solutions", query, solutions.length, 9)
  };
}

export default async function SolutionsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const query = await searchParams;
  const pagination = parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] });
  const { items, meta } = paginateList(solutions, pagination);

  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: t(locale, "Soluciones", "Soluções", "Solutions") }]} />
    <Intro title={t(locale, "Soluciones por problema de proceso", "Soluções por problema de processo", "Solutions by process challenge")} summary={t(locale, "Encuentre un enfoque según el riesgo o el objetivo de su planta.", "Encontre uma abordagem conforme o risco ou objetivo da planta.", "Find an approach for your plant risk or process objective.")} />
    <InteriorSection><div className="sidebar-layout">
      <aside className="panel"><h3>{t(locale, "¿Cómo empezar?", "Como começar?", "Where to start")}</h3><p>{t(locale, "Defina el punto de proceso, el material y el metal objetivo.", "Defina o ponto de processo, o material e o metal alvo.", "Define the process point, material and target metal.")}</p><InteriorLink href={localizedPath(locale, "technical-support")}>{t(locale, "Ver guía técnica", "Ver guia técnico", "View technical guide")}</InteriorLink></aside>
      <div>{items.map((item) => {
        const display = localizedEntityCopy(locale, "solution", item.slug, item.title, item.summary);
        return <InteriorRow key={item.slug} icon={solutionIcon(item.slug)} title={display.title} summary={display.summary} action={<InteriorLink href={localizedPath(locale, "solutions/" + item.slug)}>{t(locale, "Ver solución", "Ver solução", "View solution")}</InteriorLink>} />;
      })}<PaginationNav meta={meta} pathname={localizedPath(locale, "solutions")} params={query} locale={locale} /></div>
    </div></InteriorSection>
  </Interior>;
}
