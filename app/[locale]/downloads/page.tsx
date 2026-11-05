import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorLink, InteriorSection, Intro, InteriorRow, type PageQuery } from "@/components/Interior";
import { InteriorIcon } from "@/components/InteriorIcon";
import { technicalResources } from "@/data/technicalResources";
import { PaginationNav } from "@/components/PaginationNav";
import { Locale, localizedPath, t } from "@/data/site";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Descargas tecnicas", "Downloads tecnicos", "Technical downloads"),
    description: t(locale, "Catalogos, hojas tecnicas y cuestionarios para seleccion de equipos magneticos Cowinmagnet LATAM.", "Catalogos, folhas tecnicas e questionarios para selecao de equipamentos magneticos Cowinmagnet LATAM.", "Catalogs, technical sheets and questionnaires for Cowinmagnet LATAM magnetic equipment selection."),
    alternates: localizedAlternates(locale, "downloads")
  };
}

export default async function DownloadsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const { items, meta } = paginateList(technicalResources(locale), parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] }));
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: t(locale, "Descargas", "Downloads", "Downloads") }]} />
    <Intro title={t(locale, "Documentos técnicos", "Documentos técnicos", "Technical documents")} summary={t(locale, "Descargue los archivos disponibles para preparar los datos del proyecto.", "Baixe os arquivos disponíveis para preparar os dados do projeto.", "Download the available files to prepare your project details.")} />
    <InteriorSection>
      <div className="panel doc-list">{items.map((item) => <InteriorRow key={item.href} icon="file-text" title={item.title} summary={item.summary}
        action={<a className="btn alt" href={item.href} download aria-label={t(locale, "Descargar ", "Baixar ", "Download ") + item.title}>{item.format} <InteriorIcon name="file-download" /></a>} />)}</div>
      <PaginationNav meta={meta} pathname={localizedPath(locale, "downloads")} params={query} locale={locale} />
      <div className="notice">{t(locale, "Para obtener una ficha de un modelo concreto, envíe las condiciones de instalación.", "Para receber a ficha de um modelo específico, envie as condições de instalação.", "For a specific model datasheet, send us the installation conditions.")} <InteriorLink href={localizedPath(locale, "request-a-quote")}>{t(locale, "Solicitar ficha", "Solicitar ficha", "Request a datasheet")}</InteriorLink></div>
    </InteriorSection>
  </Interior>;
}
