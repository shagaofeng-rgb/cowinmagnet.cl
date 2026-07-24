import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryDisplay, industries, markets, productCategories, productCopy, products, solutions } from "@/data/catalog";
import { Locale, localizedPath, siteConfig, t, uiText } from "@/data/site";

const homeCopy: Record<Locale, {
  heroTitle: string;
  heroSummary: string;
  stats: { value: string; label: string }[];
  paths: { label: string; title: string; summary: string; href: string }[];
  productTitle: string;
  productSummary: string;
  featuredEyebrow: string;
  featuredTitle: string;
  featuredSummary: string;
  applicationTitle: string;
  applicationSummary: string;
  marketTitle: string;
  marketSummary: string;
  quoteEyebrow: string;
  quoteTitle: string;
  quoteSummary: string;
}> = {
  "es-cl": {
    heroTitle: "Equipos de separacion magnetica para mineria, reciclaje y manejo de graneles",
    heroSummary: "Catalogo de productos, orientacion de aplicacion y soporte de cotizacion para proteccion de cintas, eliminacion de hierro trampa, separacion humeda/seca y recuperacion en Sudamerica.",
    stats: [
      { value: "21", label: "productos clave" },
      { value: "4", label: "familias de producto" },
      { value: "LATAM", label: "paginas de mercado" }
    ],
    paths: [
      { label: "01", title: "Separacion magnetica", summary: "Tambor humedo, tambor seco, alto gradiente y equipos de proceso.", href: "products/magnetic-separation-equipment" },
      { label: "02", title: "Proteccion de chancadores", summary: "Retiro de hierro trampa en cintas, puntos de transferencia y alimentadores.", href: "solutions/proteccion-de-chancadores" },
      { label: "03", title: "Chile y Sudamerica", summary: "Condiciones para mineria, aridos, reciclaje y logistica regional.", href: "markets/chile" }
    ],
    productTitle: "Parte desde una familia real de productos",
    productSummary: "Cada categoria muestra productos clave con imagenes reales, notas simples de seleccion y acceso directo a cotizacion.",
    featuredEyebrow: "Equipo destacado",
    featuredTitle: "RCYD removedor de hierro autodescargable con iman permanente",
    featuredSummary: "Punto de partida frecuente para retiro de hierro trampa en cintas de mineria, aridos y manejo de graneles.",
    applicationTitle: "Paginas de aplicacion basadas en problemas de planta",
    applicationSummary: "Avanza desde la industria y la condicion de operacion hacia la familia de producto adecuada.",
    marketTitle: "Paginas regionales para contexto de compra local",
    marketSummary: "Las paginas por pais conectan mineria, aridos, reciclaje y logistica con preparacion tecnica de cotizacion.",
    quoteEyebrow: "Soporte de cotizacion",
    quoteTitle: "Envia primero solo los datos utiles",
    quoteSummary: "Producto requerido, material, pais y un metodo de contacto son suficientes para iniciar. Los detalles tecnicos se completan despues."
  },
  es: {
    heroTitle: "Equipos de separacion magnetica para mineria, reciclaje y manejo de graneles",
    heroSummary: "Catalogo de productos, orientacion de aplicacion y soporte de cotizacion para proteccion de cintas, eliminacion de hierro trampa, separacion humeda/seca y recuperacion en Sudamerica.",
    stats: [
      { value: "21", label: "productos clave" },
      { value: "4", label: "familias de producto" },
      { value: "LATAM", label: "paginas de mercado" }
    ],
    paths: [
      { label: "01", title: "Separacion magnetica", summary: "Tambor humedo, tambor seco, alto gradiente y equipos de proceso.", href: "products/magnetic-separation-equipment" },
      { label: "02", title: "Proteccion de chancadores", summary: "Retiro de hierro trampa en cintas, puntos de transferencia y alimentadores.", href: "solutions/proteccion-de-chancadores" },
      { label: "03", title: "Chile y Sudamerica", summary: "Condiciones para mineria, aridos, reciclaje y logistica regional.", href: "markets/chile" }
    ],
    productTitle: "Parte desde una familia real de productos",
    productSummary: "Cada categoria muestra productos clave con imagenes reales, notas simples de seleccion y acceso directo a cotizacion.",
    featuredEyebrow: "Equipo destacado",
    featuredTitle: "RCYD removedor de hierro autodescargable con iman permanente",
    featuredSummary: "Punto de partida frecuente para retiro de hierro trampa en cintas de mineria, aridos y manejo de graneles.",
    applicationTitle: "Paginas de aplicacion basadas en problemas de planta",
    applicationSummary: "Avanza desde la industria y la condicion de operacion hacia la familia de producto adecuada.",
    marketTitle: "Paginas regionales para contexto de compra local",
    marketSummary: "Las paginas por pais conectan mineria, aridos, reciclaje y logistica con preparacion tecnica de cotizacion.",
    quoteEyebrow: "Soporte de cotizacion",
    quoteTitle: "Envia primero solo los datos utiles",
    quoteSummary: "Producto requerido, material, pais y un metodo de contacto son suficientes para iniciar. Los detalles tecnicos se completan despues."
  },
  "pt-br": {
    heroTitle: "Equipamentos de separacao magnetica para mineracao, reciclagem e granéis",
    heroSummary: "Catalogo de produtos, orientacao de aplicacao e suporte de cotacao para protecao de correias, remocao de ferro tramp, separacao umida/seca e recuperacao na America do Sul.",
    stats: [
      { value: "21", label: "produtos principais" },
      { value: "4", label: "familias de produto" },
      { value: "LATAM", label: "paginas de mercado" }
    ],
    paths: [
      { label: "01", title: "Separacao magnetica", summary: "Tambor umido, tambor seco, alto gradiente e equipamentos de processo.", href: "products/magnetic-separation-equipment" },
      { label: "02", title: "Protecao de britadores", summary: "Remocao de ferro tramp em correias, transferencias e alimentadores.", href: "solutions/proteccion-de-chancadores" },
      { label: "03", title: "Chile e America do Sul", summary: "Condicoes para mineracao, agregados, reciclagem e logistica regional.", href: "markets/chile" }
    ],
    productTitle: "Comece por uma familia real de produtos",
    productSummary: "Cada categoria mostra produtos principais com imagens reais, notas simples de selecao e caminho direto para cotacao.",
    featuredEyebrow: "Equipamento em destaque",
    featuredTitle: "RCYD removedor de ferro autodescarregavel com ima permanente",
    featuredSummary: "Ponto de partida comum para remocao de ferro tramp em correias de mineracao, agregados e granéis.",
    applicationTitle: "Paginas de aplicacao baseadas em problemas de planta",
    applicationSummary: "Avance da industria e da condicao operacional para a familia de produto adequada.",
    marketTitle: "Paginas regionais para contexto local de compra",
    marketSummary: "As paginas por pais conectam mineracao, agregados, reciclagem e logistica com preparacao tecnica de cotacao.",
    quoteEyebrow: "Suporte de cotacao",
    quoteTitle: "Envie primeiro apenas os dados uteis",
    quoteSummary: "Produto requerido, material, pais e um metodo de contato bastam para iniciar. Os detalhes tecnicos podem vir depois."
  },
  en: {
    heroTitle: "Magnetic separation equipment for mining, recycling and bulk handling",
    heroSummary: "Product catalog, application guidance and quote support for conveyor protection, tramp iron removal, wet/dry separation and recycling recovery across South America.",
    stats: [
      { value: "21", label: "core products" },
      { value: "4", label: "product families" },
      { value: "LATAM", label: "market pages" }
    ],
    paths: [
      { label: "01", title: "Magnetic separation", summary: "Wet drum, dry drum, high-gradient and process equipment.", href: "products/magnetic-separation-equipment" },
      { label: "02", title: "Crusher protection", summary: "Tramp iron removal for conveyors and transfer points.", href: "solutions/proteccion-de-chancadores" },
      { label: "03", title: "Chile and South America", summary: "Mining, aggregates, recycling and logistics conditions.", href: "markets/chile" }
    ],
    productTitle: "Start from a real product family",
    productSummary: "Each category shows core products with real images, simple selection notes and direct quotation paths.",
    featuredEyebrow: "Featured equipment",
    featuredTitle: "RCYD permanent magnet self dumping iron remover",
    featuredSummary: "Common starting point for conveyor tramp iron removal in mining, aggregate and bulk handling lines.",
    applicationTitle: "Application pages built around site problems",
    applicationSummary: "Move from industry and operating condition to the product family that fits the job.",
    marketTitle: "Regional pages for local buying context",
    marketSummary: "Country pages connect mining, aggregate, recycling and logistics conditions with technical quote preparation.",
    quoteEyebrow: "Quote support",
    quoteTitle: "Send only the useful data first",
    quoteSummary: "Product need, material, country and one contact method are enough to start. Technical details can be added later."
  }
};

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const home = homeCopy[locale] ?? homeCopy["es-cl"];
  const title = locale === "en"
    ? "Magnetic Separation Equipment for Latin America"
    : locale === "pt-br"
      ? "Equipamentos de separacao magnetica para a America Latina"
      : "Equipos de separacion magnetica para LATAM";
  return {
    title,
    description: home.heroSummary,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "es-CL": "/es-cl",
        es: "/es",
        "pt-BR": "/pt-br",
        en: "/en",
        "x-default": "/es-cl"
      }
    },
    openGraph: {
      title: home.heroTitle,
      description: home.heroSummary,
      url: `/${locale}`,
      type: "website",
      images: [{ url: "/assets/home-hero-cowinmagnet-ai.jpg", width: 1600, height: 900, alt: "Cowinmagnet suspended magnetic separator and conveyor protection system" }]
    },
    twitter: {
      card: "summary_large_image",
      title: home.heroTitle,
      description: home.heroSummary,
      images: ["/assets/home-hero-cowinmagnet-ai.jpg"]
    }
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const base = (path = "") => localizedPath(locale, path);
  const copy = uiText[locale] ?? uiText["es-cl"];
  const productText = productCopy[locale] ?? productCopy["es-cl"];
  const home = homeCopy[locale] ?? homeCopy["es-cl"];
  const featuredCategories = productCategories.slice(0, 4).map((category) => ({
    ...category,
    display: getCategoryDisplay(category, locale)
  }));
  const homeStats = home.stats.map((item, index) => index === 0 ? { ...item, value: String(products.length) } : item);
  const regionChips = ["Colombia", "Peru", "Brazil", "Bolivia", "Chile", "Argentina"];
  const benefitCards = [
    t(locale, "Proteccion de chancadores y equipos criticos", "Protecao de britadores e equipamentos criticos", "Crusher and critical equipment protection"),
    t(locale, "Eliminacion continua de hierro trampa", "Remocao continua de ferro tramp", "Continuous tramp iron removal"),
    t(locale, "Proteccion de cintas transportadoras", "Protecao de correias transportadoras", "Conveyor belt protection"),
    t(locale, "Recuperacion de metales ferrosos", "Recuperacao de metais ferrosos", "Ferrous metal recovery"),
    t(locale, "Soporte tecnico para seleccion", "Suporte tecnico para selecao", "Technical support for selection"),
    t(locale, "Configuracion segun condicion de planta", "Configuracao conforme condicao da planta", "Configuration by plant condition")
  ];
  const quoteSpecs = [
    t(locale, "Ancho de cinta", "Largura da correia", "Belt width"),
    t(locale, "Tipo de material", "Tipo de material", "Material type"),
    t(locale, "Altura de instalacion", "Altura de instalacao", "Installation height"),
    t(locale, "Nivel de contaminacion", "Nivel de contaminacao", "Contamination level")
  ];

  return (
    <>
      <section className="home-hero home-hero-redesign">
        <Image src="/assets/home-design/hero-equipment.jpg" alt="Cowinmagnet suspended magnetic separator and conveyor protection system in South America mining operation" fill priority sizes="100vw" />
        <div className="home-hero-shade" />
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="eyebrow">Cowinmagnet Chile & LATAM</p>
            <h1>{home.heroTitle}</h1>
            <p>{home.heroSummary}</p>
            <div className="hero-actions">
              <Link className="button primary" href={base("products")}>{copy.nav.viewProducts}</Link>
              <Link className="button secondary" href={base("request-a-quote")}>{copy.nav.quote}</Link>
            </div>
          </div>
          <div className="home-hero-panel" aria-label="Cowinmagnet catalog snapshot">
            {homeStats.map((item) => (
              <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-paths home-region-quicknav" aria-label="South America regional coverage">
        {regionChips.map((country) => (
          <Link href={base(`markets/${country.toLowerCase()}`)} key={country}>{country}</Link>
        ))}
      </section>

      <section className="home-paths home-paths-redesign">
        {home.paths.map((item) => (
          <Link href={base(item.href)} className="home-path" key={item.title}>
            <span>{item.label}</span>
            <strong>{item.title}</strong>
            <small>{item.summary}</small>
          </Link>
        ))}
      </section>

      <section className="band home-products">
        <div className="home-section-head">
          <p className="eyebrow">{copy.nav.productCenter}</p>
          <h2>{home.productTitle}</h2>
          <p>{home.productSummary}</p>
        </div>
        <div className="home-product-showcase">
          <article className="home-feature-product">
            <Image src="/assets/home-design/product-close.jpg" alt="RCYD permanent magnet self dumping iron remover on conveyor" width={980} height={720} />
            <div>
              <p className="eyebrow">{home.featuredEyebrow}</p>
              <h3>{home.featuredTitle}</h3>
              <p>{home.featuredSummary}</p>
              <Link className="text-link" href={base("products/suspended-self-unloading-iron-removers/rcyd-type-permanent-magnet-self-dumping-iron-remover")}>{productText.viewProduct}</Link>
            </div>
          </article>
          <div className="home-category-list">
            {featuredCategories.map((category) => (
              <Link href={base(`products/${category.slug}`)} key={category.slug}>
                <span>{category.display.title}</span>
                <small>{category.display.summary}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band muted home-industries home-industries-redesign">
        <div className="home-section-head">
          <p className="eyebrow">{copy.nav.applications}</p>
          <h2>{home.applicationTitle}</h2>
          <p>{home.applicationSummary}</p>
        </div>
        <div className="home-application-panorama" aria-hidden="true">
          <Image src="/assets/home-design/applications-strip.jpg" alt="" width={1680} height={460} />
        </div>
        <div className="home-image-grid">
          {industries.slice(0, 3).map((item) => (
            <Link className="home-image-card" href={base(`industries/${item.slug}`)} key={item.slug}>
              <Image src={item.image} alt={item.title} width={720} height={520} />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
        <div className="home-solution-strip">
          {solutions.slice(0, 4).map((item) => (
            <Link href={base(`solutions/${item.slug}`)} key={item.slug}>{item.title}</Link>
          ))}
        </div>
      </section>

      <section className="band home-markets">
        <div className="home-section-head">
          <p className="eyebrow">{copy.nav.markets}</p>
          <h2>{home.marketTitle}</h2>
          <p>{home.marketSummary}</p>
        </div>
        <div className="home-market-layout">
          <div className="home-market-map">
            <Image src="/assets/home-design/south-america-map.jpg" alt="South America regional coverage for Cowinmagnet LATAM" width={980} height={620} />
          </div>
          <div className="home-market-links">
            {markets.slice(0, 6).map((item) => (
              <Link href={base(`markets/${item.slug}`)} key={item.slug}>
                <strong>{item.title}</strong>
                <span>{item.summary}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-benefits" aria-label="Cowinmagnet advantages">
        <div className="home-section-head">
          <p className="eyebrow">{t(locale, "Por que elegir Cowinmagnet", "Por que escolher Cowinmagnet", "Why choose Cowinmagnet")}</p>
          <h2>{t(locale, "Ventajas que impactan en tus resultados", "Vantagens que impactam seus resultados", "Advantages that impact your results")}</h2>
        </div>
        <div className="home-benefit-grid">
          {benefitCards.map((item) => <article key={item}><span aria-hidden="true" /> <h3>{item}</h3></article>)}
        </div>
      </section>

      <section className="home-quote-band home-quote-redesign">
        <Image src="/assets/markets/chile-copper-ore.jpg" alt="Technical consultation for South America mining plant" width={560} height={390} />
        <div>
          <p className="eyebrow">{home.quoteEyebrow}</p>
          <h2>{home.quoteTitle}</h2>
          <p>{home.quoteSummary}</p>
          <div className="home-quote-specs">
            {quoteSpecs.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="hero-actions">
            <Link className="button primary" href={base("request-a-quote")}>{copy.nav.quote}</Link>
            <a className="button secondary" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  );
}
