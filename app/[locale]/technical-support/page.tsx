import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
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

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Soporte tecnico", "Suporte tecnico", "Technical Support") }]} />
      <HeroBanner
        eyebrow={t(locale, "Soporte tecnico", "Suporte tecnico", "Technical Support")}
        title={t(locale, "Guias de seleccion, instalacion y mantenimiento", "Guias de selecao, instalacao e manutencao", "Selection, installation and maintenance guides")}
        summary={t(locale, "Soporte tecnico para compradores B2B sin inventar parametros, certificaciones ni casos.", "Suporte tecnico para compradores B2B sem inventar parametros, certificacoes ou casos.", "Technical support for B2B buyers without inventing parameters, certifications or cases.")}
        image="/assets/products/cbs-drawer-type-magnetic-filter/cbs-drawer-type-magnetic-filter-01.jpg"
      />
      <section className="band"><div className="geo-grid"><article><h3>{t(locale, "Guia de seleccion", "Guia de selecao", "Selection guide")}</h3><p>{t(locale, "Material, tamano maximo, capacidad, cinta, altura, limpieza, altitud, temperatura y energia.", "Material, tamanho maximo, capacidade, correia, altura, limpeza, altitude, temperatura e energia.", "Material, maximum size, capacity, belt, height, cleaning, altitude, temperature and power.")}</p></article><article><h3>{t(locale, "Instalacion", "Instalacao", "Installation")}</h3><p>{t(locale, "Montaje transversal o en linea, acceso para limpieza, estructura y seguridad.", "Montagem transversal ou em linha, acesso para limpeza, estrutura e seguranca.", "Cross-belt or in-line mounting, cleaning access, structure and safety.")}</p></article><article><h3>{t(locale, "Mantenimiento", "Manutencao", "Maintenance")}</h3><p>{t(locale, "Revision, limpieza, repuestos, bandas, rodamientos y gabinete de control.", "Revisao, limpeza, pecas, correias, rolamentos e painel de controle.", "Inspection, cleaning, spare parts, belts, bearings and control cabinet.")}</p></article></div></section>
      <section className="band muted"><Link className="button primary" href={localizedPath(locale, "downloads")}>{t(locale, "Ver descargas", "Ver downloads", "View downloads")}</Link></section>
    </>
  );
}
