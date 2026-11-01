import Link from "next/link";
import type { ProductPageProduct } from "@/components/ProductDetailBlocks";
import { Locale, localizedPath } from "@/data/site";

type LocalRoute = { industry: string; solution: string };

function localRoute(product: ProductPageProduct): LocalRoute {
  const value = `${product.slug} ${product.title} ${product.category}`.toLowerCase();
  if (/(eddy|stainless|recycl|metal-detector|magnetic-head-pulley|drum-magnet)/.test(value)) {
    return { industry: "reciclaje-y-recuperacion-de-metales", solution: "recuperacion-de-metales-ferrosos-y-no-ferrosos" };
  }
  if (/(wet|ctb|ctn|cts|high-gradient|dry-drum|ctdg|cgt|ctz|rct|hcg|dhj|dhd)/.test(value)) {
    return { industry: "mineria-de-litio-y-minerales-industriales", solution: "eliminacion-de-hierro-trampa" };
  }
  if (/(filter|drawer|hump|grid|rod|trap|pipe|rcyz|clc|cyg|cbz|cgb|cqz|cxj|rcya|rcyf|rcyg)/.test(value)) {
    return { industry: "manejo-de-materiales-a-granel-y-puertos", solution: "eliminacion-de-hierro-trampa" };
  }
  if (/(rcyd|rcye|rcyb|rcyp|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rcps|overband|suspended|electromagnetic)/.test(value)) {
    return { industry: "mineria-de-cobre", solution: "proteccion-de-chancadores" };
  }
  return { industry: "aridos-canteras-y-cemento", solution: "proteccion-de-cintas-transportadoras" };
}

function copyFor(locale: Locale) {
  if (locale === "en") return {
    eyebrow: "CHILE PROJECT CONTEXT",
    title: "Specify this equipment with local operating data",
    text: "For projects in Chile, selection starts with the real material stream, conveyor or process conditions, access for service and the installation environment. This page does not claim local stock or a performance result: the final configuration is confirmed from the project data.",
    points: ["Material, particle size and unwanted metal", "Belt or process flow, speed and available installation space", "Altitude, dust, humidity and maintenance access"],
    links: ["Chile market context", "Industry application", "Technical solution"]
  };
  if (locale === "pt-br") return {
    eyebrow: "CONTEXTO DE PROJETO NO CHILE",
    title: "Especifique este equipamento com dados reais de operação",
    text: "Para projetos no Chile, a seleção começa pelo fluxo real de material, pelas condições da correia ou do processo, pelo acesso de manutenção e pelo ambiente de instalação. Esta página não afirma estoque local nem resultado de desempenho: a configuração final é confirmada com os dados do projeto.",
    points: ["Material, granulometria e metal indesejado", "Fluxo da correia ou do processo, velocidade e espaço de instalação", "Altitude, poeira, umidade e acesso para manutenção"],
    links: ["Contexto do mercado chileno", "Aplicação por indústria", "Solução técnica"]
  };
  return {
    eyebrow: "CONTEXTO DE PROYECTO EN CHILE",
    title: "Especifique este equipo con datos reales de operación",
    text: "Para proyectos en Chile, la selección comienza con el flujo real de material, las condiciones de la cinta o del proceso, el acceso de mantenimiento y el ambiente de instalación. Esta página no afirma stock local ni un resultado de desempeño: la configuración final se confirma con los datos del proyecto.",
    points: ["Material, granulometría y metal no deseado", "Flujo de cinta o proceso, velocidad y espacio disponible", "Altitud, polvo, humedad y acceso de mantenimiento"],
    links: ["Contexto del mercado chileno", "Aplicación por industria", "Solución técnica"]
  };
}

export function ProductLocalMarketContext({ product, locale }: { product: ProductPageProduct; locale: Locale }) {
  const copy = copyFor(locale);
  const routes = localRoute(product);
  const links = [
    { href: localizedPath(locale, "markets/chile"), label: copy.links[0] },
    { href: localizedPath(locale, `industries/${routes.industry}`), label: copy.links[1] },
    { href: localizedPath(locale, `solutions/${routes.solution}`), label: copy.links[2] }
  ];

  return <section className="pd-section"><div className="pd-shell pd-two-column">
    <div><p className="pd-eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p className="pd-section-lead">{copy.text}</p></div>
    <div><ul className="pd-feature-list">{copy.points.map((point) => <li key={point}>{point}</li>)}</ul><nav aria-label={copy.eyebrow}>{links.map((link) => <Link className="pd-text-link" key={link.href} href={link.href}>{link.label}</Link>)}</nav></div>
  </div></section>;
}
