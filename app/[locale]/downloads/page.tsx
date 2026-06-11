import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { Locale } from "@/data/site";

export const metadata = {
  title: "Downloads",
  description: "Catalogos, hojas tecnicas y cuestionarios para seleccion de equipos magneticos Cowinmagnet LATAM."
};

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
      <Breadcrumbs locale={locale} items={[{ label: "Downloads" }]} />
      <HeroBanner eyebrow="Downloads" title="Catalogos, hojas tecnicas y cuestionarios" summary="Archivos locales disponibles para preparar una solicitud tecnica antes de cotizar." image="/assets/generated/product-magnetic-components.png" />
      <section className="band">
        <div className="page-grid">
          {downloads.map((item) => (
            <article className="content-card" key={item.href}>
              <div className="content-card-body">
                <h3>{item.title}</h3>
                <p>{item.note}</p>
                <a href={item.href} download>Descargar archivo</a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading">
          <p className="eyebrow">Aviso</p>
          <h2>Documentos locales de preparacion</h2>
          <p>Estos archivos sirven para recopilar datos. Catalogos, planos y hojas tecnicas definitivas deben sustituirse por documentos reales aprobados antes de produccion.</p>
        </div>
      </section>
    </>
  );
}
