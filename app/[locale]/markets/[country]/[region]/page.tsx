import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorCard, InteriorHero, InteriorLink, InteriorRow, InteriorSection } from "@/components/Interior";
import { chileRegions, products } from "@/data/catalog";
import { productPresentation } from "@/data/productPresentation";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";

export function generateStaticParams() {
  return chileRegions.flatMap((region) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, country: "chile", region: region.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; country: string; region: string }> }) {
  const { locale, country, region: regionSlug } = await params;
  const region = chileRegions.find((item) => item.slug === regionSlug);
  const display = region ? localizedEntityCopy(locale, "region", regionSlug, region.title, region.summary) : null;
  return {
    title: display?.seoTitle || "Chile Region",
    description: display?.summary,
    alternates: localizedAlternates(locale, `markets/${country}/${regionSlug}`)
  };
}

export default async function ChileRegionPage({ params }: { params: Promise<{ locale: Locale; country: string; region: string }> }) {
  const { locale, country, region: regionSlug } = await params;
  const region = chileRegions.find((item) => item.slug === regionSlug && country === "chile");
  if (!region) notFound();
  const display = localizedEntityCopy(locale, "region", regionSlug, region.title, region.summary);
  const title = t(locale, "Separación magnética en ", "Separação magnética em ", "Magnetic separation in ") + display.title;
  const equipment = regionSlug === "santiago" ? products.filter((item) => item.category === "metal-detection-recycling-sorting").slice(0, 3) : products.slice(0, 3);
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "markets") }, { label: "Chile", href: localizedPath(locale, "markets/chile") }, { label: display.title }]} />
    <InteriorHero title={title} summary={display.summary} image={region.image} action={<InteriorLink variant="primary" href={localizedPath(locale, "request-a-quote")}>{t(locale, "Consultar por un proyecto", "Consultar sobre um projeto", "Discuss a project")}</InteriorLink>} />
    <InteriorSection tinted><div className="split"><div><h2>{t(locale, "Condiciones a revisar", "Condições a revisar", "Conditions to review")}</h2>
      <InteriorRow icon="pick" title={t(locale, "Material y granulometría", "Material e granulometria", "Material and particle size")} summary={t(locale, "Indique tipo de mineral, humedad y tonelaje.", "Informe o tipo de minério, umidade e tonelagem.", "Provide the mineral type, moisture and tonnage.")} />
      <InteriorRow icon="route" title={t(locale, "Cinta y altura", "Correia e altura", "Conveyor and height")} summary={t(locale, "Incluya el perfil de carga, la velocidad y la altura de montaje.", "Inclua o perfil de carga, velocidade e altura de montagem.", "Include the load profile, speed and mounting height.")} />
      <InteriorRow icon="tool" title={t(locale, "Mantenimiento", "Manutenção", "Maintenance")} summary={t(locale, "Revise el acceso, la descarga y las condiciones eléctricas.", "Revise o acesso, a descarga e as condições elétricas.", "Review access, discharge and electrical conditions.")} />
    </div><div><h2>{t(locale, "Equipos relacionados", "Equipamentos relacionados", "Related equipment")}</h2><div className="grid">{equipment.map((item) => { const product = productPresentation(item, locale); return <InteriorCard key={item.slug} equipment title={product.title} summary={product.applications[0]} image={item.image} href={localizedPath(locale, "products/" + item.category + "/" + item.slug)} label={t(locale, "Ver ficha", "Ver ficha", "View product")} />; })}</div></div></div></InteriorSection>
  </Interior>;
}
