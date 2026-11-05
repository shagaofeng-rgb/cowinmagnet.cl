import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorLink, InteriorSection, Intro, InteriorRow } from "@/components/Interior";
import { ContactMap } from "@/components/ContactMap";
import { InteriorIcon } from "@/components/InteriorIcon";
import { Locale, localizedPath, siteConfig, t } from "@/data/site";
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
  const title = t(locale, "Contacto", "Contato", "Contact");
  const quote = localizedPath(locale, "request-a-quote");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: title }]} />
    <Intro title={title} summary={t(locale, "Hable con Cowinmagnet sobre equipos, selección o cotizaciones.", "Fale com a Cowinmagnet sobre equipamentos, seleção ou cotações.", "Talk to Cowinmagnet about equipment, selection or quotations.")} />
    <InteriorSection><div className="split equal">
      <section><h2>{t(locale, "Canales de contacto", "Canais de contato", "Contact options")}</h2>
        <InteriorRow icon="mail" title={t(locale, "Correo electrónico", "E-mail", "Email")} summary={siteConfig.email} action={<a className="quiet" href={"mailto:" + siteConfig.email}>{t(locale, "Enviar correo", "Enviar e-mail", "Send email")} <InteriorIcon name="arrow-right" /></a>} />
        <InteriorRow icon="brand-whatsapp" title="WhatsApp" summary="+86 156 6513 5205" action={<a className="quiet" href={"https://wa.me/" + siteConfig.whatsapp} target="_blank" rel="noopener noreferrer nofollow">{t(locale, "Abrir WhatsApp", "Abrir WhatsApp", "Open WhatsApp")} <InteriorIcon name="arrow-right" /></a>} />
        <InteriorRow icon="file-text" title={t(locale, "Consulta de proyecto", "Consulta de projeto", "Project enquiry")} summary={t(locale, "Envíe el material, la capacidad y sus datos de contacto.", "Envie o material, a capacidade e seus dados de contato.", "Send material, capacity and your contact details.")} action={<InteriorLink href={quote}>{t(locale, "Abrir formulario", "Abrir formulário", "Open form")}</InteriorLink>} />
      </section><ContactMap locale={locale} />
    </div></InteriorSection>
  </Interior>;
}
