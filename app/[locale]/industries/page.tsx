import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { focusMarkets, industryMarketRows } from "@/data/brief";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Aplicaciones e industrias", "Aplicacoes e industrias", "Applications and industries"),
    description: t(locale, "Aplicaciones industriales para separadores magneticos en mineria, cemento, agregados, reciclaje y manejo de graneles.", "Aplicacoes industriais para separadores magneticos em mineracao, cimento, agregados, reciclagem e manuseio de granels.", "Industrial applications for magnetic separators in mining, cement, aggregates, recycling and bulk handling."),
    alternates: localizedAlternates(locale, "industries")
  };
}

export default async function IndustriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Aplicaciones", "Aplicacoes", "Applications") }]} />
      <HeroBanner
        eyebrow={t(locale, "Aplicaciones", "Aplicacoes", "Applications")}
        title={t(locale, "Aplicaciones, industrias y mercados", "Aplicacoes, industrias e mercados", "Applications, industries and markets")}
        summary={t(locale, "Una guia simple para relacionar problema, industria, mercado y equipo recomendado.", "Um guia simples para relacionar problema, industria, mercado e equipamento recomendado.", "A simple guide connecting the site problem, industry, market and recommended equipment.")}
        image="/assets/markets/markets-hero.jpg"
      />
      <section className="band brief-page">
        <div className="brief-intro">
          <p className="eyebrow">{t(locale, "Tabla industrial", "Tabela industrial", "Industry table")}</p>
          <h2>{t(locale, "Aplicaciones principales por industria", "Aplicacoes principais por industria", "Main applications by industry")}</h2>
          <p>{t(locale, "La tabla resume los problemas mas frecuentes y los equipos principales para revisar antes de solicitar cotizacion.", "A tabela resume os problemas mais frequentes e os principais equipamentos para revisar antes da cotacao.", "The table summarizes common problems and primary equipment to review before requesting a quotation.")}</p>
        </div>
        <div className="brief-table-image">
          <Image src="/assets/brief/industry-market-table.png" alt="Industry application table" width={850} height={402} />
        </div>
        <div className="brief-table-wrap">
          <table className="brief-table">
            <thead>
              <tr>
                <th>{t(locale, "Industria", "Industria", "Industry")}</th>
                <th>{t(locale, "Problemas que resolvemos", "Problemas que resolvemos", "Problems solved")}</th>
                <th>{t(locale, "Equipos principales", "Equipamentos principais", "Main equipment")}</th>
              </tr>
            </thead>
            <tbody>
              {industryMarketRows.map((row) => (
                <tr key={row.industry}>
                  <th>{row.industry}</th>
                  <td>{row.problem}</td>
                  <td>{row.equipment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="brief-group">
          <div className="brief-group-head">
            <p className="eyebrow">{t(locale, "Mercados", "Mercados", "Markets")}</p>
            <h2>{t(locale, "Mercados principales en Sudamerica", "Mercados principais na America do Sul", "Main markets in South America")}</h2>
            <p>{t(locale, "Enfoque inicial para Chile y paises cercanos con demanda minera, aridos, reciclaje, cemento y manejo de graneles.", "Foco inicial no Chile e paises proximos com demanda em mineracao, agregados, reciclagem, cimento e manuseio de granels.", "Initial focus on Chile and nearby countries with demand in mining, aggregates, recycling, cement and bulk handling.")}</p>
          </div>
          <div className="brief-chip-list">
            {focusMarkets.map((market) => (
              <Link href={localizedPath(locale, `markets/${market.toLowerCase()}`)} key={market}>{market}</Link>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
