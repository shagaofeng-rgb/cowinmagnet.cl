export const locales = ["es-cl", "es", "pt-br", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es-cl";

export const siteConfig = {
  siteId: "cowinmagnet_latam",
  brand: "Cowinmagnet",
  company: "Quzhou Qiying Import & Export Co., Ltd.",
  companyCn: "衢州市企赢进出口有限公司",
  globalSite: "https://www.cowinmagnet.com",
  defaultCurrency: "USD",
  whatsapp: "8615665135205",
  email: "davidsha@cowinmagnet.com"
};

export const localeLabels: Record<Locale, string> = {
  "es-cl": "Espanol CL",
  es: "Espanol",
  "pt-br": "Portugues BR",
  en: "English"
};

export function t(locale: Locale, es: string, pt = es, en = es) {
  if (locale === "pt-br") return pt;
  if (locale === "en") return en;
  return es;
}

export function localizedPath(locale: Locale, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}
