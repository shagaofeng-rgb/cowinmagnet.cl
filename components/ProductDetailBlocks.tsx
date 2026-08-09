import Image from "next/image";
import Link from "next/link";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import type { ProductDetailContent } from "@/data/productDetailContent";
import { Locale, localizedPath, siteConfig } from "@/data/site";

export type ProductPageProduct = {
  slug: string;
  category: string;
  sourceCategory: string;
  title: string;
  image: string;
  imageGallery: string[];
};

type Copy = ReturnType<typeof productPageCopy>;

function productPageCopy(locale: Locale) {
  if (locale === "en") return {
    overview: "Overview", how: "How it works", applications: "Applications", selection: "Selection", specifications: "Specifications", faq: "FAQ", quote: "Request a quote", speak: "WhatsApp", gallery: "View image", category: "PRODUCT EQUIPMENT", guide: "View selection guide", projectNote: "Final configuration is confirmed against belt, material and site conditions.", selectionEyebrow: "DATA FOR A PRECISE SELECTION", applicationText: "Applications are validated against the material, process point and technical objective of each project.", selectionText: "Do not select only by belt width. Suspension height, material layer and tramp metal size change the right configuration.", options: "Options and customization", operation: "Operation, maintenance and documents", operationText: "The available options depend on the selected model and project conditions.", documentTitle: "Technical documents", documentText: "Request a project-specific data sheet.", documentAction: "Request data sheet", related: "Related products", view: "View product", quoteEyebrow: "REQUEST A RECOMMENDATION", quoteTitle: "Select the right equipment with real project data.", quoteText: "Send the basic information for your material and installation. COWIN will review the configuration for your inquiry.", coverage: "Support for Chile and Latin America", pending: "Available on request", type: "Magnet type", discharge: "Discharge mode", installation: "Installation", mainApplication: "Main application", permanent: "Permanent", electromagnetic: "Electromagnetic", manual: "Manual", automatic: "Self-cleaning", project: "By project"
  };
  if (locale === "pt-br") return {
    overview: "Resumo", how: "Como funciona", applications: "Aplicações", selection: "Seleção", specifications: "Especificações", faq: "Perguntas frequentes", quote: "Solicitar cotação", speak: "WhatsApp", gallery: "Ver imagem", category: "EQUIPAMENTO DE PRODUTO", guide: "Ver guia de seleção", projectNote: "A configuração final é confirmada conforme a correia, o material e as condições do local.", selectionEyebrow: "DADOS PARA UMA SELEÇÃO PRECISA", applicationText: "As aplicações são validadas conforme o material, o ponto de processo e o objetivo técnico do projeto.", selectionText: "Não selecione apenas pela largura da correia. A altura, a camada de material e o tamanho do metal mudam a configuração.", options: "Opções e personalização", operation: "Operação, manutenção e documentos", operationText: "As opções disponíveis dependem do modelo selecionado e das condições do projeto.", documentTitle: "Documentos técnicos", documentText: "Solicite uma ficha técnica para o seu projeto.", documentAction: "Solicitar ficha técnica", related: "Produtos relacionados", view: "Ver produto", quoteEyebrow: "SOLICITE UMA RECOMENDAÇÃO", quoteTitle: "Selecione o equipamento correto com dados reais do projeto.", quoteText: "Envie os dados básicos do material e da instalação. A COWIN revisará a configuração para sua consulta.", coverage: "Suporte para Chile e América Latina", pending: "Disponível sob solicitação", type: "Tipo de ímã", discharge: "Modo de descarga", installation: "Instalação", mainApplication: "Aplicação principal", permanent: "Permanente", electromagnetic: "Eletromagnético", manual: "Manual", automatic: "Autolimpante", project: "Por projeto"
  };
  return {
    overview: "Resumen", how: "Funcionamiento", applications: "Aplicaciones", selection: "Selección", specifications: "Especificaciones", faq: "FAQ", quote: "Solicitar cotización", speak: "WhatsApp", gallery: "Ver imagen", category: "EQUIPO DE PRODUCTO", guide: "Ver guía de selección", projectNote: "La configuración final se confirma según la cinta, el material y las condiciones del sitio.", selectionEyebrow: "DATOS PARA UNA SELECCIÓN PRECISA", applicationText: "Las aplicaciones se validan con el material, el punto de proceso y el objetivo técnico de cada proyecto.", selectionText: "No seleccione solo por el ancho de la cinta. La altura, la capa de material y el tamaño del hierro cambian la configuración.", options: "Opciones y personalización", operation: "Operación, mantenimiento y documentos", operationText: "Las opciones disponibles dependen del modelo seleccionado y de las condiciones del proyecto.", documentTitle: "Documentos técnicos", documentText: "Solicite una ficha técnica para su proyecto.", documentAction: "Solicitar ficha técnica", related: "Productos relacionados", view: "Ver producto", quoteEyebrow: "SOLICITE UNA RECOMENDACIÓN", quoteTitle: "Seleccione el equipo correcto con datos reales del proyecto.", quoteText: "Envíe los datos básicos de su cinta, material y condiciones de instalación. COWIN revisará la configuración adecuada para su consulta.", coverage: "Soporte para proyectos en Chile y Latinoamérica", pending: "Disponible bajo solicitud", type: "Tipo de imán", discharge: "Modo de descarga", installation: "Instalación", mainApplication: "Aplicación principal", permanent: "Permanente", electromagnetic: "Electromagnético", manual: "Manual", automatic: "Autolimpiante", project: "Según proyecto"
  };
}

function productKind(product: ProductPageProduct) {
  const value = `${product.slug} ${product.title}`.toLowerCase();
  if (/(wet|ctb|ctn|cts|coal-washing|hmdn|clt|nct|wbc|dcx|hjlh|hjpc|gtc|qcg)/.test(value)) return "wet";
  if (/(dry-drum|ctdg|cgt|ctz|rct|dcz|hcg|dhj|dhd|ctzs)/.test(value)) return "dry";
  if (/(metal-detector|dls|gjt|gls)/.test(value)) return "detector";
  if (/(drawer|hump|grid|rod|trap|pipe|filter|rcyz|clc|cyg|cbz|cgb|cqz|cxj|rcya|rcyf|rcyg)/.test(value)) return "filter";
  if (/(eddy-current|stainless-steel-separation|magnetic-head-pulley|drum-magnet)/.test(value)) return "recycling";
  if (/(electromagnetic|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rbcdb|rbcdd)/.test(value)) return "electromagnetic";
  return "suspended";
}

function isSelfCleaning(product: ProductPageProduct) {
  return /(self-dumping|self-cleaning|overband|rcyd|rcye|rcdd|rcdf|rbcdd|rbcyd|rcps)/.test(`${product.slug} ${product.title}`.toLowerCase());
}

function summarySentences(summary: string) {
  const words = summary.trim().split(/\s+/).slice(0, 90);
  return words.join(" ");
}

function labelFromCategory(category: string, copy: Copy) {
  return category || copy.category;
}

function processSteps(kind: string, selfCleaning: boolean, locale: Locale) {
  const spanish = locale === "es-cl" || locale === "es";
  if (kind === "wet") return spanish ? ["La pulpa ingresa al punto de alimentación del separador.", "La fracción con respuesta magnética se guía en la zona activa.", "Las corrientes se descargan según el circuito definido para el proceso."] : ["Material enters the separator feed point.", "The magnetically responsive fraction is guided through the active zone.", "Streams discharge according to the defined process circuit."];
  if (kind === "dry") return spanish ? ["El material seco se distribuye de forma uniforme.", "La zona magnética actúa sobre las fracciones objetivo.", "Los divisores dirigen cada fracción a su descarga correspondiente."] : ["Dry material is distributed evenly.", "The magnetic zone acts on the target fractions.", "Splitters direct each fraction to its relevant discharge."];
  if (kind === "detector") return spanish ? ["El material atraviesa la ventana de detección.", "El sistema identifica el metal conforme a la prueba definida.", "La alarma o el interbloqueo actúan sobre la línea de proceso."] : ["Material passes through the detection aperture.", "The system identifies metal against the defined test piece.", "The alarm or interlock acts on the process line."];
  if (kind === "filter") return spanish ? ["El producto circula por la zona de captura magnética.", "Las partículas ferrosas quedan retenidas en el conjunto magnético.", "La limpieza se realiza con acceso y frecuencia definidos por el proceso."] : ["Product flows through the magnetic capture zone.", "Ferrous particles are retained by the magnetic assembly.", "Cleaning follows the process-defined access and frequency."];
  if (kind === "recycling") return spanish ? ["El material se prepara y se distribuye sobre la línea.", "El equipo separa la fracción objetivo según su respuesta física.", "Cada corriente se entrega al siguiente punto de clasificación o recuperación."] : ["Material is prepared and distributed on the line.", "The equipment separates the target fraction by physical response.", "Each stream moves to its next sorting or recovery point."];
  return spanish ? ["El material avanza sobre la cinta transportadora.", "El sistema magnético atrae piezas ferrosas mezcladas en el flujo.", selfCleaning ? "La banda autolimpiante descarga el metal capturado fuera de la línea principal." : "La limpieza se programa con acceso seguro y procedimiento de planta."] : ["Material advances on the conveyor belt.", "The magnetic system attracts ferrous pieces within the material flow.", selfCleaning ? "The self-cleaning belt discharges captured metal away from the main line." : "Cleaning is scheduled with safe access and site procedures."];
}

function applicationCards(kind: string, locale: Locale) {
  const spanish = locale === "es-cl" || locale === "es";
  const cards = spanish ? {
    suspended: [["Protección de chancadores", "Antes de trituradoras primarias o secundarias para retirar pernos, dientes y otros metales ferrosos."], ["Minería y procesamiento de minerales", "En correas de mineral, puntos de transferencia y circuitos de alimentación."], ["Áridos, canteras y cemento", "Para reducir el riesgo de daño en trituradoras, zarandas y equipos de proceso."], ["Reciclaje y RDF", "Para separar metales ferrosos antes de clasificación o recuperación posterior."]],
    electromagnetic: [["Protección de chancadores", "Sobre correas y transferencias con hierro trampa de mayor exigencia."], ["Minería y procesamiento de minerales", "En puntos de alimentación y transporte de mineral a validar por proyecto."], ["Puertos y manejo de graneles", "Para proteger equipos de transferencia en materiales a granel."], ["Áridos, cemento y reciclaje", "Para controlar metal ferroso antes de los equipos críticos."]],
    wet: [["Concentración de minerales", "Para circuitos de pulpa donde se requiere separar fracciones con respuesta magnética."], ["Recuperación de relaves", "Como etapa a evaluar con mineralogía, caudal y objetivo metalúrgico."], ["Lavado de carbón y minerales", "En configuraciones donde la pulpa, la granulometría y el flujo determinan el equipo."], ["Pruebas de proceso", "Para definir una alternativa técnica antes de fijar una capacidad o rendimiento."]],
    dry: [["Preconcentración de mineral", "Con alimentación seca, granulometría y distribución revisadas para el proceso."], ["Minerales industriales", "Para estudiar separación de fracciones según respuesta magnética."], ["Áridos y escorias", "En líneas secas con control de humedad, polvo y descarga."], ["Reciclaje de materiales", "Como parte de una clasificación previa o recuperación de fracciones."]],
    detector: [["Protección de equipos", "Antes de chancadores, molinos u otros equipos sensibles al metal."], ["Correas de proceso", "Para controlar material en tránsito con velocidad y ventana definidas."], ["Reciclaje y clasificación", "En líneas donde una señal permite desviar, detener o registrar un evento."], ["Manejo de graneles", "Para detectar metal antes de operaciones de transferencia o tratamiento."]],
    filter: [["Tolvas y chutes", "Para retirar partículas ferrosas antes de la siguiente etapa de proceso."], ["Tuberías y transporte neumático", "En puntos donde el diámetro, caudal y limpieza determinan el diseño."], ["Alimentos y materiales industriales", "Para controlar contaminación ferrosa según el producto y las condiciones permitidas."], ["Reciclaje y recuperación", "Como apoyo a la preparación o limpieza de una corriente de material."]],
    recycling: [["Recuperación de metales", "Para separar fracciones objetivo dentro de una línea de clasificación."], ["Reciclaje de residuos", "En etapas previas o posteriores de separación según composición y tamaño."], ["Plantas de tratamiento", "Para integrar una corriente de material a un proceso de recuperación posterior."], ["Manejo de graneles", "En configuraciones donde el layout y la distribución de alimentación son críticos."]]
  } : null;
  if (cards) return cards[kind as keyof typeof cards] ?? cards.suspended;
  return [["Process protection", "Configured for the process point and material conditions."], ["Material handling", "Selection follows the operating data available for the line."], ["Industrial processing", "Integrated around the actual process objective."], ["Recycling and recovery", "A technical option for the specified material stream."]];
}

function selectionCards(content: ProductDetailContent, kind: string, locale: Locale) {
  const spanish = locale === "es-cl" || locale === "es";
  const defaultCards = kind === "wet" ? ["Mineralogía y granulometría", "Caudal y porcentaje de sólidos", "Química y abrasividad de la pulpa", "Objetivo metalúrgico", "Espacio para alimentación y descarga", "Condiciones ambientales del sitio"]
    : kind === "filter" ? ["Material y contaminante objetivo", "Caudal o capacidad de la línea", "Diámetro, abertura o punto de instalación", "Acceso y frecuencia de limpieza", "Presión y temperatura cuando corresponda", "Ambiente y material de construcción"]
    : kind === "detector" ? ["Ventana útil y posición de instalación", "Tamaño y tipo de metal objetivo", "Velocidad de la cinta", "Pieza de prueba requerida", "Alarma o interbloqueo esperado", "Polvo, humedad y condiciones eléctricas"]
    : ["Material y tamaño máximo", "Ancho y velocidad de la cinta", "Espesor de la capa de material", "Altura disponible de suspensión", "Tamaño y frecuencia del hierro trampa", "Polvo, humedad, temperatura y alimentación eléctrica"];
  const englishDefaults = ["Material and maximum size", "Belt width and speed", "Material layer", "Available installation height", "Target metal and frequency", "Environment and electrical supply"];
  const source = content.selectionInputs.length >= 4 ? content.selectionInputs : (spanish ? defaultCards : englishDefaults);
  return [...source, ...(spanish ? defaultCards : englishDefaults)].filter((item, index, list) => list.indexOf(item) === index).slice(0, 6);
}

function specificationGroups(content: ProductDetailContent, copy: Copy) {
  const confirmed = content.confirmedSpecifications.map((item) => ({ ...item, pending: false }));
  const pending = content.pendingSpecifications.map((label) => ({ label, value: copy.pending, pending: true }));
  const values = [...confirmed, ...pending];
  const groups = [
    { title: "Configuración magnética", match: /(im[aá]n|magn|campo|tipo|limpieza|descarga|banda|motor|accionamiento|rotor|tambor|sensibilidad|ventana)/i },
    { title: "Condiciones de instalación", match: /(cinta|altura|capa|montaje|instal|caudal|pulpa|material|granulo|aliment|presi[oó]n|temperatura|ambiente|capacidad)/i },
    { title: "Dimensiones y operación", match: /(dimensi|peso|velocidad|potencia|el[eé]ctric|volt|refriger|aislamiento|control|tanque|di[aá]metro|longitud)/i }
  ].map((group) => ({ ...group, values: values.filter((item) => group.match.test(item.label)) }));
  const matched = new Set(groups.flatMap((group) => group.values.map((item) => item.label)));
  const remainder = values.filter((item) => !matched.has(item.label));
  if (remainder.length) groups[0].values.push(...remainder);
  return groups.filter((group) => group.values.length);
}

export function ProductHero({ product, content, categoryTitle, locale }: { product: ProductPageProduct; content: ProductDetailContent; categoryTitle: string; locale: Locale }) {
  const copy = productPageCopy(locale);
  const kind = productKind(product);
  const selfCleaning = isSelfCleaning(product);
  const tags = applicationCards(kind, locale).slice(0, 4).map(([title]) => title);
  const facts = [
    { label: copy.type, value: kind === "electromagnetic" ? copy.electromagnetic : kind === "wet" || kind === "dry" || kind === "detector" || kind === "filter" || kind === "recycling" ? copy.project : copy.permanent },
    { label: copy.discharge, value: selfCleaning ? copy.automatic : kind === "suspended" ? copy.manual : copy.project },
    { label: copy.installation, value: kind === "suspended" || kind === "electromagnetic" ? "Transversal / en línea" : copy.project },
    { label: copy.mainApplication, value: tags[0] }
  ];
  return <>
    <section className="pd-hero">
      <div className="pd-shell pd-hero-grid">
        <ProductMediaGallery images={product.imageGallery?.length ? product.imageGallery : [product.image]} alt={content.title} />
        <article className="pd-hero-copy">
          <p className="pd-eyebrow">{labelFromCategory(categoryTitle, copy)}</p>
          <h1>{content.title}</h1>
          {content.series ? <p className="pd-series">Serie {content.series} <span>·</span> Configuración según proyecto</p> : null}
          <p className="pd-hero-summary">{summarySentences(content.summary)}</p>
          <ul className="pd-tags" aria-label="Aplicaciones principales">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          <div className="pd-hero-actions">
            <Link className="pd-button pd-button-primary" href="#cotizacion">{copy.quote}</Link>
            <a className="pd-button pd-button-secondary" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">{copy.speak}</a>
          </div>
          <a className="pd-guide-link" href="#seleccion">{copy.guide}</a>
          {content.pendingSpecifications.length ? <p className="pd-project-note">{copy.projectNote}</p> : null}
        </article>
      </div>
    </section>
    <section className="pd-facts-section" aria-label="Datos rápidos del producto"><div className="pd-shell pd-quick-facts">
      {facts.map((fact, index) => <article key={fact.label}><span className={`pd-fact-icon pd-fact-${index + 1}`} aria-hidden="true" /><div><p>{fact.label}</p><strong>{fact.value}</strong></div></article>)}
    </div></section>
  </>;
}

export function ProductHowItWorks({ product, content, locale }: { product: ProductPageProduct; content: ProductDetailContent; locale: Locale }) {
  const copy = productPageCopy(locale);
  const kind = productKind(product);
  const steps = processSteps(kind, isSelfCleaning(product), locale);
  return <section id="funcionamiento" className="pd-section pd-how-section"><div className="pd-shell pd-two-column pd-how-grid">
    <div className="pd-process-visual" aria-hidden="true"><span className="pd-process-feed" /><span className="pd-process-magnet" /><span className="pd-process-capture" /><span className="pd-process-belt" /><span className="pd-process-discharge" /></div>
    <div><p className="pd-eyebrow">{copy.overview}</p><h2>{copy.how}</h2><p className="pd-section-lead">{content.howItWorks}</p><ol className="pd-numbered-steps">{steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
      {content.features.length ? <ul className="pd-feature-list">{content.features.slice(0, 4).map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
    </div>
  </div></section>;
}

export function ProductApplications({ product, locale }: { product: ProductPageProduct; locale: Locale }) {
  const copy = productPageCopy(locale);
  const cards = applicationCards(productKind(product), locale);
  return <section id="aplicaciones" className="pd-section pd-applications"><div className="pd-shell pd-applications-grid">
    <div><p className="pd-eyebrow">Chile y Latinoamérica</p><h2>{copy.applications}</h2><p className="pd-section-lead">{copy.applicationText}</p></div>
    <div className="pd-application-cards">{cards.map(([title, description], index) => <article key={title}><span className={`pd-application-icon pd-application-${index + 1}`} aria-hidden="true" /><h3>{title}</h3><p>{description}</p><a href="#cotizacion">Ver aplicación</a></article>)}</div>
  </div></section>;
}

export function SelectionGuide({ product, content, locale }: { product: ProductPageProduct; content: ProductDetailContent; locale: Locale }) {
  const copy = productPageCopy(locale);
  const items = selectionCards(content, productKind(product), locale);
  return <section id="seleccion" className="pd-section pd-selection"><div className="pd-shell pd-selection-grid">
    <div><p className="pd-eyebrow">{copy.selectionEyebrow}</p><h2>{locale === "en" ? "Installation and selection guide" : locale === "pt-br" ? "Instalação e guia de seleção" : "Instalación y guía de selección"}</h2><p className="pd-section-lead">{copy.selectionText}</p><a className="pd-text-link" href="#cotizacion">{locale === "en" ? "Send operating data for a recommendation" : locale === "pt-br" ? "Enviar dados de operação para uma recomendação" : "Enviar datos de operación para una recomendación"}</a></div>
    <ol className="pd-selection-cards">{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
  </div></section>;
}

export function SpecGroups({ content, locale }: { content: ProductDetailContent; locale: Locale }) {
  const copy = productPageCopy(locale);
  const groups = specificationGroups(content, copy);
  return <section id="especificaciones" className="pd-section pd-specifications"><div className="pd-shell pd-specifications-grid">
    <div><p className="pd-eyebrow">{copy.overview}</p><h2>{copy.specifications}</h2><p className="pd-section-lead">{locale === "en" ? "Only confirmed values are published. Remaining values are confirmed with COWIN engineering for the selected project." : locale === "pt-br" ? "Somente valores confirmados são publicados. Os demais são confirmados com a engenharia COWIN para o projeto selecionado." : "Solo se publican valores confirmados. Los restantes se validan con ingeniería de COWIN para el proyecto seleccionado."}</p><a className="pd-text-link" href="#cotizacion">{locale === "en" ? "Need a data sheet?" : locale === "pt-br" ? "Precisa de uma ficha técnica?" : "¿Necesita una hoja de datos?"}</a></div>
    <div className="pd-spec-groups">{groups.map((group) => <details className="pd-spec-group" key={group.title} open><summary>{group.title}<span aria-hidden="true">+</span></summary><dl>{group.values.map((item) => <div key={item.label}><dt>{item.label}</dt><dd className={item.pending ? "is-pending" : ""}>{item.value}</dd></div>)}</dl></details>)}</div>
  </div></section>;
}

export function OptionsGrid({ content, locale }: { content: ProductDetailContent; locale: Locale }) {
  const copy = productPageCopy(locale);
  return <section id="opciones" className="pd-section pd-options"><div className="pd-shell pd-options-grid">
    <div><p className="pd-eyebrow">{copy.overview}</p><h2>{copy.options}</h2><p className="pd-section-lead">{copy.operationText}</p></div>
    <div className="pd-option-cards">{content.options.slice(0, 6).map((option, index) => <article key={option}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{option}</h3><p>{locale === "en" ? "Reviewed for the selected model and stated site conditions." : locale === "pt-br" ? "Revisado para o modelo selecionado e as condições informadas do local." : "Se revisa para el modelo seleccionado y las condiciones informadas del sitio."}</p></article>)}</div>
  </div></section>;
}

export function OperationDocuments({ content, locale }: { content: ProductDetailContent; locale: Locale }) {
  const copy = productPageCopy(locale);
  return <section className="pd-section pd-operation"><div className="pd-shell pd-operation-grid">
    <div><p className="pd-eyebrow">{copy.overview}</p><h2>{copy.operation}</h2><ul>{content.operation.map((item) => <li key={item}>{item}</li>)}</ul></div>
    <aside className="pd-document-card"><p>{copy.documentTitle}</p><h3>{locale === "en" ? "Technical data for your project" : locale === "pt-br" ? "Dados técnicos para o seu projeto" : "Datos técnicos para su proyecto"}</h3><span>{copy.documentText}</span><a className="pd-button pd-button-dark" href="#cotizacion">{copy.documentAction}</a></aside>
  </div></section>;
}

export function ProductFaq({ content, locale }: { content: ProductDetailContent; locale: Locale }) {
  const copy = productPageCopy(locale);
  return <section id="faq" className="pd-section pd-faq-section"><div className="pd-shell pd-faq-layout"><div><p className="pd-eyebrow">COWIN MAGNET</p><h2>{copy.faq}</h2><p className="pd-section-lead">{locale === "en" ? "Answers focused on this equipment and the data needed for a technically sound choice." : locale === "pt-br" ? "Respostas focadas neste equipamento e nos dados necessários para uma escolha técnica." : "Respuestas enfocadas en este equipo y en los datos necesarios para una selección técnica."}</p></div><div>{content.faqs.slice(0, 6).map((faq) => <details className="pd-faq" key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div></section>;
}

function relatedReason(product: ProductPageProduct, locale: Locale) {
  const kind = productKind(product);
  if (locale === "en") return kind === "suspended" || kind === "electromagnetic" ? "A related option for conveyor protection and tramp iron control." : "A related option for the same material stream or process stage.";
  if (locale === "pt-br") return kind === "suspended" || kind === "electromagnetic" ? "Uma opção relacionada para proteção de correias e controle de ferro tramp." : "Uma opção relacionada para a mesma corrente de material ou etapa de processo.";
  return kind === "suspended" || kind === "electromagnetic" ? "Una alternativa relacionada para protección de correas y control de hierro trampa." : "Una alternativa relacionada para la misma corriente de material o etapa de proceso.";
}

export function RelatedProducts({ products, locale }: { products: ProductPageProduct[]; locale: Locale }) {
  const copy = productPageCopy(locale);
  if (!products.length) return null;
  return <section className="pd-section pd-related"><div className="pd-shell"><div className="pd-section-heading"><p className="pd-eyebrow">{copy.overview}</p><h2>{copy.related}</h2></div><div className="pd-related-grid">{products.slice(0, 3).map((product) => <article key={product.slug}><Image src={product.image} alt={product.title} width={720} height={540} sizes="(max-width: 760px) 86vw, (max-width: 1040px) 45vw, 32vw" /><div><p className="pd-card-label">{product.sourceCategory}</p><h3>{product.title}</h3><span>{relatedReason(product, locale)}</span><Link href={localizedPath(locale, `products/${product.category}/${product.slug}`)}>{copy.view}</Link></div></article>)}</div></div></section>;
}

export function ProductQuoteIntro({ locale }: { locale: Locale }) {
  const copy = productPageCopy(locale);
  return <div className="pd-quote-intro"><p className="pd-eyebrow">{copy.quoteEyebrow}</p><h2>{copy.quoteTitle}</h2><p>{copy.quoteText}</p><ul><li>{locale === "en" ? "Application review" : locale === "pt-br" ? "Revisão da aplicação" : "Revisión de aplicación"}</li><li>{locale === "en" ? "Model selection" : locale === "pt-br" ? "Seleção de modelo" : "Selección de modelo"}</li><li>{locale === "en" ? "Supply and export coordination" : locale === "pt-br" ? "Coordenação de fornecimento e exportação" : "Coordinación de suministro y exportación"}</li></ul><a className="pd-button pd-button-secondary" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a></div>;
}

export function ProductStickyActions({ locale }: { locale: Locale }) {
  const copy = productPageCopy(locale);
  return <aside className="pd-mobile-actions" aria-label="Contact options"><a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a><a href="#cotizacion">{copy.quote}</a></aside>;
}
