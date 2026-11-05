import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorCard, InteriorHero, InteriorLink, InteriorRow, InteriorSection, mineIllustration, solutionIcon } from "@/components/Interior";
import { industries, products, solutions } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import { regionalIndustryContent } from "@/data/regionalContent";
import { productPresentation } from "@/data/productPresentation";

export function generateStaticParams() {
  return industries.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  const display = industry ? localizedEntityCopy(locale, "industry", slug, industry.title, industry.summary) : null;
  return {
    title: display?.seoTitle || "Industry",
    description: display?.summary,
    alternates: localizedAlternates(locale, `industries/${slug}`)
  };
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  const display = localizedEntityCopy(locale, "industry", slug, industry.title, industry.summary);
  const content = regionalIndustryContent[slug];
  const recommended = content ? content.productSlugs.map((productSlug) => products.find((item) => item.slug === productSlug)).filter(Boolean) : products.slice(0, 3);
  const useSpanishDetail = locale === "es-cl" || locale === "es";
  const overview = useSpanishDetail && content
    ? content.overview
    : t(locale,
      `El alcance tecnico para ${display.title} debe confirmarse con el material, el proceso y las condiciones reales del sitio.`,
      `O escopo tecnico para ${display.title} deve ser confirmado com o material, o processo e as condicoes reais da planta.`,
      `The technical scope for ${display.title} must be confirmed against the material, process and actual site conditions.`);
  const problems = useSpanishDetail && content ? content.problems : [
    t(locale, "Hierro trampa y contaminacion ferrosa", "Ferro tramp e contaminacao ferrosa", "Tramp iron and ferrous contamination"),
    t(locale, "Riesgo para chancadores, cintas y equipos aguas abajo", "Risco para britadores, correias e equipamentos a jusante", "Risk to crushers, conveyors and downstream equipment"),
    t(locale, "Variacion de material, carga y ambiente", "Variacao de material, carga e ambiente", "Variation in material, load and environment")
  ];
  const selection = useSpanishDetail && content ? content.selection : [
    t(locale, "Material, granulometria y humedad", "Material, granulometria e umidade", "Material, particle size and moisture"),
    t(locale, "Capacidad, ancho y velocidad de cinta", "Capacidade, largura e velocidade da correia", "Capacity, belt width and speed"),
    t(locale, "Altura de instalacion y contaminante objetivo", "Altura de instalacao e contaminante alvo", "Installation height and target contaminant"),
    t(locale, "Altitud, temperatura y ciclo de trabajo", "Altitude, temperatura e ciclo de trabalho", "Altitude, temperature and duty cycle")
  ];
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "industries") }, { label: display.title }]} />
    <InteriorHero title={slug === "mineria-de-cobre" ? t(locale, "Separación magnética en minería de cobre", "Separação magnética na mineração de cobre", "Magnetic separation in copper mining") : display.title} summary={display.summary}
      image={slug === "mineria-de-cobre" ? mineIllustration : industry.image} caption={slug === "mineria-de-cobre" ? t(locale, "Imagen ilustrativa", "Imagem ilustrativa", "Illustration") : undefined}
      action={<InteriorLink variant="primary" href={localizedPath(locale, slug === "mineria-de-cobre" ? "solutions/proteccion-de-chancadores" : "solutions")}>{slug === "mineria-de-cobre" ? t(locale, "Ver protección de chancadores", "Ver proteção de britadores", "See crusher protection") : t(locale, "Ver soluciones", "Ver soluções", "Explore solutions")}</InteriorLink>} />
    <InteriorSection tinted><div className="split"><div>
      <h2>{t(locale, "Puntos de proceso", "Pontos de processo", "Process points")}</h2><p>{overview}</p>
      <InteriorRow icon="shield-check" title={t(locale, "Riesgos", "Riscos", "Risks")} summary={problems.join(" · ")} />
      <InteriorRow icon="settings" title={t(locale, "Datos para seleccionar", "Dados para seleção", "Selection data")} summary={selection.join(" · ")} />
    </div><div><h2>{t(locale, "Equipos que puede evaluar", "Equipamentos que pode avaliar", "Equipment to evaluate")}</h2><div className="grid">{recommended.slice(0, 3).map((product) => product ? <InteriorCard key={product.slug} equipment image={product.image} title={productPresentation(product, locale).title} summary={productPresentation(product, locale).applications[0]} href={localizedPath(locale, "products/" + product.category + "/" + product.slug)} label={t(locale, "Ver ficha", "Ver ficha", "View product")} /> : null)}</div></div></div></InteriorSection>
    <InteriorSection><h2>{t(locale, "Soluciones relacionadas", "Soluções relacionadas", "Related solutions")}</h2>
      {solutions.slice(0, 3).map((item) => { const view = localizedEntityCopy(locale, "solution", item.slug, item.title, item.summary); return <InteriorRow key={item.slug} icon={solutionIcon(item.slug)} title={view.title} summary={view.summary} action={<InteriorLink href={localizedPath(locale, "solutions/" + item.slug)}>{t(locale, "Ver solución", "Ver solução", "View solution")}</InteriorLink>} />; })}
    </InteriorSection>
  </Interior>;
}
