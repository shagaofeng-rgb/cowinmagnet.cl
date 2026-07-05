import type { Metadata } from "next";
import { Locale } from "@/data/site";

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
