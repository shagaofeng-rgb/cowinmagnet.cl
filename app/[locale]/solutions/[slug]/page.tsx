import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
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
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "solutions") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={solution.image} />
      <section className="band"><div className="geo-grid"><article><h3>{t(locale, "Problema operativo", "Problema operacional", "Operating problem")}</h3><p>{problem}</p></article><article><h3>{t(locale, "Enfoque de solucion", "Abordagem da solucao", "Solution approach")}</h3><p>{method}</p></article><article><h3>{t(locale, "Datos de seleccion", "Dados para selecao", "Selection data")}</h3><ul>{selection.map((item) => <li key={item}>{item}</li>)}</ul></article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">{t(locale, "Productos", "Produtos", "Products")}</p><h2>{t(locale, "Equipos que pueden evaluarse", "Equipamentos que podem ser avaliados", "Equipment to evaluate")}</h2></div><div className="page-grid">{recommended.map((product) => product ? <ContentCard key={product.slug} title={productPresentation(product, locale).title} summary={productPresentation(product, locale).summary} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} /> : null)}</div></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{t(locale, "Solicitar cotizacion", "Solicitar cotacao", "Request a quote")}</Link></section>
    </>
  );
}
