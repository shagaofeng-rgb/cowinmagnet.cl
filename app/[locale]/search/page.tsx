import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { Locale, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Buscar", "Buscar", "Search"),
    description: t(locale, "Busqueda de productos, industrias, soluciones, mercados y recursos tecnicos de Cowinmagnet LATAM.", "Busca de produtos, industrias, solucoes, mercados e recursos tecnicos da Cowinmagnet LATAM.", "Search Cowinmagnet LATAM products, industries, solutions, markets and technical resources."),
    alternates: localizedAlternates(locale, "search"),
    robots: { index: false, follow: true }
  };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Buscar", "Buscar", "Search") }]} />
      <HeroBanner
        eyebrow={t(locale, "Buscar", "Buscar", "Search")}
        title={t(locale, "Buscar en Cowinmagnet LATAM", "Buscar na Cowinmagnet LATAM", "Search Cowinmagnet LATAM")}
        summary={t(locale, "Busqueda para productos, industrias, soluciones, mercados y recursos tecnicos.", "Busca para produtos, industrias, solucoes, mercados e recursos tecnicos.", "Search products, industries, solutions, markets and technical resources.")}
      />
      <section className="band"><div className="section-heading"><h2>{t(locale, "Indice de busqueda", "Indice de busca", "Search index")}</h2><p>{t(locale, "La siguiente iteracion conecta esta pagina al indice unificado del CMS y catalogo regional.", "A proxima iteracao conecta esta pagina ao indice unificado do CMS e catalogo regional.", "The next iteration connects this page to the unified CMS and regional catalog index.")}</p></div></section>
    </>
  );
}
