import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Technical Support" };

export default async function TechnicalSupportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Technical Support" }]} />
      <HeroBanner eyebrow="Technical Support" title="Guias de seleccion, instalacion y mantenimiento" summary="Soporte tecnico para compradores B2B sin inventar parametros, certificaciones ni casos." image="/assets/generated/product-magnetic-components.png" />
      <section className="band"><div className="geo-grid"><article><h3>Guia de seleccion</h3><p>Material, tamano maximo, capacidad, cinta, altura, limpieza, altitud, temperatura y energia.</p></article><article><h3>Instalacion</h3><p>Montaje transversal o en linea, acceso para limpieza, estructura y seguridad.</p></article><article><h3>Mantenimiento</h3><p>Revision, limpieza, repuestos, bandas, rodamientos y gabinete de control.</p></article></div></section>
      <section className="band muted"><Link className="button primary" href={localizedPath(locale, "downloads")}>Ver descargas</Link></section>
    </>
  );
}
