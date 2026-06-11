import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Locale, locales } from "@/data/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main className="route-main">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
