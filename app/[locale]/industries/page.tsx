import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { briefIndustryCards } from "@/data/brief";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Soluciones por industria", "Solucoes por industria", "Solutions by industry"),
    description: t(locale, "Soluciones de separacion magnetica para mineria, reciclaje, cemento, carbon, alimentos y procesamiento industrial en Sudamerica.", "Solucoes de separacao magnetica para mineracao, reciclagem, cimento, carvao, alimentos e processamento industrial na America do Sul.", "Magnetic separation solutions for mining, recycling, cement, coal, food and industrial processing in South America."),
    alternates: localizedAlternates(locale, "industries")
  };
}

export default async function IndustriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Industrias", "Industrias", "Industries") }]} />
      <HeroBanner
        eyebrow={t(locale, "Soluciones por industria", "Solucoes por industria", "Solutions by industry")}
        title={t(locale, "Seleccione su proceso, no una lista interminable", "Selecione seu processo, nao uma lista interminavel", "Select your process, not an endless list")}
        summary={t(locale, "Cada sector parte por sus contaminantes, material y punto de instalacion. Desde ahi conectamos la familia de equipo adecuada.", "Cada setor parte de seus contaminantes, material e ponto de instalacao. A partir dai conectamos a familia de equipamento adequada.", "Each sector starts with its contaminants, material and installation point. From there we connect the suitable equipment family.")}
        image="/assets/brief/south-africa/industries/mining-mineral-processing.png"
      />
      <section className="band brief-page">
        <div className="brief-intro">
          <p className="eyebrow">{t(locale, "Aplicaciones", "Aplicacoes", "Applications")}</p>
          <h2>{t(locale, "Necesidades industriales que atendemos en Sudamerica", "Necessidades industriais que atendemos na America do Sul", "Industrial needs we support in South America")}</h2>
          <p>{t(locale, "Use estas rutas para identificar el problema de planta. Las paginas de detalle conservan criterios de seleccion, equipos recomendados y enlaces de consulta.", "Use estas rotas para identificar o problema da planta. As paginas de detalhe mantem criterios de selecao, equipamentos recomendados e links de consulta.", "Use these paths to identify the plant problem. Detail pages retain selection criteria, recommended equipment and enquiry links.")}</p>
        </div>
        <div className="industry-card-grid">
          {briefIndustryCards.map((card) => (
            <Link className="industry-visual-card" href={localizedPath(locale, `industries/${card.slug}`)} key={`${card.slug}-${card.image}`}>
              <Image src={card.image} alt={card.title[locale]} width={720} height={500} />
              <div><h2>{card.title[locale]}</h2><p>{card.summary[locale]}</p><span>{t(locale, "Ver solucion", "Ver solucao", "View solution")}</span></div>
            </Link>
          ))}
        </div>
      </section>
      <section className="band muted selection-cta">
        <div><p className="eyebrow">{t(locale, "Soporte de aplicacion", "Suporte de aplicacao", "Application support")}</p><h2>{t(locale, "Indique el material y el punto donde necesita separar o proteger", "Informe o material e o ponto onde precisa separar ou proteger", "Tell us the material and the point where you need separation or protection")}</h2><p>{t(locale, "Con una descripcion breve, capacidad aproximada y pais podemos orientar la familia de equipo y los datos que vale la pena confirmar.", "Com uma breve descricao, capacidade aproximada e pais podemos orientar a familia de equipamento e os dados que vale a pena confirmar.", "With a short description, approximate capacity and country, we can point you to the equipment family and the details worth confirming.")}</p></div>
        <Link className="button primary" href={localizedPath(locale, "contact")}>{t(locale, "Contactar", "Entrar em contato", "Contact us")}</Link>
      </section>
    </>
  );
}
