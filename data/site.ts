export const locales = ["es-cl", "es", "pt-br", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es-cl";

export const siteConfig = {
  siteId: "cowinmagnet_latam",
  brand: "Cowinmagnet",
  company: "Quzhou Qiying Import & Export Co., Ltd.",
  companyCn: "衢州市企赢进出口有限公司",
  globalSite: "https://www.cowinmagnet.com",
  defaultCurrency: "USD",
  whatsapp: "8615665135205",
  email: "davidsha@cowinmagnet.com"
};

export const localeLabels: Record<Locale, string> = {
  "es-cl": "Espanol CL",
  es: "Espanol",
  "pt-br": "Portugues BR",
  en: "English"
};

export function t(locale: Locale, es: string, pt = es, en = es) {
  if (locale === "pt-br") return pt;
  if (locale === "en") return en;
  return es;
}

export function localizedPath(locale: Locale, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

export const uiText: Record<Locale, {
  nav: {
    home: string;
    products: string;
    applications: string;
    markets: string;
    news: string;
    about: string;
    quote: string;
    productCenter: string;
    productTitle: string;
    productText: string;
    viewProducts: string;
    categories: string;
    buyerPaths: string;
    beforeQuote: string;
    beforeQuoteText: string;
    sendRequirement: string;
    applicationsTitle: string;
    applicationsText: string;
    viewApplications: string;
    industries: string;
    solutions: string;
    support: string;
    practicalSupport: string;
  };
  quotePage: {
    eyebrow: string;
    title: string;
    summary: string;
  };
  quoteForm: {
    reviewRequired: string;
    sending: string;
    failed: string;
    success: string;
    connectError: string;
    name: string;
    country: string;
    select: string;
    phone: string;
    email: string;
    product: string;
    productPlaceholder: string;
    material: string;
    materialPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    optional: string;
    company: string;
    region: string;
    industry: string;
    capacity: string;
    beltWidth: string;
    suspensionHeight: string;
    installation: string;
    cleaning: string;
    voltage: string;
    language: string;
    attachments: string;
    consent: string;
    submit: string;
    submitting: string;
  };
  footer: {
    quoteSupport: string;
    cta: string;
    quote: string;
    description: string;
    explore: string;
    contacts: string;
  };
}> = {
  "es-cl": {
    nav: {
      home: "Inicio",
      products: "Productos",
      applications: "Aplicaciones",
      markets: "Mercados",
      news: "Noticias",
      about: "Nosotros",
      quote: "Cotizar",
      productCenter: "Centro de productos",
      productTitle: "Equipos de separacion magnetica para Sudamerica",
      productText: "88 productos Cowinmagnet sincronizados: separadores suspendidos, humedos/secos, reciclaje, filtros magneticos y equipos industriales.",
      viewProducts: "Ver productos",
      categories: "Categorias",
      buyerPaths: "Rutas comunes",
      beforeQuote: "Antes de cotizar",
      beforeQuoteText: "Datos utiles: material, capacidad, ancho de cinta, altura de instalacion, contaminante y voltaje del sitio.",
      sendRequirement: "Enviar requerimiento",
      applicationsTitle: "Industrias, soluciones y soporte de seleccion",
      applicationsText: "Parta desde el problema real: proteccion de chancadores, hierro trampa, recuperacion en reciclaje, polvo o mineria en altura.",
      viewApplications: "Ver aplicaciones",
      industries: "Industrias",
      solutions: "Soluciones",
      support: "Soporte tecnico",
      practicalSupport: "Soporte practico"
    },
    quotePage: {
      eyebrow: "Solicitud de cotizacion",
      title: "Solicitud de cotizacion tecnica",
      summary: "Formulario simple para recopilar datos utiles: producto, material, pais, contacto y descripcion breve."
    },
    quoteForm: {
      reviewRequired: "Revise los campos obligatorios.",
      sending: "Enviando solicitud...",
      failed: "No se pudo enviar la solicitud.",
      success: "Solicitud guardada",
      connectError: "No se pudo conectar con el servidor.",
      name: "Nombre",
      country: "Pais",
      select: "Seleccionar",
      phone: "WhatsApp o telefono",
      email: "Correo",
      product: "Producto o necesidad",
      productPlaceholder: "Separador magnetico, detector, reciclaje...",
      material: "Material o industria",
      materialPlaceholder: "Cobre, hierro, aridos, reciclaje...",
      message: "Mensaje breve",
      messagePlaceholder: "Cuente en 2-3 lineas que quiere separar, proteger o cotizar.",
      optional: "Agregar datos tecnicos opcionales",
      company: "Empresa",
      region: "Ciudad o region",
      industry: "Industria",
      capacity: "Capacidad",
      beltWidth: "Ancho de cinta",
      suspensionHeight: "Altura de instalacion",
      installation: "Instalacion",
      cleaning: "Limpieza",
      voltage: "Voltaje",
      language: "Idioma preferido",
      attachments: "Archivos adjuntos",
      consent: "Acepto que Cowinmagnet use estos datos para responder mi consulta.",
      submit: "Enviar solicitud",
      submitting: "Enviando..."
    },
    footer: {
      quoteSupport: "Soporte de cotizacion",
      cta: "Seleccione el equipo correcto con datos reales del proyecto.",
      quote: "Solicitar cotizacion",
      description: "Proveedor de soluciones de separacion magnetica y socio exportador para proyectos mineros e industriales en Sudamerica.",
      explore: "Explorar",
      contacts: "Contactos"
    }
  },
  es: {} as never,
  "pt-br": {
    nav: {
      home: "Inicio",
      products: "Produtos",
      applications: "Aplicacoes",
      markets: "Mercados",
      news: "Noticias",
      about: "Sobre",
      quote: "Solicitar Cotacao",
      productCenter: "Centro de produtos",
      productTitle: "Equipamentos de separacao magnetica para a America do Sul",
      productText: "88 produtos Cowinmagnet sincronizados: separadores suspensos, umidos/secos, reciclagem, filtros magneticos e equipamentos industriais.",
      viewProducts: "Ver produtos",
      categories: "Categorias",
      buyerPaths: "Caminhos comuns",
      beforeQuote: "Antes da cotacao",
      beforeQuoteText: "Dados uteis: material, capacidade, largura da correia, altura de instalacao, contaminante e tensao do local.",
      sendRequirement: "Enviar requisito",
      applicationsTitle: "Industrias, solucoes e suporte de selecao",
      applicationsText: "Comece pelo problema real: protecao de britadores, ferro tramp, recuperacao na reciclagem, poeira ou mineracao em altitude.",
      viewApplications: "Ver aplicacoes",
      industries: "Industrias",
      solutions: "Solucoes",
      support: "Suporte tecnico",
      practicalSupport: "Suporte pratico"
    },
    quotePage: {
      eyebrow: "Solicitacao de cotacao",
      title: "Solicitacao de cotacao tecnica",
      summary: "Formulario simples para coletar dados uteis: produto, material, pais, contato e uma breve descricao."
    },
    quoteForm: {
      reviewRequired: "Revise os campos obrigatorios.",
      sending: "Enviando solicitacao...",
      failed: "Nao foi possivel enviar a solicitacao.",
      success: "Solicitacao salva",
      connectError: "Nao foi possivel conectar ao servidor.",
      name: "Nome",
      country: "Pais",
      select: "Selecionar",
      phone: "WhatsApp ou telefone",
      email: "Email",
      product: "Produto ou necessidade",
      productPlaceholder: "Separador magnetico, detector, reciclagem...",
      material: "Material ou industria",
      materialPlaceholder: "Cobre, ferro, agregados, reciclagem...",
      message: "Mensagem breve",
      messagePlaceholder: "Conte em 2-3 linhas o que deseja separar, proteger ou cotar.",
      optional: "Adicionar dados tecnicos opcionais",
      company: "Empresa",
      region: "Cidade ou regiao",
      industry: "Industria",
      capacity: "Capacidade",
      beltWidth: "Largura da correia",
      suspensionHeight: "Altura de instalacao",
      installation: "Instalacao",
      cleaning: "Limpeza",
      voltage: "Tensao",
      language: "Idioma preferido",
      attachments: "Anexos",
      consent: "Aceito que a Cowinmagnet use estes dados para responder minha consulta.",
      submit: "Enviar solicitacao",
      submitting: "Enviando..."
    },
    footer: {
      quoteSupport: "Suporte de cotacao",
      cta: "Selecione o equipamento correto com dados reais do projeto.",
      quote: "Solicitar cotacao",
      description: "Fornecedor de solucoes de separacao magnetica e parceiro exportador para projetos de mineracao e industria na America do Sul.",
      explore: "Explorar",
      contacts: "Contatos"
    }
  },
  en: {
    nav: {
      home: "Home",
      products: "Products",
      applications: "Applications",
      markets: "Markets",
      news: "News",
      about: "About",
      quote: "Request a Quote",
      productCenter: "Product Center",
      productTitle: "Magnetic separation equipment for South America",
      productText: "88 synced Cowinmagnet products across suspended magnets, wet/dry separators, recycling sorting, magnetic filters and industrial equipment.",
      viewProducts: "View products",
      categories: "Categories",
      buyerPaths: "Common buyer paths",
      beforeQuote: "Before quotation",
      beforeQuoteText: "Useful data: material, capacity, belt width, installation height, contamination type and site voltage.",
      sendRequirement: "Send project requirement",
      applicationsTitle: "Industries, solutions and selection support",
      applicationsText: "Start from the site problem: crusher protection, tramp iron removal, recycling recovery, dusty plants or high-altitude mining.",
      viewApplications: "View applications",
      industries: "Industries",
      solutions: "Solutions",
      support: "Technical Support",
      practicalSupport: "Practical support"
    },
    quotePage: {
      eyebrow: "Request a Quote",
      title: "Technical quotation request",
      summary: "A simple form to collect useful information: product, material, country, contact and a short project note."
    },
    quoteForm: {
      reviewRequired: "Please review the required fields.",
      sending: "Sending request...",
      failed: "Could not send the request.",
      success: "Request saved",
      connectError: "Could not connect to the server.",
      name: "Name",
      country: "Country",
      select: "Select",
      phone: "WhatsApp or phone",
      email: "Email",
      product: "Product or need",
      productPlaceholder: "Magnetic separator, detector, recycling...",
      material: "Material or industry",
      materialPlaceholder: "Copper, iron, aggregates, recycling...",
      message: "Short message",
      messagePlaceholder: "Tell us in 2-3 lines what you need to separate, protect or quote.",
      optional: "Add optional technical data",
      company: "Company",
      region: "City or region",
      industry: "Industry",
      capacity: "Capacity",
      beltWidth: "Belt width",
      suspensionHeight: "Installation height",
      installation: "Installation",
      cleaning: "Cleaning",
      voltage: "Voltage",
      language: "Preferred language",
      attachments: "Attachments",
      consent: "I agree that Cowinmagnet may use this information to respond to my inquiry.",
      submit: "Send request",
      submitting: "Sending..."
    },
    footer: {
      quoteSupport: "Quote Support",
      cta: "Select the right equipment with real project data.",
      quote: "Request a Quote",
      description: "Magnetic separation equipment solution provider and export partner for South America mining and industrial projects.",
      explore: "Explore",
      contacts: "Contacts"
    }
  }
};

uiText.es = uiText["es-cl"];
