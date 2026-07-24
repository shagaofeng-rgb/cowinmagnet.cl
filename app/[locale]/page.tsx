import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { briefIndustryCards, briefProductGroups } from "@/data/brief";
import { getPublishedPosts } from "@/data/blog";
import { Locale, localizedPath, siteConfig, t, uiText } from "@/data/site";

const familyLinks: Record<string, string> = {
  suspended: "products/suspended-self-unloading-iron-removers",
  separation: "products/magnetic-separation-equipment",
  recycling: "products/metal-detection-recycling-sorting",
  components: "products/magnetic-components-filters"
};

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = t(locale, "Equipos de separacion magnetica para Sudamerica", "Equipamentos de separacao magnetica para a America do Sul", "Magnetic separation equipment for South America");
  const description = t(locale, "Soluciones de separacion magnetica para mineria, reciclaje, cemento, manejo de graneles y procesamiento industrial en Chile y Sudamerica.", "Solucoes de separacao magnetica para mineracao, reciclagem, cimento, granéis e processamento industrial no Chile e na America do Sul.", "Magnetic separation solutions for mining, recycling, cement, bulk handling and industrial processing across Chile and South America.");
  return {
    title,
    description,
    alternates: { canonical: `/${locale}`, languages: { "es-CL": "/es-cl", es: "/es", "pt-BR": "/pt-br", en: "/en", "x-default": "/es-cl" } },
    openGraph: { title, description, url: `/${locale}`, type: "website", images: [{ url: "/assets/home-hero-cowinmagnet-ai.jpg", width: 1600, height: 900, alt: "Cowinmagnet magnetic separation equipment for South America" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/assets/home-hero-cowinmagnet-ai.jpg"] }
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const base = (path = "") => localizedPath(locale, path);
  const copy = uiText[locale] ?? uiText["es-cl"];
  const latestNews = (await getPublishedPosts(locale)).slice(0, 3);

  return (
    <>
      <section className="focused-hero">
        <Image src="/assets/home-design/hero-equipment.jpg" alt="Cowinmagnet magnetic separator installed above a conveyor in a South American industrial operation" fill priority sizes="100vw" />
        <div className="focused-hero-shade" />
        <div className="focused-hero-content">
          <p className="eyebrow">Cowinmagnet Chile & LATAM</p>
          <h1>{t(locale, "Separacion magnetica para los procesos que mueven Sudamerica", "Separacao magnetica para os processos que movem a America do Sul", "Magnetic separation for the processes that move South America")}</h1>
          <p>{t(locale, "Equipos y orientacion tecnica para mineria, reciclaje, cemento, carbon, alimentos y manejo de materiales a granel.", "Equipamentos e orientacao tecnica para mineracao, reciclagem, cimento, carvao, alimentos e manuseio de materiais a granel.", "Equipment and technical guidance for mining, recycling, cement, coal, food and bulk material handling.")}</p>
          <div className="hero-actions"><Link className="button primary" href={base("products")}>{copy.nav.viewProducts}</Link><Link className="button secondary" href={base("request-a-quote")}>{copy.nav.quote}</Link></div>
        </div>
      </section>

      <section className="band focused-section" id="products">
        <div className="focused-heading"><p className="eyebrow">{copy.nav.products}</p><h2>{t(locale, "Cuatro familias. Un punto de partida claro.", "Quatro familias. Um ponto de partida claro.", "Four families. One clear starting point.")}</h2><p>{t(locale, "Conserve la profundidad tecnica en las fichas; en la primera visita solo muestre la familia que resuelve su necesidad.", "Mantenha a profundidade tecnica nas fichas; na primeira visita mostre apenas a familia que resolve sua necessidade.", "Keep technical depth in the product pages; on the first visit, show only the family that solves the need.")}</p></div>
        <div className="home-family-grid">
          {briefProductGroups.map((group) => <Link className="home-family-card" href={base(familyLinks[group.id])} key={group.id}><Image src={group.image} alt={group.title[locale]} width={720} height={480} /><div><span>{group.products.length} {t(locale, "modelos clave", "modelos principais", "core models")}</span><h3>{group.title[locale]}</h3><p>{group.summary[locale]}</p></div></Link>)}
        </div>
      </section>

      <section className="band focused-section focused-dark" id="industries">
        <div className="focused-heading"><p className="eyebrow">{t(locale, "Necesidades por industria", "Necessidades por industria", "Needs by industry")}</p><h2>{t(locale, "Empiece por su proceso", "Comece pelo seu processo", "Start with your process")}</h2><p>{t(locale, "La solucion depende del material, contaminante, capacidad y punto de instalacion, no de una lista extensa de productos.", "A solucao depende do material, contaminante, capacidade e ponto de instalacao, nao de uma lista extensa de produtos.", "The solution depends on material, contaminant, capacity and installation point, not on a long product list.")}</p></div>
        <div className="home-industry-grid">
          {briefIndustryCards.map((card) => <Link className="home-industry-card" href={base(`industries/${card.slug}`)} key={`${card.slug}-${card.image}`}><Image src={card.image} alt={card.title[locale]} width={720} height={500} /><span>{card.title[locale]}</span></Link>)}
        </div>
      </section>

      <section className="band focused-about" id="about">
        <Image src="/assets/brief/south-africa/products/rcdc-self-cleaning.png" alt="Cowinmagnet self-cleaning electromagnetic separator" width={760} height={520} />
        <div><p className="eyebrow">{t(locale, "Sobre Cowinmagnet", "Sobre a Cowinmagnet", "About Cowinmagnet")}</p><h2>{t(locale, "Soporte tecnico pensado para compras industriales", "Suporte tecnico pensado para compras industriais", "Technical support designed for industrial buying")}</h2><p>{t(locale, "Ayudamos a revisar la aplicacion antes de cotizar: material, contaminante, sistema de transporte, capacidad, ambiente y objetivo de separacion.", "Ajudamos a analisar a aplicacao antes da cotacao: material, contaminante, sistema de transporte, capacidade, ambiente e objetivo de separacao.", "We help review the application before quotation: material, contaminant, conveying system, capacity, environment and separation goal.")}</p><Link className="text-link" href={base("about")}>{t(locale, "Conocer a Cowinmagnet", "Conhecer a Cowinmagnet", "Learn about Cowinmagnet")}</Link></div>
      </section>

      <section className="band focused-section" id="news">
        <div className="focused-heading inline-heading"><div><p className="eyebrow">{copy.nav.news}</p><h2>{t(locale, "Noticias de industria con lectura tecnica", "Noticias do setor com leitura tecnica", "Industry news with a technical view")}</h2></div><Link className="text-link" href={base("news")}>{t(locale, "Ver todas las noticias", "Ver todas as noticias", "View all news")}</Link></div>
        <div className="home-news-grid">{latestNews.map((post) => <article key={post.slug}><Image src={post.image || "/assets/markets/chile-copper-ore.jpg"} alt={post.title} width={720} height={420} unoptimized /><div><p className="eyebrow">{post.categoryTitle || "Industry News"}</p><h3>{post.title}</h3><p>{post.summary}</p><Link href={base(`news/${post.slug}`)}>{t(locale, "Leer noticia", "Ler noticia", "Read news")}</Link></div></article>)}</div>
      </section>

      <section className="focused-contact" id="contact">
        <div><p className="eyebrow">{t(locale, "Contacto", "Contato", "Contact")}</p><h2>{t(locale, "Cuente su proceso. Nosotros ordenamos la seleccion.", "Conte seu processo. Nos organizamos a selecao.", "Tell us about your process. We organize the selection.")}</h2><p>{t(locale, "Empiece con el material, pais, capacidad aproximada y una forma de contacto. Los detalles tecnicos se validan despues.", "Comece com o material, pais, capacidade aproximada e uma forma de contato. Os detalhes tecnicos sao validados depois.", "Start with material, country, approximate capacity and one contact method. Technical details are confirmed afterward.")}</p></div>
        <div className="focused-contact-actions"><Link className="button primary" href={base("request-a-quote")}>{copy.nav.quote}</Link><a className="button secondary" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a></div>
      </section>
    </>
  );
}
