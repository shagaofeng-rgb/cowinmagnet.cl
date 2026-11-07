import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorLink, InteriorSection, Intro, queryValue, type PageQuery } from "@/components/Interior";
import { getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { getProductDetailContent } from "@/data/productDetailContent";
import { productPresentation } from "@/data/productPresentation";
import { QuoteForm } from "@/components/QuoteForm";
import { Locale, localizedPath, t, uiText } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import { canonicalQuoteModel } from "@/lib/productUrlAliases";
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

export default async function RequestQuotePage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const copy = uiText[locale].quotePage;
  const requested = canonicalQuoteModel(queryValue(query, "model"));
  const products = requested ? await getPublishedCatalogProducts() : [];
  const exact = products.find((item) => item.slug === requested);
  const product = exact ?? (requested ? products.find((item) => getProductDetailContent(item, locale).series === requested.toUpperCase()) : undefined);
  const model = product ? getProductDetailContent(product, locale).series || "" : "";
  const initialProduct = product ? model || productPresentation(product, locale).title : "";
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: copy.eyebrow }]} />
    <Intro title={t(locale, "Solicitar cotización", "Solicitar cotação", "Request a quote")} summary={t(locale, "Comparta los datos iniciales de su proyecto para recibir una revisión técnica.", "Compartilhe os dados iniciais do projeto para uma avaliação técnica.", "Share your project details for a technical review.")} />
    <InteriorSection><div className="split">
      <aside className="panel quote-help"><h3>{t(locale, "Qué conviene preparar", "O que preparar", "What to prepare")}</h3><ul>
        <li>{t(locale, "Material o industria", "Material ou indústria", "Material or industry")}</li>
        <li>{t(locale, "Punto de instalación", "Ponto de instalação", "Installation point")}</li>
        <li>{t(locale, "Capacidad, ancho de cinta y altura, si los conoce", "Capacidade, largura da correia e altura, se disponíveis", "Capacity, belt width and height, if known")}</li>
      </ul><InteriorLink href={localizedPath(locale, "downloads")}>{t(locale, "Descargar cuestionario", "Baixar questionário", "Download questionnaire")}</InteriorLink></aside>
      <QuoteForm key={initialProduct} locale={locale} initialProduct={initialProduct} model={model} />
    </div></InteriorSection>
  </Interior>;
}
