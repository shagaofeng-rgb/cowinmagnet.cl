export const categoryImages = {
  permanent: "/assets/generated/product-permanent-separator.png",
  electro: "/assets/generated/product-electromagnetic-separator.png",
  recycling: "/assets/generated/latam-mining-overband.png",
  components: "/assets/generated/product-magnetic-components.png",
  application: "/assets/generated/application-cement-aggregates.png"
} as const;

export const productCategories = [
  {
    slug: "suspended-self-unloading-iron-removers",
    key: "permanent",
    title: "Suspended & Self-Unloading Iron Removers",
    summary: "Main-site category for suspended permanent, electromagnetic and self-unloading iron removal equipment used above conveyors."
  },
  {
    slug: "magnetic-separation-equipment",
    key: "electro",
    title: "Magnetic Separation Equipment",
    summary: "Main-site category for wet, dry, drum, high-gradient, pipeline and process magnetic separation equipment."
  },
  {
    slug: "metal-detection-recycling-sorting",
    key: "recycling",
    title: "Metal Detection & Recycling Sorting",
    summary: "Main-site category for metal detectors, eddy current separators and recycling sorting equipment."
  },
  {
    slug: "magnetic-components-filters",
    key: "components",
    title: "Magnetic Components & Filters",
    summary: "Main-site category for drawer magnets, grids, rods, traps, filters and magnetic components."
  },
  {
    slug: "industry-application-equipment",
    key: "application",
    title: "Industry Application Equipment",
    summary: "Main-site category for control boxes, explosion-proof equipment, screens and lifting magnets."
  }
] as const;

const mainSiteProductGroups = [
  {
    category: "suspended-self-unloading-iron-removers",
    imageKey: "permanent",
    products: [
      "RCYD type permanent magnet self dumping iron remover",
      "RCDD type self cooling self dumping electromagnetic iron remover",
      "RCYB type permanent magnet manual iron remover",
      "RCDB type self cooling plate electromagnetic iron remover"
    ]
  },
  {
    category: "magnetic-separation-equipment",
    imageKey: "electro",
    products: [
      "Belt High Gradient Magnetic Separator",
      "Disc Magnetic Separator for Tailing",
      "Dry Drum Magnetic Separator",
      "Wet Drum Magnetic Separator",
      "CBZ type rotary automatic magnetic separator",
      "CGB type rotary semi-automatic magnetic separator",
      "CQZ type fully automatic online magnetic separator",
      "CTN wet full countercurrent magnetic separator",
      "CTS type wet co current magnetic separator",
      "CXJ drum type automatic magnetic separator",
      "DCZ type dry fully automatic magnetic separator",
      "GLS type integral channel metal separator",
      "CGT type super strong full magnetic drum",
      "CTZ type midfield strong semi magnetic drum",
      "RCDA type air-cooled electromagnetic iron remover",
      "RCDC type air-cooled self dumping electromagnetic iron remover",
      "RCDE type oil cooled electromagnetic iron remover",
      "RCDF oil cooled self dumping electromagnetic iron remover",
      "RCDFJ type forced oil circulation self dumping electromagnetic iron remover",
      "RCPS self dumping disc type permanent magnet iron remover",
      "RCT type fully magnetic drum",
      "RCYA type inclined pipeline permanent magnet iron remover",
      "RCYDII type permanent magnet self dumping iron remover",
      "RCYE type permanent magnet self dumping iron remover",
      "RCYF type vertical pipeline permanent magnet iron remover",
      "RCYG type pipeline self dumping permanent magnet iron remover",
      "RCYP type permanent magnet manual self dumping iron remover",
      "RCYZ type vertical pipeline permanent magnet iron remover",
      "CQZ type fully automatic online magnetic separation",
      "CTB wet semi countercurrent magnetic separator",
      "DCX wet fully automatic magnetic separator",
      "DCZ type dry fully automatic magnetic separation",
      "GTC wet plate magnetic separator",
      "HJLH wet vertical ring high gradient magnetic separator",
      "HJPC wet disc magnetic separation",
      "CLT type magnetic desliming tank",
      "CTB type semi countercurrent wet selection machine",
      "CTDG type permanent magnet bulk dry magnetic separator",
      "CTN type full countercurrent wet magnetic separator",
      "CTS type downstream wet pre selection machine",
      "CTZS type upward suction magnetic separator",
      "HCG type dry pre selection machine",
      "HJLH type vertical ring high gradient magnetic separation",
      "LJK type magnetic ore special iron remover",
      "NCT type concentrated magnetic separator",
      "WBC semi magnetic tailings recovery machine",
      "CTN type specialized magnetic separator for coal washing",
      "HMDN coal washing special magnetic separator",
      "Suspended Permanent Magnetic Separator",
      "Suspended Electromagnetic Conveyor Belt Separator"
    ]
  },
  {
    category: "metal-detection-recycling-sorting",
    imageKey: "recycling",
    products: [
      "DLS type window metal detector",
      "GJT type window metal detector",
      "HECP eddy current metal sorting machine",
      "HECS type eddy current metal sorting machine",
      "Drum Magnet",
      "Eccentric Eddy Current Separator",
      "Electromagnet Separator",
      "Magnetic Head Pulley",
      "Permanent Overband Magnetic Separator",
      "Stainless Steel Separation Conveyor"
    ]
  },
  {
    category: "magnetic-components-filters",
    imageKey: "components",
    products: [
      "CBS drawer type magnetic filter",
      "CLC type wet slot magnetic filter",
      "CTQ type roller automatic magnetic separator",
      "CYG wet pipeline magnetic filter",
      "RCYZ type pipeline magnetic filter",
      "CLC type slot magnetic filter",
      "DHD type roller type automatic magnetic separator",
      "DHJ type strong roller automatic magnetic separator",
      "QCG wet roller magnetic separator",
      "Drawer Magnet",
      "Hump Magnet",
      "Magnetic Grid",
      "Magnetic Rod",
      "Magnetic Trap",
      "Rotary Pipe Magnet",
      "Strong 6000-16000 Gauss Iron Absorbing Permanent Filter Bar Magnetic Neodymium Rod"
    ]
  },
  {
    category: "industry-application-equipment",
    imageKey: "application",
    products: [
      "High Frequency Screen",
      "KGLA series rectifier control box",
      "KXB mining explosion-proof electromagnetic iron remover control box",
      "QJZ mining explosion-proof permanent magnet iron remover control box",
      "RBCDB explosion-proof disc type electromagnetic iron remover",
      "RBCDD explosion-proof electromagnetic self dumping iron remover",
      "RBCYD explosion-proof permanent magnet self dumping iron remover",
      "Round Electromagnetic Lifting Magnet"
    ]
  }
] as const;

const productSummaries: Record<(typeof productCategories)[number]["slug"], string> = {
  "suspended-self-unloading-iron-removers": "Synced from the Cowinmagnet main catalog for conveyor tramp iron removal. Selection depends on belt width, speed, burden depth, suspension height and site conditions.",
  "magnetic-separation-equipment": "Synced from the Cowinmagnet main catalog for mineral processing, dry/wet separation and process iron removal. Technical values must be confirmed per project.",
  "metal-detection-recycling-sorting": "Synced from the Cowinmagnet main catalog for detection, ferrous/non-ferrous sorting and recycling lines. Application scope must be confirmed with material data.",
  "magnetic-components-filters": "Synced from the Cowinmagnet main catalog for magnetic filters, rods, grids, traps and components. Dimensions and magnetic grade must be confirmed before quotation.",
  "industry-application-equipment": "Synced from the Cowinmagnet main catalog for control, explosion-proof, screening and lifting applications. Configuration depends on working environment and electrical conditions."
};

const productFeatureMap: Record<(typeof productCategories)[number]["slug"], string[]> = {
  "suspended-self-unloading-iron-removers": ["Main-site product line", "Manual or self-unloading configurations", "Selection by conveyor and material data"],
  "magnetic-separation-equipment": ["Main-site product line", "Wet, dry or process separation options", "Parameters verified before quotation"],
  "metal-detection-recycling-sorting": ["Main-site product line", "Detection and sorting for recycling streams", "Material testing recommended"],
  "magnetic-components-filters": ["Main-site product line", "Component integration for process lines", "Dimensions and magnet grade confirmed by drawing"],
  "industry-application-equipment": ["Main-site product line", "Industrial application equipment", "Electrical and site conditions required"]
};

export const products = mainSiteProductGroups.flatMap((group) =>
  group.products.map((title) => ({
    slug: title.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90),
    category: group.category,
    title,
    summary: productSummaries[group.category],
    image: categoryImages[group.imageKey],
    sourceUrl: "https://www.cowinmagnet.com/en/products",
    features: productFeatureMap[group.category],
    applications: ["Mining", "Conveyors", "Aggregates", "Recycling", "Industrial process lines"],
    parameters: ["Material", "Capacity", "Belt width or pipe size", "Installation height or flow condition", "Voltage and frequency", "Operating environment"]
  }))
);

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
  image: slug.includes("cemento") || slug.includes("aridos") ? categoryImages.application : "/assets/generated/latam-mining-overband.png"
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
  image: "/assets/generated/latam-mining-overband.png"
}));

export const markets = [
  "chile",
  "peru",
  "brazil",
  "argentina",
  "bolivia",
  "colombia",
  "ecuador",
  "uruguay",
  "paraguay"
].map((slug) => ({
  slug,
  title: slug[0].toUpperCase() + slug.slice(1),
  summary: "Industrias locales, minerales principales, aplicaciones de cintas, condiciones ambientales y logistica.",
  image: slug === "chile" || slug === "peru" ? "/assets/generated/latam-mining-overband.png" : categoryImages.application
}));

export const chileRegions = ["antofagasta", "calama", "atacama", "coquimbo", "santiago"].map((slug) => ({
  slug,
  country: "chile",
  title: slug[0].toUpperCase() + slug.slice(1),
  summary: "Pagina regional chilena para aplicaciones mineras, condiciones ambientales, logistica y confirmacion electrica."
}));
