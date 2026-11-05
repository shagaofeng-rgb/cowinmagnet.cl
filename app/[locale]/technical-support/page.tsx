import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorLink, InteriorSection, Intro, InteriorRow } from "@/components/Interior";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Soporte tecnico", "Suporte tecnico", "Technical Support"),
    description: t(locale, "Guias de seleccion, instalacion y mantenimiento para equipos de separacion magnetica.", "Guias de selecao, instalacao e manutencao para equipamentos de separacao magnetica.", "Selection, installation and maintenance guides for magnetic separation equipment."),
    alternates: localizedAlternates(locale, "technical-support")
  };
}

export default async function TechnicalSupportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const title = t(locale, "Soporte técnico", "Suporte técnico", "Technical support");
  const downloads = localizedPath(locale, "downloads");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: title }]} />
    <Intro title={title} summary={t(locale, "Prepare los datos necesarios para elegir, instalar y revisar su equipo.", "Prepare os dados para escolher, instalar e revisar seu equipamento.", "Prepare the data needed to select, install and maintain your equipment.")} />
    <InteriorSection><div className="split catalog-overview"><div>
      <h2>{t(locale, "Guías de trabajo", "Guias de trabalho", "Technical guides")}</h2>
      <InteriorRow icon="magnet" title={t(locale, "Selección", "Seleção", "Selection")} summary={t(locale, "Material, granulometría, capacidad, cinta y altura de montaje.", "Material, granulometria, capacidade, correia e altura de montagem.", "Material, particle size, capacity, belt and mounting height.")} action={<InteriorLink href={localizedPath(locale, "products")}>{t(locale, "Ver equipos", "Ver equipamentos", "Browse equipment")}</InteriorLink>} />
      <InteriorRow icon="tool" title={t(locale, "Instalación", "Instalação", "Installation")} summary={t(locale, "Ubicación, soporte mecánico y trayectoria de descarga.", "Localização, suporte mecânico e trajetória de descarga.", "Location, mechanical support and discharge path.")} action={<InteriorLink href={downloads}>{t(locale, "Ver checklist", "Ver checklist", "View checklist")}</InteriorLink>} />
      <InteriorRow icon="settings" title={t(locale, "Mantenimiento", "Manutenção", "Maintenance")} summary={t(locale, "Inspección, limpieza, bandas, rodamientos y acceso seguro.", "Inspeção, limpeza, correias, rolamentos e acesso seguro.", "Inspection, cleaning, belts, bearings and safe access.")} action={<InteriorLink href={downloads}>{t(locale, "Ver documentos", "Ver documentos", "View documents")}</InteriorLink>} />
    </div><aside className="panel"><h3>{t(locale, "¿Necesita revisar una aplicación?", "Precisa revisar uma aplicação?", "Need to review an application?")}</h3><p>{t(locale, "Envíe el material, la capacidad y el punto de instalación.", "Envie o material, a capacidade e o ponto de instalação.", "Send your material, capacity and installation point.")}</p><InteriorLink href={localizedPath(locale, "request-a-quote")}>{t(locale, "Enviar datos del proyecto", "Enviar dados do projeto", "Send project details")}</InteriorLink></aside></div></InteriorSection>
  </Interior>;
}
