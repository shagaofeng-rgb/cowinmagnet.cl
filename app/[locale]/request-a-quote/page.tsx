import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { Locale } from "@/data/site";

export const metadata = { title: "Request a Quote" };

export default async function RequestQuotePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Request a Quote" }]} />
      <HeroBanner eyebrow="Request a Quote" title="Solicitud de cotizacion tecnica" summary="Formulario con validacion para recopilar producto, industria, material, cinta, altura, energia y condiciones de operacion." image="/assets/generated/product-electromagnetic-separator.png" />
      <section className="band"><QuoteForm /></section>
    </>
  );
}
