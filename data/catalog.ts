import { productCategories as mainProductCategoryNames, products as mainProducts } from "./products";
import { Locale } from "./site";

export const categoryImages = {
  permanent: "/assets/generated/product-permanent-separator.png",
  electro: "/assets/generated/product-electromagnetic-separator.png",
  recycling: "/assets/generated/latam-mining-overband.png",
  components: "/assets/generated/product-magnetic-components.png",
  application: "/assets/generated/application-cement-aggregates.png"
} as const;

type CategoryKey = keyof typeof categoryImages;

const categoryMeta: Record<string, { slug: string; key: CategoryKey; labels: Record<Locale, string>; summaries: Record<Locale, string> }> = {
  "Suspended & Self-Unloading Iron Removers": {
    slug: "suspended-self-unloading-iron-removers",
    key: "permanent",
    labels: {
      "es-cl": "Separadores suspendidos y autolimpiantes",
      es: "Separadores suspendidos y autolimpiantes",
      "pt-br": "Separadores suspensos e autolimpantes",
      en: "Suspended & Self-Unloading Iron Removers"
    },
    summaries: {
      "es-cl": "Categoria sincronizada desde cowinmagnet.com para retiro de hierro trampa sobre cintas transportadoras.",
      es: "Categoria sincronizada desde cowinmagnet.com para retiro de hierro trampa sobre cintas transportadoras.",
      "pt-br": "Categoria sincronizada de cowinmagnet.com para remocao de ferro tramp sobre correias transportadoras.",
      en: "Synced from cowinmagnet.com for conveyor tramp iron removal above belt lines."
    }
  },
  "Magnetic Separation Equipment": {
    slug: "magnetic-separation-equipment",
    key: "electro",
    labels: {
      "es-cl": "Equipos de separacion magnetica",
      es: "Equipos de separacion magnetica",
      "pt-br": "Equipamentos de separacao magnetica",
      en: "Magnetic Separation Equipment"
    },
    summaries: {
      "es-cl": "Separadores humedos, secos, de tambor, alta intensidad y proceso mineral sincronizados desde el catalogo principal.",
      es: "Separadores humedos, secos, de tambor, alta intensidad y proceso mineral sincronizados desde el catalogo principal.",
      "pt-br": "Separadores umidos, secos, de tambor, alta intensidade e processo mineral sincronizados do catalogo principal.",
      en: "Wet, dry, drum, high-intensity and mineral process separators synced from the main catalog."
    }
  },
  "Metal Detection & Recycling Sorting": {
    slug: "metal-detection-recycling-sorting",
    key: "recycling",
    labels: {
      "es-cl": "Deteccion de metal y clasificacion de reciclaje",
      es: "Deteccion de metal y clasificacion de reciclaje",
      "pt-br": "Deteccao de metais e triagem para reciclagem",
      en: "Metal Detection & Recycling Sorting"
    },
    summaries: {
      "es-cl": "Detectores, separadores de corriente de Foucault y equipos para lineas de reciclaje.",
      es: "Detectores, separadores de corriente de Foucault y equipos para lineas de reciclaje.",
      "pt-br": "Detectores, separadores por corrente de Foucault e equipamentos para linhas de reciclagem.",
      en: "Metal detectors, eddy current separators and sorting equipment for recycling lines."
    }
  },
  "Magnetic Components & Filters": {
    slug: "magnetic-components-filters",
    key: "components",
    labels: {
      "es-cl": "Componentes y filtros magneticos",
      es: "Componentes y filtros magneticos",
      "pt-br": "Componentes e filtros magneticos",
      en: "Magnetic Components & Filters"
    },
    summaries: {
      "es-cl": "Imanes de cajon, rejillas, barras, trampas, filtros y componentes magneticos del catalogo principal.",
      es: "Imanes de cajon, rejillas, barras, trampas, filtros y componentes magneticos del catalogo principal.",
      "pt-br": "Imas de gaveta, grades, barras, armadilhas, filtros e componentes magneticos do catalogo principal.",
      en: "Drawer magnets, grids, rods, traps, filters and magnetic components from the main catalog."
    }
  },
  "Industry Application Equipment": {
    slug: "industry-application-equipment",
    key: "application",
    labels: {
      "es-cl": "Equipos para aplicaciones industriales",
      es: "Equipos para aplicaciones industriales",
      "pt-br": "Equipamentos para aplicacoes industriais",
      en: "Industry Application Equipment"
    },
    summaries: {
      "es-cl": "Cajas de control, equipos a prueba de explosion, cribas y electroimanes de elevacion.",
      es: "Cajas de control, equipos a prueba de explosion, cribas y electroimanes de elevacion.",
      "pt-br": "Caixas de controle, equipamentos a prova de explosao, peneiras e eletroimas de elevacao.",
      en: "Control boxes, explosion-proof equipment, screens and electromagnetic lifting magnets."
    }
  }
};

const defaultParameters = ["Material", "Capacity", "Belt width or pipe size", "Installation height or flow condition", "Voltage and frequency", "Operating environment"];

function sanitizeText(value = "") {
  return value
    .replace(/锛\?/g, ": ")
    .replace(/銆\?/g, " ")
    .replace(/顨\?|顩\?|闇€|姹傚緛|璇㈣〃|鏈嶅姟|娴佺▼|璧勬枡|涓嬭浇|鑱旂郴|鎴戜滑/g, "")
    .replace(/products_details\.css[^.]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function categorySlug(category: string) {
  return categoryMeta[category]?.slug ?? category.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const productCategories = mainProductCategoryNames.map((category) => ({
  slug: categorySlug(category),
  sourceTitle: category,
  key: categoryMeta[category]?.key ?? "application",
  title: category,
  summary: categoryMeta[category]?.summaries.en ?? category
}));

export const products = mainProducts.map((product) => {
  const category = categorySlug(product.category);
  const parameters = product.specs?.length ? product.specs.map((spec) => spec.label) : defaultParameters;
  return {
    slug: product.slug,
    category,
    sourceCategory: product.category,
    title: product.name,
    summary: sanitizeText(product.summary) || `${product.name} is synced from the Cowinmagnet main product catalog.`,
    image: product.image,
    imageGallery: product.imageGallery?.length ? product.imageGallery : [product.image],
    sourceUrl: product.sourceUrls?.[0] ?? `https://www.cowinmagnet.com/en/products/${product.slug}`,
    features: product.features?.length ? product.features.map(sanitizeText).filter(Boolean) : ["Main-site product line", "Technical parameters confirmed before quotation"],
    applications: product.applications?.length ? product.applications.map(sanitizeText).filter(Boolean) : ["Mining", "Conveyors", "Aggregates", "Recycling", "Industrial process lines"],
    parameters: [...new Set(parameters)].slice(0, 18)
  };
});

export function getCategoryDisplay(category: (typeof productCategories)[number], locale: Locale) {
  const meta = categoryMeta[category.sourceTitle];
  return {
    title: meta?.labels[locale] ?? category.title,
    summary: meta?.summaries[locale] ?? category.summary
  };
}

export function getProductSummary(product: (typeof products)[number], locale: Locale) {
  const category = productCategories.find((item) => item.slug === product.category);
  const categoryLabel = category ? getCategoryDisplay(category, locale).title : product.sourceCategory;
  if (locale === "en") return product.summary;
  if (locale === "pt-br") return `${product.title} faz parte da categoria ${categoryLabel} sincronizada do catalogo principal da Cowinmagnet. A selecao final deve confirmar material, capacidade, instalacao, ambiente e parametros eletricos.`;
  return `${product.title} pertenece a la categoria ${categoryLabel} sincronizada desde el catalogo principal de Cowinmagnet. La seleccion final debe confirmar material, capacidad, instalacion, ambiente y parametros electricos.`;
}

export const productCopy: Record<Locale, {
  products: string;
  productCenterTitle: string;
  productCenterSummary: string;
  productCategory: string;
  productDetail: string;
  overview: string;
  features: string;
  applications: string;
  images: string;
  imagesTitle: string;
  imagesText: string;
  mainView: string;
  mainViewText: string;
  galleryView: string;
  galleryViewText: string;
  installationView: string;
  installationViewText: string;
  principle: string;
  principleText: string;
  installation: string;
  installationText: string;
  options: string;
  optionsText: string;
  technicalParameters: string;
  technicalParametersTitle: string;
  technicalParametersText: string;
  confirm: string;
  selectionGuide: string;
  selectionGuideText: string;
  operatingConditions: string;
  operatingConditionsText: string;
  maintenance: string;
  maintenanceText: string;
  spares: string;
  sparesText: string;
  packaging: string;
  packagingText: string;
  downloads: string;
  downloadsText: string;
  downloadQuestionnaire: string;
  faq: [string, string][];
  related: string;
  relatedTitle: string;
  viewProduct: string;
  relatedIndustries: string;
  relatedIndustriesText: string;
  viewIndustries: string;
  relatedSolutions: string;
  relatedSolutionsText: string;
  viewSolutions: string;
  technicalSupport: string;
  technicalSupportText: string;
  viewSupport: string;
  quote: string;
  quoteTitle: string;
  fullQuote: string;
}> = {
  "es-cl": {
    products: "Productos",
    productCenterTitle: "Centro de productos magneticos",
    productCenterSummary: "Categorias y productos sincronizados desde cowinmagnet.com, adaptados para consultas tecnicas en Chile y LATAM.",
    productCategory: "Categoria de producto",
    productDetail: "Detalle de producto",
    overview: "Descripcion general",
    features: "Caracteristicas principales",
    applications: "Aplicaciones principales",
    images: "Imagenes del producto",
    imagesTitle: "Imagenes reales sincronizadas del catalogo principal",
    imagesText: "Las fotos vienen del catalogo principal de Cowinmagnet. La configuracion final se valida por proyecto.",
    mainView: "Vista principal",
    mainViewText: "Referencia visual principal del equipo.",
    galleryView: "Vista adicional",
    galleryViewText: "Imagen adicional disponible en la galeria del producto.",
    installationView: "Instalacion",
    installationViewText: "La posicion final se confirma con layout, altura, flujo y estructura disponible.",
    principle: "Principio de funcionamiento",
    principleText: "El equipo usa un campo magnetico para atraer o separar contaminantes ferrosos del flujo de material. La eficiencia depende de distancia, granulometria, velocidad, espesor de capa y propiedades del contaminante.",
    installation: "Opciones de instalacion",
    installationText: "Puede revisarse instalacion transversal, en linea, sobre chute o en punto de transferencia. La estructura, acceso de limpieza y seguridad se validan antes de cotizar.",
    options: "Configuraciones opcionales",
    optionsText: "Gabinete de control, proteccion exterior, tratamiento anticorrosion, autolimpieza, sensores, enfriamiento y tension/frecuencia se confirman por proyecto.",
    technicalParameters: "Parametros tecnicos",
    technicalParametersTitle: "Parametros tecnicos a confirmar",
    technicalParametersText: "No se publican valores inventados. Estos campos definen la hoja tecnica y la cotizacion.",
    confirm: "Confirmar con datos del proyecto",
    selectionGuide: "Guia de seleccion",
    selectionGuideText: "Enviar material, tamano maximo, capacidad, ancho y velocidad de cinta, espesor de capa, altura de suspension, contaminante, altitud, temperatura, voltaje, frecuencia y fases.",
    operatingConditions: "Condiciones de operacion",
    operatingConditionsText: "Polvo, humedad, corrosion, trabajo exterior, altitud, temperatura y regimen de operacion pueden cambiar la seleccion del sistema magnetico y gabinete.",
    maintenance: "Mantenimiento",
    maintenanceText: "Revisar limpieza, banda autolimpiante, rodamientos, fijaciones, gabinete, cables y acumulacion de material segun plan operativo del sitio.",
    spares: "Repuestos",
    sparesText: "Bandas, rodillos, rodamientos, raspadores, sensores, componentes electricos y piezas de desgaste se definen por modelo y ambiente.",
    packaging: "Embalaje y envio",
    packagingText: "El embalaje, puerto, dimensiones, peso, proteccion anticorrosion y documentacion de exportacion se confirman antes del despacho.",
    downloads: "Descargas",
    downloadsText: "Use los cuestionarios descargables para preparar datos tecnicos antes de solicitar seleccion.",
    downloadQuestionnaire: "Descargar cuestionario",
    faq: [["Hay stock local?", "No se declara stock local sin evidencia."], ["Se puede adaptar OEM/ODM?", "Se puede coordinar segun alcance y validacion tecnica."], ["Que datos necesito?", "Material, cinta, altura, capacidad, contaminante y condiciones ambientales."]],
    related: "Relacionados",
    relatedTitle: "Productos relacionados",
    viewProduct: "Ver producto",
    relatedIndustries: "Industrias relacionadas",
    relatedIndustriesText: "Mineria, transportadores, cemento, agregados, reciclaje y manejo de graneles.",
    viewIndustries: "Ver industrias",
    relatedSolutions: "Soluciones relacionadas",
    relatedSolutionsText: "Eliminacion de hierro trampa, proteccion de chancadores, proteccion de cintas y autolimpieza.",
    viewSolutions: "Ver soluciones",
    technicalSupport: "Soporte tecnico",
    technicalSupportText: "Revise guias de seleccion, instalacion, mantenimiento y descargas.",
    viewSupport: "Ver soporte tecnico",
    quote: "Cotizacion",
    quoteTitle: "Formulario de cotizacion",
    fullQuote: "Solicitar cotizacion completa"
  },
  es: {} as never,
  "pt-br": {
    products: "Produtos",
    productCenterTitle: "Centro de produtos magneticos",
    productCenterSummary: "Categorias e produtos sincronizados de cowinmagnet.com, adaptados para consultas tecnicas no Brasil e LATAM.",
    productCategory: "Categoria de produto",
    productDetail: "Detalhe do produto",
    overview: "Visao geral",
    features: "Principais caracteristicas",
    applications: "Aplicacoes principais",
    images: "Imagens do produto",
    imagesTitle: "Imagens reais sincronizadas do catalogo principal",
    imagesText: "As fotos vem do catalogo principal da Cowinmagnet. A configuracao final e validada por projeto.",
    mainView: "Vista principal",
    mainViewText: "Referencia visual principal do equipamento.",
    galleryView: "Vista adicional",
    galleryViewText: "Imagem adicional disponivel na galeria do produto.",
    installationView: "Instalacao",
    installationViewText: "A posicao final e confirmada com layout, altura, fluxo e estrutura disponivel.",
    principle: "Principio de funcionamento",
    principleText: "O equipamento usa um campo magnetico para atrair ou separar contaminantes ferrosos do fluxo de material. A eficiencia depende de distancia, granulometria, velocidade, camada de material e propriedades do contaminante.",
    installation: "Opcoes de instalacao",
    installationText: "Podem ser avaliadas instalacoes transversais, em linha, sobre chute ou em ponto de transferencia. Estrutura, acesso de limpeza e seguranca sao validados antes da cotacao.",
    options: "Configuracoes opcionais",
    optionsText: "Painel de controle, protecao externa, tratamento anticorrosivo, autolimpeza, sensores, resfriamento e tensao/frequencia sao confirmados por projeto.",
    technicalParameters: "Parametros tecnicos",
    technicalParametersTitle: "Parametros tecnicos a confirmar",
    technicalParametersText: "Valores nao sao inventados. Estes campos definem a ficha tecnica e a cotacao.",
    confirm: "Confirmar com dados do projeto",
    selectionGuide: "Guia de selecao",
    selectionGuideText: "Enviar material, tamanho maximo, capacidade, largura e velocidade da correia, camada de material, altura de suspensao, contaminante, altitude, temperatura, tensao, frequencia e fases.",
    operatingConditions: "Condicoes de operacao",
    operatingConditionsText: "Poeira, umidade, corrosao, trabalho externo, altitude, temperatura e regime de operacao podem alterar a selecao do sistema magnetico e painel.",
    maintenance: "Manutencao",
    maintenanceText: "Revisar limpeza, correia autolimpante, rolamentos, fixacoes, painel, cabos e acumulacao de material conforme o plano operacional.",
    spares: "Pecas de reposicao",
    sparesText: "Correias, rolos, rolamentos, raspadores, sensores, componentes eletricos e pecas de desgaste sao definidos por modelo e ambiente.",
    packaging: "Embalagem e envio",
    packagingText: "Embalagem, porto, dimensoes, peso, protecao anticorrosiva e documentos de exportacao sao confirmados antes do despacho.",
    downloads: "Downloads",
    downloadsText: "Use os questionarios para preparar dados tecnicos antes de solicitar selecao.",
    downloadQuestionnaire: "Baixar questionario",
    faq: [["Ha estoque local?", "Nao declaramos estoque local sem evidencia."], ["Pode adaptar OEM/ODM?", "Pode ser coordenado conforme escopo e validacao tecnica."], ["Quais dados preciso?", "Material, correia, altura, capacidade, contaminante e condicoes ambientais."]],
    related: "Relacionados",
    relatedTitle: "Produtos relacionados",
    viewProduct: "Ver produto",
    relatedIndustries: "Industrias relacionadas",
    relatedIndustriesText: "Mineracao, transportadores, cimento, agregados, reciclagem e manuseio de granels.",
    viewIndustries: "Ver industrias",
    relatedSolutions: "Solucoes relacionadas",
    relatedSolutionsText: "Remocao de ferro tramp, protecao de britadores, protecao de correias e autolimpeza.",
    viewSolutions: "Ver solucoes",
    technicalSupport: "Suporte tecnico",
    technicalSupportText: "Revise guias de selecao, instalacao, manutencao e downloads.",
    viewSupport: "Ver suporte tecnico",
    quote: "Cotacao",
    quoteTitle: "Formulario de cotacao",
    fullQuote: "Solicitar cotacao completa"
  },
  en: {
    products: "Products",
    productCenterTitle: "Magnetic product center",
    productCenterSummary: "Categories and products synced from cowinmagnet.com for technical inquiries in Chile and LATAM.",
    productCategory: "Product Category",
    productDetail: "Product Detail",
    overview: "Product overview",
    features: "Main features",
    applications: "Main applications",
    images: "Product Images",
    imagesTitle: "Real images synced from the main catalog",
    imagesText: "Photos come from the Cowinmagnet main catalog. Final configuration is validated by project.",
    mainView: "Main view",
    mainViewText: "Main visual reference for the equipment.",
    galleryView: "Additional view",
    galleryViewText: "Additional image available in the product gallery.",
    installationView: "Installation",
    installationViewText: "Final position is confirmed with layout, height, flow and available structure.",
    principle: "Working principle",
    principleText: "The equipment uses a magnetic field to attract or separate ferrous contaminants from material flow. Efficiency depends on distance, particle size, speed, burden depth and contaminant properties.",
    installation: "Installation options",
    installationText: "Cross-belt, inline, chute-mounted or transfer-point installation can be reviewed. Structure, cleaning access and safety are validated before quotation.",
    options: "Optional configurations",
    optionsText: "Control cabinet, outdoor protection, anti-corrosion treatment, self-cleaning, sensors, cooling, voltage and frequency are confirmed by project.",
    technicalParameters: "Technical Parameters",
    technicalParametersTitle: "Technical parameters to confirm",
    technicalParametersText: "No invented values are published. These fields define the datasheet and quotation.",
    confirm: "Confirm with project data",
    selectionGuide: "Selection guide",
    selectionGuideText: "Send material, max size, capacity, belt width and speed, burden depth, suspension height, contaminant, altitude, temperature, voltage, frequency and phases.",
    operatingConditions: "Operating conditions",
    operatingConditionsText: "Dust, moisture, corrosion, outdoor work, altitude, temperature and duty cycle can change the magnetic system and cabinet selection.",
    maintenance: "Maintenance",
    maintenanceText: "Review cleaning, self-cleaning belt, bearings, fixings, cabinet, cables and material buildup according to the site operation plan.",
    spares: "Spare parts",
    sparesText: "Belts, rollers, bearings, scrapers, sensors, electrical parts and wear parts are defined by model and environment.",
    packaging: "Packing and shipping",
    packagingText: "Packing, port, dimensions, weight, anti-corrosion protection and export documents are confirmed before dispatch.",
    downloads: "Downloads",
    downloadsText: "Use downloadable questionnaires to prepare technical data before requesting selection.",
    downloadQuestionnaire: "Download questionnaire",
    faq: [["Is there local stock?", "Local stock is not claimed without evidence."], ["Can OEM/ODM be adapted?", "It can be coordinated by scope and technical validation."], ["What data is needed?", "Material, belt, height, capacity, contaminant and environmental conditions."]],
    related: "Related",
    relatedTitle: "Related products",
    viewProduct: "View product",
    relatedIndustries: "Related industries",
    relatedIndustriesText: "Mining, conveyors, cement, aggregates, recycling and bulk handling.",
    viewIndustries: "View industries",
    relatedSolutions: "Related solutions",
    relatedSolutionsText: "Tramp iron removal, crusher protection, belt protection and self-cleaning.",
    viewSolutions: "View solutions",
    technicalSupport: "Technical support",
    technicalSupportText: "Review selection, installation, maintenance and download guides.",
    viewSupport: "View technical support",
    quote: "Quote",
    quoteTitle: "Quotation form",
    fullQuote: "Request full quotation"
  }
};

productCopy.es = productCopy["es-cl"];

export const industries = [
  "mineria-de-cobre",
  "mineria-de-hierro",
  "reciclaje",
  "cantera-y-aridos",
  "cemento",
  "sistemas-de-transporte",
  "puertos-y-terminales"
].map((slug) => ({
  slug,
  title: slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
  summary: "Problemas comunes, riesgos para trituradoras y cintas, equipos recomendados y factores de seleccion.",
  image: {
    "mineria-de-cobre": "/assets/markets/chile-copper-ore.jpg",
    "mineria-de-hierro": "/assets/markets/brazil-iron-ore.jpg",
    reciclaje: "/assets/markets/uruguay-recycling-line.jpg",
    "cantera-y-aridos": "/assets/markets/paraguay-aggregate-line.jpg",
    cemento: "/assets/markets/argentina-limestone.jpg",
    "sistemas-de-transporte": "/assets/markets/calama-copper.jpg",
    "puertos-y-terminales": "/assets/markets/colombia-coal.jpg"
  }[slug] ?? "/assets/markets/markets-hero.jpg"
}));

export const solutions = [
  "eliminacion-de-hierro-trampa",
  "proteccion-de-chancadores",
  "proteccion-de-cintas",
  "recuperacion-de-metales-ferrosos",
  "auto-limpieza",
  "aplicaciones-mineria-pesada",
  "altas-altitudes",
  "ambientes-polvorientos"
].map((slug) => ({
  slug,
  title: slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
  summary: "Problema del cliente, equipo recomendado, parametros de seleccion, productos relacionados y CTA.",
  image: {
    "recuperacion-de-metales-ferrosos": "/assets/markets/uruguay-recycling-line.jpg",
    "altas-altitudes": "/assets/markets/antofagasta-copper.jpg",
    "ambientes-polvorientos": "/assets/markets/argentina-limestone.jpg"
  }[slug] ?? "/assets/markets/chile-copper-ore.jpg"
}));

export const markets = [
  {
    slug: "chile",
    title: "Chile",
    summary: "Cobre, litio, correas transportadoras de alta exigencia, polvo, altitud y logistica minera.",
    image: "/assets/markets/chile-copper-ore.jpg"
  },
  {
    slug: "peru",
    title: "Peru",
    summary: "Mineria andina, cobre, oro, chancado, transporte de mineral y proteccion de equipos.",
    image: "/assets/markets/peru-gold-ore.jpg"
  },
  {
    slug: "brazil",
    title: "Brazil",
    summary: "Mineral de hierro, agregados, puertos, reciclaje industrial y lineas de gran tonelaje.",
    image: "/assets/markets/brazil-iron-ore.jpg"
  },
  {
    slug: "argentina",
    title: "Argentina",
    summary: "Litio, aridos, cemento, canteras y aplicaciones de separacion para materiales industriales.",
    image: "/assets/markets/argentina-limestone.jpg"
  },
  {
    slug: "bolivia",
    title: "Bolivia",
    summary: "Minerales metalicos, manganeso, altura, polvo y seleccion magnetica para procesos mineros.",
    image: "/assets/markets/bolivia-manganese-ore.jpg"
  },
  {
    slug: "colombia",
    title: "Colombia",
    summary: "Carbon, agregados, puertos, transportadores y proteccion contra hierro trampa.",
    image: "/assets/markets/colombia-coal.jpg"
  },
  {
    slug: "ecuador",
    title: "Ecuador",
    summary: "Mineria, cuarzo, agregados y lineas de procesamiento con control de contaminacion ferrosa.",
    image: "/assets/markets/ecuador-quartz-sand.jpg"
  },
  {
    slug: "uruguay",
    title: "Uruguay",
    summary: "Reciclaje, manejo de residuos, materiales industriales y recuperacion de metales.",
    image: "/assets/markets/uruguay-recycling-line.jpg"
  },
  {
    slug: "paraguay",
    title: "Paraguay",
    summary: "Agregados, construccion, reciclaje y plantas de procesamiento de materiales.",
    image: "/assets/markets/paraguay-aggregate-line.jpg"
  }
];

export const chileRegions = [
  {
    slug: "antofagasta",
    country: "chile",
    title: "Antofagasta",
    summary: "Region minera de cobre con alta exigencia en correas, polvo, altitud y continuidad operacional.",
    image: "/assets/markets/antofagasta-copper.jpg"
  },
  {
    slug: "calama",
    country: "chile",
    title: "Calama",
    summary: "Aplicaciones de transporte de mineral, chancado y separacion magnetica en entorno desertico.",
    image: "/assets/markets/calama-copper.jpg"
  },
  {
    slug: "atacama",
    country: "chile",
    title: "Atacama",
    summary: "Mineria metalica, polvo, altura y seleccion de equipos para puntos de transferencia.",
    image: "/assets/markets/atacama-gold.jpg"
  },
  {
    slug: "coquimbo",
    country: "chile",
    title: "Coquimbo",
    summary: "Minerales, agregados y correas transportadoras con necesidad de proteccion de chancadores.",
    image: "/assets/markets/coquimbo-iron.jpg"
  },
  {
    slug: "santiago",
    country: "chile",
    title: "Santiago",
    summary: "Reciclaje, servicios industriales, bodegas tecnicas y coordinacion logistica nacional.",
    image: "/assets/markets/santiago-recycling.jpg"
  }
];
