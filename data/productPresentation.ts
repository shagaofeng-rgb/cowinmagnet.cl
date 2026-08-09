import { getProductTruthCard } from "@/data/productTruth";
import type { Locale } from "@/data/site";

type ProductIdentity = { slug: string; title: string; category: string; sourceCategory: string };

type Presentation = {
  title: string;
  summary: string;
  structure: string[];
  applications: string[];
  technicalRows: { label: string; value: string }[];
  selectionNote: string;
};

const spanishCategory: Record<string, string> = {
  "suspended-self-unloading-iron-removers": "Separadores suspendidos y autolimpiantes",
  "magnetic-separation-equipment": "Equipos de separación magnética",
  "metal-detection-recycling-sorting": "Detección de metales y clasificación",
  "magnetic-components-filters": "Componentes y filtros magnéticos",
  "industry-application-equipment": "Equipos para aplicaciones industriales"
};

const portugueseCategory: Record<string, string> = {
  "suspended-self-unloading-iron-removers": "Separadores suspensos e autolimpantes",
  "magnetic-separation-equipment": "Equipamentos de separação magnética",
  "metal-detection-recycling-sorting": "Detecção de metais e triagem",
  "magnetic-components-filters": "Componentes e filtros magnéticos",
  "industry-application-equipment": "Equipamentos para aplicações industriais"
};

function modelFrom(product: ProductIdentity) {
  return product.title.match(/\b(?:[A-Z]{2,}[A-Z0-9-]*|CTN|CTB|CTS|RCY[A-Z]|RCD[A-Z])\b/)?.[0] || "";
}

function spanishTitle(product: ProductIdentity) {
  const truth = getProductTruthCard(product.slug);
  if (truth) return truth.esTitle;
  const name = product.title.toLowerCase();
  const model = modelFrom(product);
  const suffix = model ? ` ${model}` : "";
  if (name.includes("eddy current")) return `Separador por corrientes de Foucault${suffix}`;
  if (name.includes("metal detector")) return `Detector de metales${suffix}`;
  if (name.includes("lifting magnet")) return `Electroimán de elevación${suffix}`;
  if (name.includes("vibrating screen") || name.includes("high frequency screen")) return `Criba vibratoria${suffix}`;
  if (name.includes("drawer")) return `Filtro magnético de cajón${suffix}`;
  if (name.includes("grid")) return `Rejilla magnética${suffix}`;
  if (name.includes("bar") || name.includes("rod")) return `Barra magnética${suffix}`;
  if (name.includes("filter") || name.includes("trap")) return `Filtro magnético${suffix}`;
  if (name.includes("drum")) return `Separador magnético de tambor${name.includes("wet") ? " húmedo" : name.includes("dry") ? " seco" : ""}${suffix}`;
  if (name.includes("iron remover")) return `${name.includes("electromagnetic") ? "Separador electromagnético" : "Separador magnético permanente"}${name.includes("self") || name.includes("automatic") ? " autolimpiante" : name.includes("manual") ? " de limpieza manual" : ""}${suffix}`;
  if (name.includes("magnetic separator")) return `Separador magnético${suffix}`;
  return `${spanishCategory[product.category] || "Equipo magnético industrial"}${suffix}`;
}

function portugueseTitle(product: ProductIdentity) {
  const model = modelFrom(product);
  const suffix = model ? ` ${model}` : "";
  const name = product.title.toLowerCase();
  if (name.includes("eddy current")) return `Separador por correntes de Foucault${suffix}`;
  if (name.includes("metal detector")) return `Detector de metais${suffix}`;
  if (name.includes("drum")) return `Separador magnético de tambor${name.includes("wet") ? " úmido" : name.includes("dry") ? " seco" : ""}${suffix}`;
  if (name.includes("iron remover")) return `${name.includes("electromagnetic") ? "Separador eletromagnético" : "Separador magnético permanente"}${name.includes("self") || name.includes("automatic") ? " autolimpante" : name.includes("manual") ? " de limpeza manual" : ""}${suffix}`;
  return `${portugueseCategory[product.category] || "Equipamento magnético industrial"}${suffix}`;
}

function categoryApplications(category: string, locale: Locale) {
  const language = locale === "pt-br" ? "pt" : locale === "en" ? "en" : "es";
  const entries = {
    "suspended-self-unloading-iron-removers": {
      es: ["Protección de chancadores y molinos", "Correas y puntos de transferencia", "Minería, áridos y manejo de graneles"],
      pt: ["Proteção de britadores e moinhos", "Correias e pontos de transferência", "Mineração, agregados e granéis"],
      en: ["Crusher and mill protection", "Conveyors and transfer points", "Mining, aggregates and bulk handling"]
    },
    "magnetic-separation-equipment": {
      es: ["Procesamiento de minerales", "Separación de fracciones magnéticas", "Recuperación y purificación de materiales"],
      pt: ["Processamento de minerais", "Separação de frações magnéticas", "Recuperação e purificação de materiais"],
      en: ["Mineral processing", "Magnetic fraction separation", "Material recovery and purification"]
    },
    "metal-detection-recycling-sorting": {
      es: ["Reciclaje y clasificación de materiales", "Control de contaminación metálica", "Líneas de recuperación industrial"],
      pt: ["Reciclagem e triagem de materiais", "Controle de contaminação metálica", "Linhas de recuperação industrial"],
      en: ["Recycling and material sorting", "Metal contamination control", "Industrial recovery lines"]
    },
    "magnetic-components-filters": {
      es: ["Filtración de contaminantes ferrosos", "Chutes, tolvas y líneas de proceso", "Protección de calidad en materiales a granel"],
      pt: ["Filtragem de contaminantes ferrosos", "Calhas, moegas e linhas de processo", "Proteção da qualidade de materiais a granel"],
      en: ["Ferrous contaminant filtration", "Chutes, hoppers and process lines", "Bulk material quality protection"]
    },
    "industry-application-equipment": {
      es: ["Integración en procesos industriales", "Manejo de materiales y producción", "Configuraciones definidas por proyecto"],
      pt: ["Integração em processos industriais", "Manuseio de materiais e produção", "Configurações definidas por projeto"],
      en: ["Industrial process integration", "Material handling and production", "Project-defined configurations"]
    }
  } as const;
  return [...(entries[category as keyof typeof entries]?.[language] || entries["industry-application-equipment"][language])];
}

export function productPresentation(product: ProductIdentity, locale: Locale): Presentation {
  const truth = getProductTruthCard(product.slug);
  if (locale === "es-cl" || locale === "es") {
    const title = spanishTitle(product);
    return {
      title,
      summary: truth
        ? `${truth.equipmentType} para proyectos de Chile y Latinoamérica. La selección se confirma con el material, el punto de instalación y las condiciones reales de operación.`
        : `${title} para proyectos industriales en Chile y Latinoamérica. La configuración se revisa con el material, el caudal y las condiciones del sitio antes de cotizar.`,
      structure: truth?.installation || ["Equipo y configuración definidos según el punto de proceso", "Soporte y montaje revisados con el layout disponible", "Alcance técnico confirmado antes de la cotización"],
      applications: truth?.applications || categoryApplications(product.category, locale),
      technicalRows: truth?.verifiedSpecifications || [
        { label: "Identificación", value: modelFrom(product) ? `Modelo o serie ${modelFrom(product)}` : "Producto del catálogo principal COWIN" },
        { label: "Selección técnica", value: "Se confirma con material, capacidad y condiciones de montaje" },
        { label: "Ficha técnica", value: "Disponible por solicitud a ingeniería de COWIN" }
      ],
      selectionNote: truth?.limitations?.join(" ") || "No se publican valores de rendimiento, dimensiones ni intensidad sin confirmar el modelo y las condiciones del proyecto."
    };
  }

  const isPortuguese = locale === "pt-br";
  const title = isPortuguese ? portugueseTitle(product) : product.title;
  return {
    title,
    summary: isPortuguese
      ? `${title} para projetos industriais na América Latina. A configuração é validada com o material, a capacidade e as condições do local antes da cotação.`
      : `${title} for industrial projects in Latin America. Configuration is validated against material, capacity and site conditions before quotation.`,
    structure: isPortuguese
      ? ["Configuração definida para o ponto de processo", "Montagem revisada com o layout disponível", "Escopo técnico confirmado antes da cotação"]
      : ["Configuration defined for the process point", "Mounting reviewed against the available layout", "Technical scope confirmed before quotation"],
    applications: categoryApplications(product.category, locale),
    technicalRows: isPortuguese
      ? [{ label: "Identificação", value: modelFrom(product) ? `Modelo ou série ${modelFrom(product)}` : "Produto do catálogo principal COWIN" }, { label: "Seleção técnica", value: "Confirmada com material, capacidade e condições de montagem" }, { label: "Ficha técnica", value: "Disponível mediante solicitação à engenharia COWIN" }]
      : [{ label: "Identification", value: modelFrom(product) ? `Model or series ${modelFrom(product)}` : "COWIN main catalog product" }, { label: "Technical selection", value: "Confirmed from material, capacity and installation conditions" }, { label: "Datasheet", value: "Available on request from COWIN engineering" }],
    selectionNote: isPortuguese
      ? "Valores de desempenho, dimensões e intensidade não são publicados sem confirmar o modelo e as condições do projeto."
      : "Performance values, dimensions and magnetic intensity are not published until the model and project conditions are confirmed."
  };
}
