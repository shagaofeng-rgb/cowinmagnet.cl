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
    title: t(locale, "Mercados de Chile y Sudamerica", "Mercados do Chile e America do Sul", "Chile and South America markets"),
    description: t(locale, "Mercados regionales para equipos de separacion magnetica en mineria, agregados, cemento y reciclaje.", "Mercados regionais para equipamentos de separacao magnetica em mineracao, agregados, cimento e reciclagem.", "Regional markets for magnetic separation equipment in mining, aggregates, cement and recycling."),
    alternates: localizedAlternates(locale, "markets")
  };
}

export default async function MarketsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Mercados", "Mercados", "Markets") }]} />
      <HeroBanner
        eyebrow={t(locale, "Mercados", "Mercados", "Markets")}
        title={t(locale, "Mercados de Chile y Sudamerica", "Mercados do Chile e America do Sul", "Chile and South America markets")}
        summary={t(locale, "Aplicaciones y paises prioritarios presentados en una vista simple para compras tecnicas.", "Aplicacoes e paises prioritarios apresentados em uma visao simples para compras tecnicas.", "Priority applications and countries presented in a simple view for technical buyers.")}
        image="/assets/markets/chile-copper-ore.jpg"
      />
      <section className="band brief-page">
        <div className="brief-intro">
          <p className="eyebrow">{t(locale, "Ajuste industria-mercado", "Ajuste industria-mercado", "Industry and market fit")}</p>
          <h2>{t(locale, "Aplicacion, problema y equipo recomendado", "Aplicacao, problema e equipamento recomendado", "Application, problem and recommended equipment")}</h2>
          <p>{t(locale, "La pagina combina mercado e industria para que el comprador encuentre rapido el equipo adecuado.", "A pagina combina mercado e industria para que o comprador encontre rapidamente o equipamento adequado.", "This page combines market and industry context so buyers can find the right equipment faster.")}</p>
        </div>
        <div className="brief-table-image">
          <Image src="/assets/brief/industry-market-table.png" alt="Industry market equipment table" width={850} height={402} />
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
            <p className="eyebrow">{t(locale, "Paises foco", "Paises foco", "Focus countries")}</p>
            <h2>{t(locale, "Paises prioritarios", "Paises prioritarios", "Priority countries")}</h2>
            <p>{t(locale, "Mantenemos pocos mercados visibles para que el sitio sea simple y enfocado.", "Mantemos poucos mercados visiveis para que o site seja simples e focado.", "We keep the visible market list focused so the site stays simple and useful.")}</p>
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
