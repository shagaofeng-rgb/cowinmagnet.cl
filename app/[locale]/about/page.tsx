import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { Locale, siteConfig } from "@/data/site";

export const metadata = { title: "About Us" };

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "About Us" }]} />
      <HeroBanner eyebrow="About" title="Cowinmagnet LATAM" summary="Magnetic separation equipment solution provider and export partner for South America mining and industrial projects." />
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Company</p><h2>{siteConfig.company}</h2><p>Cowinmagnet coordina seleccion tecnica, OEM/ODM, recursos de suministro, inspeccion de calidad, logistica y comunicacion posventa.</p></div><div className="notice"><strong>Precision:</strong> no se declara fabrica propia, factory direct, local warehouse, local Chilean factory ni fabricacion propia de todos los productos.</div></section>
    </>
  );
}
