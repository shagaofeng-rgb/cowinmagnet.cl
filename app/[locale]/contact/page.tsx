import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { Locale, siteConfig } from "@/data/site";

export const metadata = { title: "Contact" };

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Contact" }]} />
      <HeroBanner eyebrow="Contact" title="Contacto Cowinmagnet LATAM" summary="Envie datos de proyecto por formulario, email o WhatsApp." image="/assets/generated/product-electromagnetic-separator.png" />
      <section className="band"><div className="geo-grid"><article><h3>Email</h3><p>{siteConfig.email}</p></article><article><h3>WhatsApp</h3><p>+86 156 6513 5205</p></article><article><h3>Company</h3><p>{siteConfig.company}</p></article></div></section>
      <section className="band muted"><QuoteForm /></section>
    </>
  );
}
