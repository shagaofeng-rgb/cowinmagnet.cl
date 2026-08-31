import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroBanner } from "@/components/HeroBanner";
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
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: display.label, href: localizedPath(locale, "industries") }, { label: display.title }]} />
      <HeroBanner eyebrow={display.label} title={display.title} summary={display.summary} image={industry.image} />
      <section className="band"><div className="geo-grid"><article><h3>{t(locale, "Contexto del sector", "Contexto do setor", "Industry context")}</h3><p>{overview}</p></article><article><h3>{t(locale, "Problemas que se deben confirmar", "Pontos que devem ser confirmados", "Issues to confirm")}</h3><ul>{problems.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3>{t(locale, "Datos para seleccionar", "Dados para selecao", "Selection data")}</h3><ul>{selection.map((item) => <li key={item}>{item}</li>)}</ul></article></div></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">{t(locale, "Equipos", "Equipamentos", "Equipment")}</p><h2>{t(locale, "Equipos que pueden evaluarse", "Equipamentos que podem ser avaliados", "Equipment to evaluate")}</h2></div><div className="page-grid">{recommended.map((product) => product ? <ContentCard key={product.slug} title={productPresentation(product, locale).title} summary={productPresentation(product, locale).summary} image={product.image} href={localizedPath(locale, `products/${product.category}/${product.slug}`)} /> : null)}</div></section>
      <section className="band"><div className="section-heading"><p className="eyebrow">{t(locale, "Soluciones relacionadas", "Solucoes relacionadas", "Related solutions")}</p><h2>{t(locale, "Soluciones relacionadas", "Solucoes relacionadas", "Related solutions")}</h2></div><div className="page-grid">{solutions.slice(0, 3).map((solution) => { const solutionDisplay = localizedEntityCopy(locale, "solution", solution.slug, solution.title, solution.summary); return <ContentCard key={solution.slug} title={solutionDisplay.title} summary={solutionDisplay.summary} image={solution.image} href={localizedPath(locale, `solutions/${solution.slug}`)} />; })}</div></section>
      <section className="band muted"><FAQAccordion items={[[t(locale, "¿COWIN opera una oficina o inventario local?", "A COWIN opera um escritorio ou estoque local?", "Does COWIN operate a local office or inventory?"), t(locale, "No se declara oficina ni inventario local. COWIN presta soporte para proyectos en Chile y Latinoamerica desde su estructura de exportacion.", "Nao declaramos escritorio ou estoque local. A COWIN apoia projetos na America Latina por meio de sua estrutura de exportacao.", "No local office or inventory is claimed. COWIN supports Latin American projects through its export organization.")], [t(locale, "¿Que se necesita para cotizar?", "Quais dados sao necessarios para cotacao?", "What is needed for a quotation?"), t(locale, "Datos del material, proceso, capacidad, punto de instalacion y condiciones ambientales.", "Dados do material, processo, capacidade, ponto de instalacao e condicoes ambientais.", "Material, process, capacity, installation point and environmental conditions.")]]} /><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{t(locale, "Solicitar cotizacion", "Solicitar cotacao", "Request a quote")}</Link></section>
    </>
  );
}
