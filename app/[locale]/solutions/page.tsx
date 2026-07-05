import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { solutions } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Soluciones de separacion magnetica", "Solucoes de separacao magnetica", "Magnetic separation solutions"),
    description: t(locale, "Soluciones por problema industrial: hierro trampa, proteccion de chancadores, proteccion de cintas, reciclaje y ambientes exigentes.", "Solucoes por problema industrial: ferro tramp, protecao de britadores, protecao de correias, reciclagem e ambientes exigentes.", "Solutions by industrial problem: tramp iron, crusher protection, belt protection, recycling and demanding environments."),
    alternates: localizedAlternates(locale, "solutions")
  };
}

export default async function SolutionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Soluciones", "Solucoes", "Solutions") }]} />
      <HeroBanner
        eyebrow={t(locale, "Soluciones", "Solucoes", "Solutions")}
        title={t(locale, "Soluciones por problema industrial", "Solucoes por problema industrial", "Solutions by industrial problem")}
        summary={t(locale, "Eliminacion de hierro trampa, proteccion de chancadores, proteccion de cintas y ambientes exigentes.", "Remocao de ferro tramp, protecao de britadores, protecao de correias e ambientes exigentes.", "Tramp iron removal, crusher protection, belt protection and demanding environments.")}
      />
      <section className="band"><div className="page-grid">{solutions.map((item) => <ContentCard key={item.slug} {...item} href={localizedPath(locale, `solutions/${item.slug}`)} />)}</div></section>
    </>
  );
}
