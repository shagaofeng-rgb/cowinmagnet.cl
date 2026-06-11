import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { Locale } from "@/data/site";

export const metadata = { title: "Search" };

export default async function SearchPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Search" }]} />
      <HeroBanner eyebrow="Search" title="Buscar en Cowinmagnet LATAM" summary="Busqueda para productos, industrias, soluciones, mercados y recursos tecnicos." />
      <section className="band"><div className="section-heading"><h2>Indice de busqueda</h2><p>La siguiente iteracion conecta esta pagina al indice unificado del CMS y catalogo regional.</p></div></section>
    </>
  );
}
