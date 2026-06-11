import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { Locale, uiText } from "@/data/site";

export const metadata = { title: "Request a Quote" };

export default async function RequestQuotePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = uiText[locale] ?? uiText["es-cl"];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.nav.quote }]} />
      <HeroBanner eyebrow={copy.quotePage.eyebrow} title={copy.quotePage.title} summary={copy.quotePage.summary} image="/assets/generated/product-electromagnetic-separator.png" />
      <section className="band"><QuoteForm locale={locale} /></section>
    </>
  );
}
