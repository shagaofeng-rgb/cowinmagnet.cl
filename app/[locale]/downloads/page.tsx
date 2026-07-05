import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { Locale, t } from "@/data/site";
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

const downloads = [
  {
    title: "Cuestionario de seleccion para cinta transportadora",
    href: "/downloads/selection-questionnaire.txt",
    note: "Datos de material, cinta, capacidad, altura, contaminante, ambiente y energia."
  },
  {
    title: "Checklist de instalacion y mantenimiento",
    href: "/downloads/installation-maintenance-checklist.txt",
    note: "Puntos de revision antes de instalacion, puesta en marcha y mantenimiento."
  },
  {
    title: "Campos tecnicos para cotizacion",
    href: "/downloads/quotation-data-fields.csv",
    note: "CSV con los campos requeridos por el formulario tecnico."
  }
];

export default async function DownloadsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Descargas", "Downloads", "Downloads") }]} />
      <HeroBanner
        eyebrow={t(locale, "Descargas", "Downloads", "Downloads")}
        title={t(locale, "Catalogos, hojas tecnicas y cuestionarios", "Catalogos, folhas tecnicas e questionarios", "Catalogs, technical sheets and questionnaires")}
        summary={t(locale, "Archivos locales disponibles para preparar una solicitud tecnica antes de cotizar.", "Arquivos locais disponiveis para preparar uma solicitacao tecnica antes da cotacao.", "Local files available to prepare a technical request before quotation.")}
        image="/assets/products/cbs-drawer-type-magnetic-filter/cbs-drawer-type-magnetic-filter-01.jpg"
      />
      <section className="band">
        <div className="page-grid">
          {downloads.map((item) => (
            <article className="content-card" key={item.href}>
              <div className="content-card-body">
                <h3>{item.title}</h3>
                <p>{item.note}</p>
                <a href={item.href} download>{t(locale, "Descargar archivo", "Baixar arquivo", "Download file")}</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading">
          <p className="eyebrow">{t(locale, "Aviso", "Aviso", "Notice")}</p>
          <h2>{t(locale, "Documentos locales de preparacion", "Documentos locais de preparacao", "Local preparation documents")}</h2>
          <p>{t(locale, "Estos archivos sirven para recopilar datos. Catalogos, planos y hojas tecnicas definitivas deben sustituirse por documentos reales aprobados antes de produccion.", "Estes arquivos servem para coletar dados. Catalogos, desenhos e folhas tecnicas definitivas devem ser substituidos por documentos reais aprovados antes da producao.", "These files help collect project data. Final catalogs, drawings and technical sheets should be replaced by approved documents before production.")}</p>
        </div>
      </section>
    </>
  );
}
