import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorHero, InteriorLink, InteriorRow, InteriorSection } from "@/components/Interior";
import { companySections } from "@/data/brief";
import { Locale, localizedPath, siteConfig, t } from "@/data/site";
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
  const contact = localizedPath(locale, "contact");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: t(locale, "Nosotros", "Sobre", "About") }]} />
    <InteriorHero title={t(locale, "Sobre Cowinmagnet", "Sobre a Cowinmagnet", "About Cowinmagnet")} summary={t(locale, "Equipos de separación magnética y coordinación de proyectos para Sudamérica.", "Equipamentos de separação magnética e coordenação de projetos para a América do Sul.", "Magnetic separation equipment and project coordination for South America.")} image="/assets/home-design/applications-strip.jpg" caption={t(locale, "Imagen de aplicación", "Imagem de aplicação", "Application illustration")}
      action={<InteriorLink href={contact} variant="primary">{t(locale, "Contactar", "Entrar em contato", "Contact us")}</InteriorLink>} />
    <InteriorSection tinted><div className="split catalog-overview"><div><h2>{t(locale, "Cómo trabajamos", "Como trabalhamos", "How we work")}</h2>
      <InteriorRow icon="file-text" title={t(locale, "Revisión técnica", "Revisão técnica", "Technical review")} summary={t(locale, "Revisamos el material, la aplicación y los datos de instalación.", "Revisamos o material, a aplicação e os dados da instalação.", "We review the material, application and installation details.")} />
      <InteriorRow icon="package" title={t(locale, "Selección y suministro", "Seleção e fornecimento", "Selection and supply")} summary={t(locale, "Coordinamos la configuración y la documentación del equipo.", "Coordenamos a configuração e a documentação do equipamento.", "We coordinate the equipment configuration and documentation.")} />
      <InteriorRow icon="truck" title={t(locale, "Exportación", "Exportação", "Export")} summary={t(locale, "Organizamos los datos y documentos del pedido.", "Organizamos os dados e documentos do pedido.", "We organize order details and export documents.")} />
    </div><aside className="panel"><h3>{t(locale, "Razón social", "Razão social", "Registered company")}</h3><p>{siteConfig.company}</p><InteriorLink href={contact}>{t(locale, "Ver ubicación y contacto", "Ver localização e contato", "View address and contacts")}</InteriorLink></aside></div></InteriorSection>
    <InteriorSection><div className="stack">{sections.map((item) => <details key={item.title} className="form-extra"><summary>{item.title}</summary>{item.paragraphs?.map((text) => <p key={text}>{text}</p>)}{item.bullets?.length ? <ul>{item.bullets.map((text) => <li key={text}>{text}</li>)}</ul> : null}</details>)}</div></InteriorSection>
  </Interior>;
}
