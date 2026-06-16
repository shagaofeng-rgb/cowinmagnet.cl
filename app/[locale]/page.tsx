import Image from "next/image";
import Link from "next/link";
import { getCategoryDisplay, industries, markets, productCategories, productCopy, solutions } from "@/data/catalog";
import { Locale, localizedPath, uiText } from "@/data/site";

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

  return (
    <>
      <section className="home-hero">
        <Image src="/assets/markets/chile-copper-ore.jpg" alt="Copper mining conveyor operation in Chile" fill priority sizes="100vw" />
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
            {home.stats.map((item) => (
              <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-paths">
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
            <Image src="/assets/products/rcyd-type-permanent-magnet-self-dumping-iron-remover/rcyd-type-permanent-magnet-self-dumping-iron-remover-01.jpg" alt="RCYD permanent magnet self dumping iron remover" width={980} height={720} />
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

      <section className="band muted home-industries">
        <div className="home-section-head">
          <p className="eyebrow">{copy.nav.applications}</p>
          <h2>{home.applicationTitle}</h2>
          <p>{home.applicationSummary}</p>
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
            <Image src="/assets/markets/markets-hero.jpg" alt="South America mining market application" width={980} height={620} />
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

      <section className="home-quote-band">
        <div>
          <p className="eyebrow">{home.quoteEyebrow}</p>
          <h2>{home.quoteTitle}</h2>
          <p>{home.quoteSummary}</p>
        </div>
        <Link className="button primary" href={base("request-a-quote")}>{copy.nav.quote}</Link>
      </section>
    </>
  );
}
