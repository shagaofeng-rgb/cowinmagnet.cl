import { Locale, localizedPath } from "./site";

type CopySet = Record<Locale, string>;

export type BriefProduct = {
  model: string;
  title: string;
  image: string;
  summary: string;
  href?: string;
};

export type BriefProductGroup = {
  id: string;
  title: CopySet;
  summary: CopySet;
  products: BriefProduct[];
};

const productBase = "/assets/brief";

export const briefProductGroups: BriefProductGroup[] = [
  {
    id: "suspended",
    title: {
      "es-cl": "Equipos suspendidos y autolimpiantes para retiro de hierro",
      es: "Equipos suspendidos y autolimpiantes para retiro de hierro",
      "pt-br": "Equipamentos suspensos e autolimpantes para remocao de ferro",
      en: "Suspended and self-cleaning iron removal equipment"
    },
    summary: {
      "es-cl": "Soluciones para instalar sobre cintas transportadoras, chutes y puntos de transferencia.",
      es: "Soluciones para instalar sobre cintas transportadoras, chutes y puntos de transferencia.",
      "pt-br": "Solucoes para instalacao sobre correias, chutes e pontos de transferencia.",
      en: "Solutions for installation above conveyors, chutes and transfer points."
    },
    products: [
      { model: "RCYB", title: "Permanent suspended magnetic separator", image: `${productBase}/rcyb-permanent-suspended-magnet.png`, summary: "Manual-cleaning permanent magnet for low to medium tramp iron content.", href: "products/suspended-self-unloading-iron-removers/rcyb-type-permanent-magnet-manual-iron-remover" },
      { model: "RCYD", title: "Self-cleaning permanent magnetic separator", image: `${productBase}/rcyd-self-cleaning-permanent-magnet.jpg`, summary: "Automatic iron discharge for continuous conveyor operation.", href: "products/suspended-self-unloading-iron-removers/rcyd-type-permanent-magnet-self-dumping-iron-remover" },
      { model: "RCDB", title: "Suspended electromagnetic separator", image: `${productBase}/rcdb-suspended-electromagnetic-separator.png`, summary: "Electromagnetic iron removal for powder or block non-magnetic material.", href: "products/suspended-self-unloading-iron-removers/rcdb-type-self-cooling-plate-electromagnetic-iron-remover" },
      { model: "RCDD", title: "Self-cleaning electromagnetic separator", image: `${productBase}/rcdd-self-cleaning-electromagnetic-separator.png`, summary: "Self-discharging electromagnetic separator for demanding conveyor lines.", href: "products/suspended-self-unloading-iron-removers/rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover" },
      { model: "RCDA", title: "Air-cooled suspended electromagnetic separator", image: `${productBase}/rcda-air-cooled-suspended-electromagnetic-separator.png`, summary: "Air-cooled design for outdoor and light-dust operating environments.", href: "products/suspended-self-unloading-iron-removers/rcda-type-air-cooled-electromagnetic-iron-remover" },
      { model: "RCDE", title: "Oil-cooled suspended electromagnetic separator", image: `${productBase}/rcde-oil-cooled-suspended-electromagnetic-separator.png`, summary: "Oil-cooled electromagnetic design for stable long-running magnetic force.", href: "products/suspended-self-unloading-iron-removers/rcde-type-oil-cooled-electromagnetic-iron-remover" },
      { model: "RCDC", title: "Air-cooled self-cleaning electromagnetic separator", image: `${productBase}/rcdc-air-cooled-self-cleaning-electromagnetic-separator.png`, summary: "Air-cooled self-discharging unit for automatic tramp iron removal.", href: "products/suspended-self-unloading-iron-removers/rcdc-type-air-cooled-self-dumping-electromagnetic-iron-remover" },
      { model: "RCDF", title: "Oil-cooled self-cleaning electromagnetic separator", image: `${productBase}/rcdf-oil-cooled-self-cleaning-electromagnetic-separator.png`, summary: "Oil-cooled self-discharging separator for high-duty conveyor systems.", href: "products/suspended-self-unloading-iron-removers/rcdf-oil-cooled-self-dumping-electromagnetic-iron-remover" }
    ]
  },
  {
    id: "separation",
    title: {
      "es-cl": "Equipos de separacion magnetica",
      es: "Equipos de separacion magnetica",
      "pt-br": "Equipamentos de separacao magnetica",
      en: "Magnetic separation equipment"
    },
    summary: {
      "es-cl": "Equipos para preconcentracion, separacion humeda, separacion seca y recuperacion de minerales.",
      es: "Equipos para preconcentracion, separacion humeda, separacion seca y recuperacion de minerales.",
      "pt-br": "Equipamentos para pre-concentracao, separacao umida, separacao seca e recuperacao mineral.",
      en: "Equipment for pre-concentration, wet separation, dry separation and mineral recovery."
    },
    products: [
      { model: "CT", title: "Permanent magnetic drum", image: `${productBase}/ct-permanent-magnetic-drum.png`, summary: "Drum-type magnetic separation for bulk solids and mineral processing.", href: "products/magnetic-separation-equipment/rct-type-fully-magnetic-drum" },
      { model: "CTB", title: "Wet magnetic separator", image: `${productBase}/ctb-wet-magnetic-separator.png`, summary: "Wet magnetic separation for slurry and fine magnetic minerals.", href: "products/magnetic-separation-equipment/ctb-wet-semi-countercurrent-magnetic-separator" },
      { model: "CTDG", title: "Dry magnetic separator", image: `${productBase}/ctdg-dry-magnetic-separator.jpg`, summary: "Dry pre-selection for bulk ore and waste rock separation.", href: "products/magnetic-separation-equipment/ctdg-type-permanent-magnet-bulk-dry-magnetic-separator" },
      { model: "CTZ", title: "Permanent magnetic pulley", image: `${productBase}/ctz-permanent-magnetic-pulley.png`, summary: "Magnetic pulley for conveyor head-end iron removal and recovery.", href: "products/magnetic-separation-equipment/ctz-type-midfield-strong-semi-magnetic-drum" },
      { model: "CXG", title: "Strong magnetic roll separator", image: `${productBase}/cxg-strong-magnetic-roll-separator.jpg`, summary: "High-intensity roll separation for fine particles and weak magnetic minerals.", href: "products/magnetic-separation-equipment/dhj-type-strong-roller-automatic-magnetic-separator" },
      { model: "GTLH", title: "High-gradient magnetic separator", image: `${productBase}/gtlh-high-gradient-magnetic-separator.jpg`, summary: "High-gradient separation for fine mineral processing and purification.", href: "products/magnetic-separation-equipment/hjlh-type-vertical-ring-high-gradient-magnetic-separation" }
    ]
  },
  {
    id: "recycling",
    title: {
      "es-cl": "Deteccion de metal y recuperacion para reciclaje",
      es: "Deteccion de metal y recuperacion para reciclaje",
      "pt-br": "Deteccao de metais e recuperacao para reciclagem",
      en: "Metal detection and recycling recovery"
    },
    summary: {
      "es-cl": "Equipos para proteger trituradoras, detectar metales y separar metales no ferrosos.",
      es: "Equipos para proteger trituradoras, detectar metales y separar metales no ferrosos.",
      "pt-br": "Equipamentos para proteger britadores, detectar metais e separar metais nao ferrosos.",
      en: "Equipment for crusher protection, metal detection and non-ferrous recovery."
    },
    products: [
      { model: "GJT", title: "Metal detector", image: `${productBase}/gjt-metal-detector.png`, summary: "Window-type detector for belt conveyors and process protection.", href: "products/metal-detection-recycling-sorting/gjt-type-window-metal-detector" },
      { model: "ECS", title: "Eddy current separator", image: `${productBase}/ecs-eddy-current-separator.png`, summary: "Non-ferrous metal recovery from recycling and waste processing lines.", href: "products/metal-detection-recycling-sorting/hecs-type-eddy-current-metal-sorting-machine" }
    ]
  },
  {
    id: "components",
    title: {
      "es-cl": "Componentes magneticos y equipos de filtracion",
      es: "Componentes magneticos y equipos de filtracion",
      "pt-br": "Componentes magneticos e equipamentos de filtracao",
      en: "Magnetic components and filtration equipment"
    },
    summary: {
      "es-cl": "Barras, rejillas, cajones, filtros de tuberia y placas magneticas para control de contaminacion metalica.",
      es: "Barras, rejillas, cajones, filtros de tuberia y placas magneticas para control de contaminacion metalica.",
      "pt-br": "Barras, grades, gavetas, filtros de tubulacao e placas magneticas para controle de contaminacao metalica.",
      en: "Bars, grids, drawers, pipeline filters and plates for metal contamination control."
    },
    products: [
      { model: "CG", title: "Magnetic bar", image: `${productBase}/cg-magnetic-bar.jpg`, summary: "Magnetic rod for powder, granule and liquid contact points.", href: "products/magnetic-components-filters/magnetic-rod" },
      { model: "GG", title: "Magnetic grid", image: `${productBase}/gg-magnetic-grid.jpg`, summary: "Grid magnet for hoppers and gravity-fed material streams.", href: "products/magnetic-components-filters/magnetic-grid" },
      { model: "CXC", title: "Drawer magnetic separator", image: `${productBase}/cxc-drawer-magnetic-separator.jpg`, summary: "Drawer-style magnetic filter for dry powder and granular materials.", href: "products/magnetic-components-filters/cbs-drawer-type-magnetic-filter" },
      { model: "GLS", title: "Pipeline magnetic separator", image: `${productBase}/gls-pipeline-magnetic-separator.png`, summary: "Pipeline-style separator for enclosed material flow.", href: "products/magnetic-components-filters/gls-type-integral-channel-metal-separator" },
      { model: "CPB", title: "Permanent magnetic plate", image: `${productBase}/cpb-permanent-magnetic-plate.png`, summary: "Magnetic plate for chutes, ducts and simple iron removal points." }
    ]
  }
];

export const industryMarketRows = [
  {
    industry: "Industria Minera",
    problem: "Proteccion de trituradoras, separacion de minerales, reduccion del contenido de hierro y mejora de la pureza mineral.",
    equipment: "RCYD, RCDD, CTDG, CTB, CXG, GTLH"
  },
  {
    industry: "Canteras y Aridos",
    problem: "Proteccion de trituradoras de mandibula, cono e impacto contra danos causados por metales.",
    equipment: "RCYD, RCDD, CTZ"
  },
  {
    industry: "Industria Cementera",
    problem: "Eliminacion de metales ferrosos y proteccion de trituradoras, molinos y sistemas transportadores.",
    equipment: "RCYD, RCDD, CTZ, GJT"
  },
  {
    industry: "Industria del Reciclaje",
    problem: "Recuperacion de metales ferrosos, proteccion de trituradoras y aumento del valor de materiales reciclados.",
    equipment: "RCYD, RCDD, CT, CTZ, ECS, RSS"
  },
  {
    industry: "Industria Alimentaria",
    problem: "Eliminacion de contaminacion metalica, cumplimiento de normas de seguridad alimentaria y proteccion de calidad.",
    equipment: "CG, GG, CXC, GLS, LCG, GJT"
  },
  {
    industry: "Industria de la Madera",
    problem: "Eliminacion de clavos, tornillos y piezas metalicas para proteger trituradoras, astilladoras y molinos.",
    equipment: "RCYD, CT, CTZ, CPB"
  }
];

export const focusMarkets = ["Chile", "Peru", "Brazil", "Argentina", "Bolivia", "Colombia"];

export const companySections = [
  {
    title: "About Cowin Magnetic",
    paragraphs: [
      "Cowin Magnetic is a professional supplier specializing in magnetic separation equipment and metal recovery solutions. We help customers remove tramp iron, recover valuable ferrous metals, protect processing equipment, and improve production efficiency.",
      "With years of industry experience and reliable manufacturing resources, we provide high-performance magnetic separation equipment for customers in mining, recycling, aggregates, cement, coal processing, food processing, and bulk material handling industries worldwide."
    ]
  },
  {
    title: "Why Choose Cowin",
    bullets: [
      "Application-Based Solutions: customized recommendations based on material characteristics, conveyor system, capacity, and separation objectives.",
      "Reliable Performance: strong magnetic field, stable operation, and long service life for demanding industrial environments.",
      "Fast Response: timely technical support, application guidance, and quotation services.",
      "Customized Manufacturing: magnetic strength, dimensions, installation structure, and special requirements can be adjusted by application.",
      "Global Service: serving customers across Asia, Africa, Europe, the Middle East, and Latin America."
    ]
  },
  {
    title: "Our Commitment",
    paragraphs: [
      "At Cowin Magnetic, we believe that successful cooperation starts with understanding customer requirements.",
      "Our mission is to provide efficient, reliable, and cost-effective magnetic separation solutions that help customers improve productivity, reduce operating costs, and create long-term value."
    ]
  },
  {
    title: "Let's Work Together",
    paragraphs: [
      "Looking for the right magnetic separator for your application? Contact our team today and receive professional recommendations based on your material type, conveyor width, processing capacity, and separation requirements.",
      "We look forward to becoming your trusted partner for magnetic separation and metal recovery solutions."
    ]
  }
];

export function getBriefProductHref(locale: Locale, product: BriefProduct) {
  return product.href ? localizedPath(locale, product.href) : localizedPath(locale, "request-a-quote");
}
