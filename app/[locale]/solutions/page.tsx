import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { solutions } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Solutions" };

export default async function SolutionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Solutions" }]} />
      <HeroBanner eyebrow="Solutions" title="Soluciones por problema industrial" summary="Eliminacion de hierro trampa, proteccion de chancadores, proteccion de cintas y ambientes exigentes." />
      <section className="band"><div className="page-grid">{solutions.map((item) => <ContentCard key={item.slug} {...item} href={localizedPath(locale, `solutions/${item.slug}`)} />)}</div></section>
    </>
  );
}
