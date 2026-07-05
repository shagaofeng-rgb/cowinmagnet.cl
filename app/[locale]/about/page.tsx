import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { companySections } from "@/data/brief";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Nosotros", "Sobre", "About Us"),
    description: t(locale, "Cowinmagnet Chile y LATAM entrega soporte de exportacion y seleccion tecnica para equipos de separacion magnetica.", "Cowinmagnet Chile e LATAM fornece suporte de exportacao e selecao tecnica para equipamentos de separacao magnetica.", "Cowinmagnet Chile and LATAM provides export support and technical selection for magnetic separation equipment."),
    alternates: localizedAlternates(locale, "about")
  };
}

function localizedCompanySections(locale: Locale) {
  if (locale === "en") return companySections;
  if (locale === "pt-br") {
    return [
      {
        title: "Sobre a Cowin Magnetic",
        paragraphs: [
          "A Cowin Magnetic fornece equipamentos de separacao magnetica e solucoes de recuperacao de metais para mineracao, reciclagem, agregados, cimento e manuseio de granels.",
          "A equipe LATAM ajuda compradores tecnicos a revisar material, correia, capacidade, contaminante e condicoes de operacao antes da cotacao."
        ]
      },
      {
        title: "Por que escolher a Cowin",
        bullets: [
          "Recomendacoes baseadas na aplicacao real e nos dados do projeto.",
          "Produtos para remocao de ferro tramp, recuperacao de metais e protecao de equipamentos.",
          "Suporte de exportacao, comunicacao tecnica e documentacao para compras B2B.",
          "Configuracoes ajustaveis conforme material, dimensoes e ambiente de instalacao."
        ]
      },
      {
        title: "Compromisso",
        paragraphs: [
          "A cooperacao comeca com dados tecnicos claros.",
          "Nosso objetivo e ajudar o cliente a reduzir paradas, proteger equipamentos e melhorar a eficiencia do processo."
        ]
      }
    ];
  }
  return [
    {
      title: "Sobre Cowin Magnetic",
      paragraphs: [
        "Cowin Magnetic suministra equipos de separacion magnetica y soluciones de recuperacion de metales para mineria, reciclaje, agregados, cemento y manejo de graneles.",
        "El equipo LATAM ayuda a compradores tecnicos a revisar material, cinta, capacidad, contaminante y condiciones de operacion antes de cotizar."
      ]
    },
    {
      title: "Por que elegir Cowin",
      bullets: [
        "Recomendaciones basadas en la aplicacion real y los datos del proyecto.",
        "Productos para retiro de hierro trampa, recuperacion de metales y proteccion de equipos.",
        "Soporte de exportacion, comunicacion tecnica y documentacion para compras B2B.",
        "Configuraciones ajustables segun material, dimensiones y ambiente de instalacion."
      ]
    },
    {
      title: "Compromiso",
      paragraphs: [
        "La cooperacion empieza con datos tecnicos claros.",
        "Nuestro objetivo es ayudar al cliente a reducir paradas, proteger equipos y mejorar la eficiencia del proceso."
      ]
    }
  ];
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const sections = localizedCompanySections(locale);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Nosotros", "Sobre", "About Us") }]} />
      <HeroBanner
        eyebrow={t(locale, "Nosotros", "Sobre", "About")}
        title={t(locale, "Cowinmagnet Chile y Sudamerica", "Cowinmagnet Chile e America do Sul", "Cowinmagnet Chile and South America")}
        summary={t(locale, "Proveedor profesional de equipos de separacion magnetica y recuperacion de metales para mineria, reciclaje, agregados y manejo de graneles.", "Fornecedor profissional de equipamentos de separacao magnetica e recuperacao de metais para mineracao, reciclagem, agregados e manuseio de granels.", "Professional supplier of magnetic separation equipment and metal recovery solutions for mining, recycling, aggregates and bulk material handling.")}
        image="/assets/brief/rcdc-air-cooled-self-cleaning-electromagnetic-separator.png"
      />
      <section className="band brief-page">
        <div className="brief-stack">
          {sections.map((section) => (
            <article className="brief-text-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
        <div className="brief-cta">
          <div>
            <p className="eyebrow">{t(locale, "Contacto", "Contato", "Contact")}</p>
            <h2>{t(locale, "Indiquenos su material y condiciones de operacion", "Informe seu material e condicoes de operacao", "Tell us your material and operating conditions")}</h2>
            <p>{t(locale, "Podemos recomendar el separador magnetico adecuado despues de revisar material, ancho de cinta, capacidad y objetivo de separacion.", "Podemos recomendar o separador magnetico adequado apos revisar material, largura da correia, capacidade e objetivo de separacao.", "We can recommend the suitable magnetic separator after reviewing material type, conveyor width, capacity and separation target.")}</p>
          </div>
          <Link className="button primary" href={localizedPath(locale, "contact")}>{t(locale, "Contactar", "Contato", "Contact us")}</Link>
        </div>
      </section>
    </>
  );
}
