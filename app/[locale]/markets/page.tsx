import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { focusMarkets, industryMarketRows } from "@/data/brief";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Markets" };

export default async function MarketsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Markets" }]} />
      <HeroBanner eyebrow="Markets" title="Mercados de Chile y Sudamerica" summary="Aplicaciones y paises prioritarios presentados en una vista simple para compras tecnicas." image="/assets/markets/chile-copper-ore.jpg" />
      <section className="band brief-page">
        <div className="brief-intro">
          <p className="eyebrow">Industry and market fit</p>
          <h2>Aplicacion, problema y equipo recomendado</h2>
          <p>La pagina combina mercado e industria para que el comprador encuentre rapido el equipo adecuado.</p>
        </div>
        <div className="brief-table-image">
          <Image src="/assets/brief/industry-market-table.png" alt="Industry market equipment table" width={850} height={402} />
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
            <p className="eyebrow">Focus countries</p>
            <h2>Paises prioritarios</h2>
            <p>Mantenemos pocos mercados visibles para que el sitio sea simple y enfocado.</p>
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
