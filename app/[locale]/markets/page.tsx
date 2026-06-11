import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { markets } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Markets" };

export default async function MarketsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Markets" }]} />
      <HeroBanner eyebrow="Markets" title="Mercados de Chile y Sudamerica" summary="Paginas por pais con industrias, minerales, condiciones ambientales, logistica y confirmacion electrica." image="/assets/markets/markets-hero.jpg" />
      <section className="band"><div className="page-grid">{markets.map((item) => <ContentCard key={item.slug} {...item} href={localizedPath(locale, `markets/${item.slug}`)} />)}</div></section>
    </>
  );
}
