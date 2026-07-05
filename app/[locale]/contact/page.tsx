import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { Locale, siteConfig, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Contacto", "Contato", "Contact"),
    description: t(locale, "Contacte a Cowinmagnet LATAM para soporte tecnico, cotizacion y seleccion de separadores magneticos.", "Contate a Cowinmagnet LATAM para suporte tecnico, cotacao e selecao de separadores magneticos.", "Contact Cowinmagnet LATAM for technical support, quotation and magnetic separator selection."),
    alternates: localizedAlternates(locale, "contact")
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Contacto", "Contato", "Contact") }]} />
      <HeroBanner
        eyebrow={t(locale, "Contacto", "Contato", "Contact")}
        title={t(locale, "Contacto Cowinmagnet LATAM", "Contato Cowinmagnet LATAM", "Contact Cowinmagnet LATAM")}
        summary={t(locale, "Envie datos de proyecto por formulario, email o WhatsApp.", "Envie dados do projeto por formulario, email ou WhatsApp.", "Send project data by form, email or WhatsApp.")}
        image="/assets/products/rcde-type-oil-cooled-electromagnetic-iron-remover/rcde-type-oil-cooled-electromagnetic-iron-remover-01.jpg"
      />
      <section className="band"><div className="geo-grid"><article><h3>Email</h3><p>{siteConfig.email}</p></article><article><h3>WhatsApp</h3><p>+86 156 6513 5205</p></article><article><h3>{t(locale, "Empresa", "Empresa", "Company")}</h3><p>{siteConfig.company}</p></article></div></section>
      <section className="band muted"><QuoteForm locale={locale} /></section>
    </>
  );
}
