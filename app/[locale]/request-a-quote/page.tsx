import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { Locale, uiText } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = uiText[locale] ?? uiText["es-cl"];
  return {
    title: copy.quotePage.title,
    description: copy.quotePage.summary,
    alternates: localizedAlternates(locale, "request-a-quote")
  };
}

export default async function RequestQuotePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = uiText[locale] ?? uiText["es-cl"];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.nav.quote }]} />
      <HeroBanner eyebrow={copy.quotePage.eyebrow} title={copy.quotePage.title} summary={copy.quotePage.summary} image="/assets/products/rcde-type-oil-cooled-electromagnetic-iron-remover/rcde-type-oil-cooled-electromagnetic-iron-remover-01.jpg" />
      <section className="band"><QuoteForm locale={locale} /></section>
    </>
  );
}
