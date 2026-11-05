import { InteriorCard, InteriorLink, InteriorRow, InteriorSection } from "@/components/Interior";
import { InteriorIcon } from "@/components/InteriorIcon";
import { ProductContentTabs, ProductSpecButton } from "@/components/ProductContentTabs";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import { ProductLocalMarketContext } from "@/components/ProductLocalMarketContext";
import { productPresentation } from "@/data/productPresentation";
import { getProductTruthCard } from "@/data/productTruth";
import { localizedPath, t, type Locale } from "@/data/site";
import { technicalResources } from "@/data/technicalResources";
import type { ProductDetailContent } from "@/data/productDetailContent";
import type { getPublishedCatalogProducts } from "@/data/productCatalog.server";

type CatalogProduct = Awaited<ReturnType<typeof getPublishedCatalogProducts>>[number];

function quotePath(locale: Locale, product: CatalogProduct) {
  return localizedPath(locale, "request-a-quote") + "?model=" + encodeURIComponent(product.slug);
}

function factGroup(items: { label: string; value: string }[]) {
  return <dl className="fact-row">{items.map(({ label, value }) => <div key={label} className="fact">
    <dt>{label}</dt><dd><strong>{value}</strong></dd>
  </div>)}</dl>;
}

function textList(items: string[]) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function localizedSelection(product: CatalogProduct, content: ProductDetailContent, locale: Locale) {
  if (locale === "es" || locale === "es-cl") return content.selectionInputs;
  const identity = product.slug;
  if (product.category === "suspended-self-unloading-iron-removers" || /iron-remover|overband/.test(identity)) return [
    t(locale, "", "Largura e velocidade da correia, espessura da camada", "Belt width and speed, material layer depth"),
    t(locale, "", "Altura de suspensão e área de descarga", "Suspension height and discharge clearance"),
    t(locale, "", "Tamanho e frequência do metal indesejado", "Tramp metal size and frequency"),
    t(locale, "", "Poeira, altitude e acesso para manutenção", "Dust, altitude and maintenance access")
  ];
  if (/wet|ctb|ctn|cts/.test(identity)) return [t(locale, "", "Vazão e teor de sólidos", "Flow rate and solids content"), t(locale, "", "Granulometria e mineral de interesse", "Particle size and target mineral")];
  if (/dry|ctdg/.test(identity)) return [t(locale, "", "Granulometria e umidade", "Particle size and moisture"), t(locale, "", "Vazão e fração alvo", "Feed rate and target fraction")];
  if (product.category === "metal-detection-recycling-sorting") return [t(locale, "", "Composição do material e metal alvo", "Feed composition and target metal"), t(locale, "", "Capacidade e ponto de instalação", "Capacity and installation point")];
  if (product.category === "magnetic-components-filters") return [t(locale, "", "Abertura de montagem e espaço para limpeza", "Installation opening and cleaning clearance"), t(locale, "", "Material e capacidade", "Material and capacity")];
  return content.selectionInputs;
}

export function ProductInterior({ product, content, categoryTitle, related, locale }: {
  product: CatalogProduct; content: ProductDetailContent; categoryTitle: string; related: CatalogProduct[]; locale: Locale;
}) {
  const quote = quotePath(locale, product);
  const copy = (es: string, pt: string, en: string) => t(locale, es, pt, en);
  const presentation = productPresentation(product, locale);
  const series = content.series;
  const rcyd = series === "RCYD" && product.slug.startsWith("rcyd-type-permanent-magnet-self-dumping");
  const title = rcyd && (locale === "es" || locale === "es-cl") ? content.title.replace(/ RCYD$/, "") : presentation.title;
  const lead = rcyd
    ? copy("Retira hierro trampa sobre correas de minerales, áridos y materiales reciclados.", "Remove ferro indesejado de correias de minérios, agregados e materiais reciclados.", "Removes tramp iron from conveyors handling minerals, aggregates and recycled materials.")
    : presentation.applications.join(" · ") + ".";
  const originalImages = product.imageGallery?.length ? product.imageGallery : [product.image];
  const images = rcyd ? originalImages.filter((path) => /-(01\.jpg|05\.png|06\.png)$/.test(path)) : originalImages;
  const confirmed = content.confirmedSpecifications;
  const facts = confirmed.length ? confirmed.slice(0, 3) : [
    ...(series ? [{ label: copy("Serie", "Série", "Series"), value: series }] : []),
    { label: copy("Familia", "Família", "Family"), value: categoryTitle },
    { label: copy("Configuración", "Configuração", "Configuration"), value: copy("Según el proyecto", "Conforme o projeto", "By project") }
  ];
  const overview = <div className="split equal">
    <div><h2>{copy("Cómo funciona", "Como funciona", "How it works")}</h2><p>{content.howItWorks}</p>
      <div className="actions">
        <InteriorLink href={localizedPath(locale, "markets/chile")}>{copy("Aplicaciones en Chile", "Aplicações no Chile", "Applications in Chile")}</InteriorLink>
        <InteriorLink href={localizedPath(locale, "solutions")}>{copy("Ver soluciones", "Ver soluções", "View solutions")}</InteriorLink>
      </div>
      <details className="form-extra"><summary>{copy("Condiciones del proyecto", "Condições do projeto", "Project conditions")}</summary><ProductLocalMarketContext product={product} locale={locale} /></details>
    </div>
    <div className="panel"><h3>{copy("Dónde se usa", "Onde é utilizado", "Where it is used")}</h3>{textList(presentation.applications)}
      <InteriorLink href={localizedPath(locale, "industries")}>{copy("Explorar industrias", "Explorar indústrias", "Explore industries")}</InteriorLink>
    </div>
  </div>;
  const specifications = <>
    <h2>{copy("Especificaciones confirmadas", "Especificações confirmadas", "Confirmed specifications")}</h2>
    {confirmed.length ? factGroup(confirmed) : <p>{copy("Solicite los datos del modelo para su aplicación.", "Solicite os dados do modelo para sua aplicação.", "Request model data for your application.")}</p>}
    <div className="notice">{copy("Dimensiones, capacidad y condiciones de operación se confirman con el modelo y el proyecto.", "Dimensões, capacidade e condições de operação são confirmadas conforme o modelo e o projeto.", "Dimensions, capacity and operating conditions are confirmed for the model and project.")}</div>
    {content.options.length ? <details className="form-extra"><summary>{copy("Opciones", "Opções", "Options")}</summary>{textList(content.options)}</details> : null}
    <InteriorLink href={quote}>{copy("Solicitar ficha del modelo", "Solicitar ficha do modelo", "Request the model datasheet")}</InteriorLink>
  </>;
  const selection = <div className="split equal">
    <div><h2>{copy("Datos para seleccionar", "Dados para seleção", "Selection data")}</h2>{textList(localizedSelection(product, content, locale))}</div>
    <div className="panel"><h3>{copy("Disposición de montaje", "Disposição de montagem", "Installation layout")}</h3>{textList(content.installation)}
      <InteriorLink href={localizedPath(locale, "technical-support")}>{copy("Consultar soporte", "Consultar suporte", "Get technical support")}</InteriorLink>
    </div>
  </div>;
  const documents = <>
    <h2>{copy("Documentos y preparación", "Documentos e preparação", "Documents and preparation")}</h2>
    <div className="panel doc-list">{technicalResources(locale).slice(0, 2).map((file) => <InteriorRow key={file.href} icon="file-text" title={file.title} summary={file.summary}
      action={<a href={file.href} download className="quiet" aria-label={copy("Descargar ", "Baixar ", "Download ") + file.title}>{file.format} <InteriorIcon name="file-download" /></a>} />)}</div>
    <InteriorLink href={quote}>{copy("Solicitar ficha del modelo", "Solicitar ficha do modelo", "Request the model datasheet")}</InteriorLink>
  </>;
  const faq = <><h2>{copy("Preguntas frecuentes", "Perguntas frequentes", "Frequently asked questions")}</h2>
    <div className="faq">{(locale === "es" || locale === "es-cl" ? getProductTruthCard(product.slug)?.faqs || content.faqs : content.faqs).slice(0, 6).map((item) =>
      <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
  </>;
  return <>
    <section className="wrap cl-product-intro">
      <div className="product">
        <div className="product-media"><ProductMediaGallery key={product.slug} images={images.length ? images : originalImages} alt={title} locale={locale} /></div>
        <div>
          <p className="kicker">{series ? copy("Serie ", "Série ", "Series ") + series : categoryTitle}</p>
          <h1>{title}</h1><p className="lead">{lead}</p>
          <div className="actions" id="cotizacion">
            <InteriorLink href={quote} variant="primary">{series ? copy("Cotizar ", "Cotar ", "Quote ") + series : copy("Cotizar", "Cotar", "Request a quote")}</InteriorLink>
            <ProductSpecButton>{copy("Ver especificaciones", "Ver especificações", "View specifications")}</ProductSpecButton>
          </div>
        </div>
      </div>
      {factGroup(facts)}
    </section>
    <ProductContentTabs label={copy("Información del producto", "Informações do produto", "Product information")} tabs={[
      { id: "overview", label: copy("Resumen", "Resumo", "Overview"), content: overview },
      { id: "specifications", label: copy("Especificaciones", "Especificações", "Specifications"), content: specifications },
      { id: "selection", label: copy("Selección", "Seleção", "Selection"), content: selection },
      { id: "documents", label: copy("Documentos", "Documentos", "Documents"), content: documents },
      { id: "faq", label: copy("Preguntas", "Perguntas", "FAQ"), content: faq }
    ]} />
    {related.length ? <InteriorSection tinted>
      <h2>{copy("También puede evaluar", "Você também pode avaliar", "Related equipment")}</h2>
      <div className="grid">{related.map((item) => {
        const view = productPresentation(item, locale);
        return <InteriorCard key={item.slug} image={item.image} title={view.title} summary={view.applications[0]}
          href={localizedPath(locale, "products/" + item.category + "/" + item.slug)} label={copy("Ver ficha", "Ver ficha", "View product")} equipment />;
      })}</div>
    </InteriorSection> : null}
  </>;
}
