import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { focusMarkets, industryMarketRows } from "@/data/brief";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Industries and Markets" };

export default async function IndustriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Applications" }]} />
      <HeroBanner eyebrow="Applications" title="Aplicaciones, industrias y mercados" summary="Una guia simple para relacionar problema, industria, mercado y equipo recomendado." image="/assets/markets/markets-hero.jpg" />
      <section className="band brief-page">
        <div className="brief-intro">
          <p className="eyebrow">Industry table</p>
          <h2>Aplicaciones principales por industria</h2>
          <p>La tabla resume los problemas mas frecuentes y los equipos principales para revisar antes de solicitar cotizacion.</p>
        </div>
        <div className="brief-table-image">
          <Image src="/assets/brief/industry-market-table.png" alt="Industry application table" width={850} height={402} />
        </div>
        <div className="brief-table-wrap">
          <table className="brief-table">
            <thead>
              <tr>
                <th>Industria</th>
                <th>Problemas que resolvemos</th>
                <th>Equipos principales</th>
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
            <p className="eyebrow">Markets</p>
            <h2>Mercados principales en Sudamerica</h2>
            <p>Enfoque inicial para Chile y paises cercanos con demanda minera, aridos, reciclaje, cemento y manejo de graneles.</p>
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
