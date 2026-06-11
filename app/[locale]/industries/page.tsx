import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { industries } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Industries" };

export default async function IndustriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Industries" }]} />
      <HeroBanner eyebrow="Industries" title="Industrias para separacion magnetica en Sudamerica" summary="Paginas independientes para mineria, reciclaje, cemento, aridos, transportadores y puertos." />
      <section className="band"><div className="page-grid">{industries.map((item) => <ContentCard key={item.slug} {...item} href={localizedPath(locale, `industries/${item.slug}`)} />)}</div></section>
    </>
  );
}
