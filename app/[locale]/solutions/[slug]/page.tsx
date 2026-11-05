import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorCard, InteriorHero, InteriorLink, InteriorRow, InteriorSection, mineIllustration, solutionIcon } from "@/components/Interior";
import { products, solutions } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import { regionalSolutionContent } from "@/data/regionalContent";
import { productPresentation } from "@/data/productPresentation";

export function generateStaticParams() {
  return solutions.flatMap((item) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  const display = solution ? localizedEntityCopy(locale, "solution", slug, solution.title, solution.summary) : null;
  return {
    title: display?.seoTitle || "Solution",
    description: display?.summary,
    alternates: localizedAlternates(locale, `solutions/${slug}`)
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  const display = localizedEntityCopy(locale, "solution", slug, solution.title, solution.summary);
  const content = regionalSolutionContent[slug];
  const recommended = content ? content.productSlugs.map((productSlug) => products.find((item) => item.slug === productSlug)).filter(Boolean) : products.slice(0, 3);
  const useSpanishDetail = locale === "es-cl" || locale === "es";
  const problem = useSpanishDetail && content
    ? content.problem
    : t(locale,
      "El hierro ferroso no controlado puede contaminar el producto, danar equipos o detener la linea.",
      "O ferro nao controlado pode contaminar o produto, danificar equipamentos ou interromper a linha.",
      "Uncontrolled ferrous metal can contaminate product, damage equipment or stop the line.");
  const method = useSpanishDetail && content
    ? content.method
    : t(locale,
      "La configuracion se define con datos reales del flujo, el punto de instalacion y el objetivo de separacion.",
      "A configuracao e definida com dados reais do fluxo, do ponto de instalacao e do objetivo de separacao.",
      "The configuration is defined from real flow data, the installation point and the separation objective.");
  const selection = useSpanishDetail && content ? content.selection : [
    t(locale, "Material y granulometria", "Material e granulometria", "Material and particle size"),
    t(locale, "Capacidad, ancho y velocidad", "Capacidade, largura e velocidade", "Capacity, width and speed"),
    t(locale, "Altura disponible y carga de hierro", "Altura disponivel e carga de ferro", "Available height and tramp-iron load"),
    t(locale, "Ambiente, limpieza y ciclo de trabajo", "Ambiente, limpeza e ciclo de trabalho", "Environment, cleaning and duty cycle")
  ];
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "solutions") }, { label: display.title }]} />
    <InteriorHero title={display.title} summary={display.summary} image={slug === "proteccion-de-chancadores" ? mineIllustration : solution.image}
      caption={slug === "proteccion-de-chancadores" ? t(locale, "Imagen ilustrativa", "Imagem ilustrativa", "Illustration") : undefined}
      action={<InteriorLink href={localizedPath(locale, "request-a-quote")} variant="primary">{t(locale, "Evaluar mi instalación", "Avaliar minha instalação", "Review my installation")}</InteriorLink>} />
    <InteriorSection tinted><div className="split"><div><h2>{t(locale, "Qué debe revisar", "O que revisar", "What to review")}</h2>
      <InteriorRow icon="alert-circle" title={t(locale, "Identificar el riesgo", "Identificar o risco", "Identify the risk")} summary={problem} />
      <InteriorRow icon={solutionIcon(slug)} title={t(locale, "Definir el punto de captura", "Definir o ponto de captura", "Choose the capture point")} summary={method} />
      <InteriorRow icon="settings" title={t(locale, "Datos para seleccionar", "Dados para seleção", "Selection data")} summary={selection.join(" · ")} />
    </div><div><h2>{t(locale, "Configuraciones a evaluar", "Configurações a avaliar", "Configurations to evaluate")}</h2><div className="grid">{recommended.slice(0, 3).map((product) => product ? <InteriorCard key={product.slug} equipment image={product.image} title={productPresentation(product, locale).title} summary={productPresentation(product, locale).applications[0]} href={localizedPath(locale, "products/" + product.category + "/" + product.slug)} label={t(locale, "Ver ficha", "Ver ficha", "View product")} /> : null)}</div></div></div></InteriorSection>
  </Interior>;
}
