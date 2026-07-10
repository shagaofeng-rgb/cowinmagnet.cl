import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { chileRegions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";

export function generateStaticParams() {
  return chileRegions.flatMap((region) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, country: "chile", region: region.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; country: string; region: string }> }) {
  const { locale, country, region: regionSlug } = await params;
  const region = chileRegions.find((item) => item.slug === regionSlug);
  const display = region ? localizedEntityCopy(locale, "region", regionSlug, region.title, region.summary) : null;
  return {
    title: display?.seoTitle || "Chile Region",
    description: display?.summary,
    alternates: localizedAlternates(locale, `markets/${country}/${regionSlug}`)
  };
}

export default async function ChileRegionPage({ params }: { params: Promise<{ locale: Locale; country: string; region: string }> }) {
  const { locale, country, region: regionSlug } = await params;
  const region = chileRegions.find((item) => item.slug === regionSlug && country === "chile");
  if (!region) notFound();
  const display = localizedEntityCopy(locale, "region", regionSlug, region.title, region.summary);
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "markets") }, { label: "Chile", href: localizedPath(locale, "markets/chile") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={region.image} />
      <section className="band"><div className="geo-grid"><article><h3>Minerales principales</h3><p>Confirmar mineral, granulometria, humedad y tonelaje del proyecto.</p></article><article><h3>Aplicaciones de cintas</h3><p>Proteccion de chancadores, correas transportadoras y puntos de transferencia.</p></article><article><h3>Confirmacion electrica</h3><p>Voltaje, frecuencia, fases, altitud y ambiente son obligatorios antes de seleccionar.</p></article></div></section>
    </>
  );
}
