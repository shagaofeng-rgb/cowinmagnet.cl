import type { Metadata } from "next";
import { Locale } from "@/data/site";

export const htmlLanguageByLocale: Record<Locale, string> = {
  "es-cl": "es-CL",
  es: "es",
  "pt-br": "pt-BR",
  en: "en"
};

const entityTitles: Record<string, Partial<Record<Locale, string>>> = {
  "mineria-de-cobre": { "es-cl": "Mineria de cobre", es: "Mineria de cobre", "pt-br": "Mineracao de cobre", en: "Copper mining" },
  "mineria-de-hierro": { "es-cl": "Mineria de hierro", es: "Mineria de hierro", "pt-br": "Mineracao de ferro", en: "Iron ore mining" },
  reciclaje: { "es-cl": "Reciclaje", es: "Reciclaje", "pt-br": "Reciclagem", en: "Recycling" },
  "cantera-y-aridos": { "es-cl": "Canteras y aridos", es: "Canteras y aridos", "pt-br": "Pedreiras e agregados", en: "Quarries and aggregates" },
  cemento: { "es-cl": "Cemento", es: "Cemento", "pt-br": "Cimento", en: "Cement" },
  "sistemas-de-transporte": { "es-cl": "Sistemas de transporte", es: "Sistemas de transporte", "pt-br": "Sistemas transportadores", en: "Conveyor systems" },
  "puertos-y-terminales": { "es-cl": "Puertos y terminales", es: "Puertos y terminales", "pt-br": "Portos e terminais", en: "Ports and terminals" },
  "eliminacion-de-hierro-trampa": { "es-cl": "Eliminacion de hierro trampa", es: "Eliminacion de hierro trampa", "pt-br": "Remocao de ferro contaminante", en: "Tramp iron removal" },
  "proteccion-de-chancadores": { "es-cl": "Proteccion de chancadores", es: "Proteccion de chancadores", "pt-br": "Protecao de britadores", en: "Crusher protection" },
  "proteccion-de-cintas": { "es-cl": "Proteccion de cintas", es: "Proteccion de cintas", "pt-br": "Protecao de correias", en: "Conveyor belt protection" },
  "recuperacion-de-metales-ferrosos": { "es-cl": "Recuperacion de metales ferrosos", es: "Recuperacion de metales ferrosos", "pt-br": "Recuperacao de metais ferrosos", en: "Ferrous metal recovery" },
  "auto-limpieza": { "es-cl": "Separacion magnetica autolimpiante", es: "Separacion magnetica autolimpiante", "pt-br": "Separacao magnetica autolimpante", en: "Self-cleaning magnetic separation" },
  "aplicaciones-mineria-pesada": { "es-cl": "Aplicaciones de mineria pesada", es: "Aplicaciones de mineria pesada", "pt-br": "Aplicacoes de mineracao pesada", en: "Heavy mining applications" },
  "altas-altitudes": { "es-cl": "Equipos para altas altitudes", es: "Equipos para altas altitudes", "pt-br": "Equipamentos para grandes altitudes", en: "High-altitude equipment" },
  "ambientes-polvorientos": { "es-cl": "Equipos para ambientes polvorientos", es: "Equipos para ambientes polvorientos", "pt-br": "Equipamentos para ambientes com poeira", en: "Equipment for dusty environments" },
  brazil: { "es-cl": "Brasil", es: "Brasil", "pt-br": "Brasil", en: "Brazil" },
  peru: { "es-cl": "Peru", es: "Peru", "pt-br": "Peru", en: "Peru" }
};

const kindCopy = {
  industry: {
    "es-cl": ["Industria", "Equipos de separacion magnetica para operaciones en Chile y Sudamerica."],
    es: ["Industria", "Equipos de separacion magnetica para operaciones en America Latina."],
    "pt-br": ["Industria", "Equipamentos de separacao magnetica para operacoes na America Latina."],
    en: ["Industry", "Magnetic separation equipment for operations across Latin America."]
  },
  solution: {
    "es-cl": ["Solucion", "Soluciones magneticas para proteger equipos y recuperar metales en Chile y Sudamerica."],
    es: ["Solucion", "Soluciones magneticas para proteger equipos y recuperar metales en America Latina."],
    "pt-br": ["Solucao", "Solucoes magneticas para proteger equipamentos e recuperar metais na America Latina."],
    en: ["Solution", "Magnetic solutions for equipment protection and metal recovery in Latin America."]
  },
  market: {
    "es-cl": ["Mercado", "Equipos magneticos para mineria, reciclaje, cemento y manejo de materiales."],
    es: ["Mercado", "Equipos magneticos para mineria, reciclaje, cemento y manejo de materiales."],
    "pt-br": ["Mercado", "Equipamentos magneticos para mineracao, reciclagem, cimento e manuseio de materiais."],
    en: ["Market", "Magnetic equipment for mining, recycling, cement and material handling."]
  },
  region: {
    "es-cl": ["Region de Chile", "Separacion magnetica para mineria y manejo de materiales en esta region de Chile."],
    es: ["Region de Chile", "Separacion magnetica para mineria y manejo de materiales en esta region de Chile."],
    "pt-br": ["Regiao do Chile", "Separacao magnetica para mineracao e manuseio de materiais nesta regiao do Chile."],
    en: ["Chile region", "Magnetic separation for mining and material handling in this Chilean region."]
  }
} as const;

export function localizedEntityCopy(locale: Locale, kind: keyof typeof kindCopy, slug: string, fallbackTitle: string, fallbackSummary = "") {
  const localizedTitle = entityTitles[slug]?.[locale] || fallbackTitle;
  const [label, summary] = kindCopy[kind][locale];
  const marketSuffix = locale === "es-cl" ? "Chile" : locale === "pt-br" ? "America Latina" : locale === "en" ? "Latin America" : "LATAM";
  return {
    label,
    title: localizedTitle,
    seoTitle: `${localizedTitle} - ${label} ${marketSuffix}`,
    summary: `${summary}${fallbackSummary ? ` ${fallbackSummary}` : ""}`.slice(0, 220)
  };
}

export function localizedProductSeo(locale: Locale, title: string) {
  if (locale === "en") return `${title} magnetic separation equipment`;
  if (locale === "pt-br") return `${title} para separacao magnetica`;
  if (locale === "es-cl") return `${title} para separacion magnetica en Chile`;
  return `${title} para separacion magnetica en LATAM`;
}

const languageMap = {
  "es-CL": "es-cl",
  es: "es",
  "pt-BR": "pt-br",
  en: "en",
  "x-default": "es-cl"
} as const;

export function localizedAlternates(locale: Locale, path = ""): Metadata["alternates"] {
  const cleanPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return {
    canonical: `/${locale}${cleanPath}`,
    languages: Object.fromEntries(
      Object.entries(languageMap).map(([hreflang, targetLocale]) => [hreflang, `/${targetLocale}${cleanPath}`])
    )
  };
}
