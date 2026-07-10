import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Locale, locales } from "@/data/site";
import { htmlLanguageByLocale } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { other: { "content-language": htmlLanguageByLocale[locale] || "es-CL" } };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <div lang={htmlLanguageByLocale[locale] || "es-CL"}>
      <Header locale={locale} />
      <main className="route-main">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
