export type ProductTruthCard = {
  slug: string;
  model: string;
  esTitle: string;
  equipmentType: string;
  magnetType: "permanente" | "electromagnetico" | "no aplica";
  discharge: "manual" | "autolimpiante" | "proceso continuo" | "no aplica";
  installation: string[];
  principle: string;
  applications: string[];
  options: string[];
  verifiedSpecifications: { label: string; value: string }[];
  selectionInputs: string[];
  limitations: string[];
  faqs: { question: string; answer: string }[];
  reviewedAt: string;
};

const sharedSelection = [
  "Material y granulometria maxima",
  "Capacidad y espesor de la capa",
  "Ancho y velocidad de la cinta",
  "Punto de instalacion y espacio disponible",
  "Contaminante ferroso esperado",
  "Polvo, humedad, temperatura y altitud"
];

export const productTruthCards: Record<string, ProductTruthCard> = {
  "rcyd-type-permanent-magnet-self-dumping-iron-remover": {
    slug: "rcyd-type-permanent-magnet-self-dumping-iron-remover", model: "RCYD",
    esTitle: "Separador magnetico permanente autolimpiante RCYD",
    equipmentType: "Separador magnetico suspendido de sobrebanda",
    magnetType: "permanente", discharge: "autolimpiante",
    installation: ["Sobre cinta transportadora, en disposicion transversal o longitudinal segun el punto de transferencia"],
    principle: "Un circuito magnetico permanente atrae el hierro trampa desde el flujo transportado. Una banda de descarga independiente retira de forma continua el material ferroso capturado fuera de la cinta principal.",
    applications: ["Proteccion de chancadores", "Retiro de hierro trampa en minerales y aridos", "Correas de plantas de reciclaje y manejo de graneles"],
    options: ["Disposicion transversal o longitudinal", "Proteccion anticorrosiva definida por el ambiente", "Configuracion mecanica validada con el espacio disponible"],
    verifiedSpecifications: [{ label: "Serie", value: "RCYD" }, { label: "Fuente magnetica", value: "Imanes permanentes" }, { label: "Descarga de hierro", value: "Banda autolimpiante" }],
    selectionInputs: sharedSelection,
    limitations: ["La distancia de trabajo y la capa de material condicionan la captura", "No se publican fuerza magnetica, capacidad ni dimensiones sin validar el modelo"],
    faqs: [
      { question: "¿El RCYD necesita energia para generar el campo magnetico?", answer: "No. El campo procede de imanes permanentes; el sistema de descarga si utiliza un accionamiento cuya configuracion se confirma por proyecto." },
      { question: "¿Puede instalarse sobre cualquier cinta?", answer: "Debe revisarse ancho, velocidad, capa de material, altura, estructura y espacio de descarga antes de seleccionar el equipo." },
      { question: "¿COWIN mantiene inventario en Chile?", answer: "No se declara inventario local. COWIN coordina seleccion, suministro, control de calidad, exportacion y soporte para proyectos en Chile y Latinoamerica." }
    ], reviewedAt: "2026-08-08"
  },
  "rcyb-type-permanent-magnet-manual-iron-remover": {
    slug: "rcyb-type-permanent-magnet-manual-iron-remover", model: "RCYB",
    esTitle: "Separador magnetico permanente suspendido RCYB de limpieza manual",
    equipmentType: "Separador magnetico suspendido", magnetType: "permanente", discharge: "manual",
    installation: ["Sobre cinta, alimentador o chute, con acceso seguro para limpieza manual"],
    principle: "El circuito magnetico permanente retiene piezas ferrosas. La acumulacion se retira manualmente durante una parada segura del proceso.",
    applications: ["Lineas con carga baja o intermitente de hierro trampa", "Proteccion de equipos aguas abajo"],
    options: ["Disposicion de suspension adaptada a la estructura", "Proteccion superficial segun el ambiente"],
    verifiedSpecifications: [{ label: "Serie", value: "RCYB" }, { label: "Fuente magnetica", value: "Imanes permanentes" }, { label: "Limpieza", value: "Manual" }],
    selectionInputs: sharedSelection,
    limitations: ["Requiere acceso y parada segura para retirar el hierro", "No es la opcion adecuada cuando la carga de hierro exige descarga continua"],
    faqs: [
      { question: "¿Cuando conviene limpieza manual?", answer: "Cuando la presencia de hierro es baja o intermitente y la operacion dispone de una rutina segura de limpieza." },
      { question: "¿Incluye banda de descarga?", answer: "No. Para descarga continua debe evaluarse una serie autolimpiante." },
      { question: "¿Que datos necesita COWIN?", answer: "Material, granulometria, cinta, velocidad, capa, altura, hierro esperado y condiciones del sitio." }
    ], reviewedAt: "2026-08-08"
  },
  "rcdb-type-self-cooling-plate-electromagnetic-iron-remover": {
    slug: "rcdb-type-self-cooling-plate-electromagnetic-iron-remover", model: "RCDB",
    esTitle: "Separador electromagnetico suspendido RCDB de limpieza manual",
    equipmentType: "Electroiman suspendido", magnetType: "electromagnetico", discharge: "manual",
    installation: ["Sobre cinta o punto de transferencia, con acceso para limpieza"],
    principle: "Una bobina energizada crea el campo magnetico que captura hierro trampa. El hierro acumulado se retira manualmente con el equipo desenergizado y bajo un procedimiento seguro.",
    applications: ["Proteccion de chancadores y molinos", "Minerales, carbon y materiales a granel"],
    options: ["Tension y frecuencia segun el proyecto", "Gabinete de control compatible con el alcance electrico", "Proteccion ambiental sujeta a revision tecnica"],
    verifiedSpecifications: [{ label: "Serie", value: "RCDB" }, { label: "Fuente magnetica", value: "Bobina electromagnetica" }, { label: "Limpieza", value: "Manual" }],
    selectionInputs: [...sharedSelection, "Tension y frecuencia disponibles"],
    limitations: ["Requiere alimentacion electrica y control", "Potencia, aislamiento y comportamiento termico se confirman para el modelo seleccionado"],
    faqs: [
      { question: "¿Que diferencia hay frente a un separador permanente?", answer: "El RCDB genera el campo mediante una bobina energizada y requiere alimentacion y control; la alternativa permanente no consume energia para crear el campo." },
      { question: "¿Es autolimpiante?", answer: "No. Esta configuracion es de limpieza manual." },
      { question: "¿Se publica la potencia de la bobina?", answer: "Solo cuando el modelo y las condiciones de operacion han sido verificados por ingenieria de COWIN." }
    ], reviewedAt: "2026-08-08"
  },
  "rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover": {
    slug: "rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover", model: "RCDD",
    esTitle: "Separador electromagnetico autolimpiante RCDD",
    equipmentType: "Separador electromagnetico suspendido de sobrebanda", magnetType: "electromagnetico", discharge: "autolimpiante",
    installation: ["Sobre cinta, transversal o longitudinal, con zona libre para la descarga de hierro"],
    principle: "La bobina electromagnetica atrae el hierro trampa y una banda autolimpiante lo transporta fuera del flujo principal para descarga continua.",
    applications: ["Proteccion continua de chancadores", "Correas con presencia recurrente de hierro trampa", "Mineria, aridos y manejo de graneles"],
    options: ["Tension y frecuencia por proyecto", "Gabinete y proteccion electrica segun alcance", "Configuracion de descarga adaptada al layout"],
    verifiedSpecifications: [{ label: "Serie", value: "RCDD" }, { label: "Fuente magnetica", value: "Bobina electromagnetica" }, { label: "Descarga de hierro", value: "Banda autolimpiante" }],
    selectionInputs: [...sharedSelection, "Tension y frecuencia disponibles", "Regimen de trabajo y acceso de mantenimiento"],
    limitations: ["Requiere alimentacion para bobina y accionamiento", "Potencia, enfriamiento y dimensiones se validan por modelo; no se extrapolan de otras series"],
    faqs: [
      { question: "¿El RCDD trabaja de forma continua?", answer: "La banda de descarga permite retirar el hierro capturado sin limpieza manual periodica, siempre que la seleccion y el mantenimiento sean adecuados." },
      { question: "¿Incluye gabinete de control?", answer: "El alcance electrico y el gabinete se definen en la cotizacion; no se consideran incluidos sin confirmacion escrita." },
      { question: "¿Sirve para gran altitud?", answer: "La altitud y temperatura deben informarse para revisar la capacidad termica y electrica del equipo." }
    ], reviewedAt: "2026-08-08"
  },
  "wet-drum-magnetic-separator": {
    slug: "wet-drum-magnetic-separator", model: "Serie de tambor humedo",
    esTitle: "Separador magnetico de tambor humedo para procesamiento de minerales",
    equipmentType: "Separador magnetico de tambor humedo", magnetType: "permanente", discharge: "proceso continuo",
    installation: ["En circuito de pulpa, con alimentacion y descarga definidas por pruebas de proceso"],
    principle: "El tambor y su sistema magnetico separan particulas magneticamente susceptibles desde una pulpa. La configuracion de estanque y el sentido de flujo dependen del objetivo metalurgico.",
    applications: ["Concentracion o recuperacion de minerales magneticos", "Limpieza de corrientes minerales humedas", "Evaluacion de relaves con fraccion magnetica"],
    options: ["Configuracion de estanque segun el proceso", "Materiales de construccion sujetos a la pulpa y al ambiente"],
    verifiedSpecifications: [{ label: "Proceso", value: "Separacion magnetica humeda" }, { label: "Elemento de separacion", value: "Tambor magnetico" }],
    selectionInputs: ["Mineralogia y susceptibilidad magnetica", "Granulometria y liberacion", "Caudal y porcentaje de solidos", "Objetivo de recuperacion o calidad", "Quimica y temperatura de la pulpa"],
    limitations: ["No se puede prometer recuperacion o ley sin pruebas representativas", "Tipo de estanque, diametro, longitud y campo se confirman por ingenieria"],
    faqs: [
      { question: "¿Puede procesar cualquier relave?", answer: "No. La viabilidad depende de mineralogia, liberacion, granulometria y susceptibilidad magnetica." },
      { question: "¿Que muestra o datos se requieren?", answer: "Analisis mineralogico, granulometria, porcentaje de solidos, caudal, objetivo metalurgico y condiciones de la pulpa." },
      { question: "¿COWIN garantiza una recuperacion?", answer: "No se declara una recuperacion sin ensayo y balance metalurgico representativos." }
    ], reviewedAt: "2026-08-08"
  },
  "dry-drum-magnetic-separator": {
    slug: "dry-drum-magnetic-separator", model: "Serie de tambor seco",
    esTitle: "Separador magnetico de tambor seco para minerales y materiales a granel",
    equipmentType: "Separador magnetico de tambor seco", magnetType: "permanente", discharge: "proceso continuo",
    installation: ["En linea de material seco con alimentacion uniforme y divisores de producto ajustados al ensayo"],
    principle: "El tambor expone el material seco a un campo magnetico y separa las fracciones segun su respuesta magnetica y trayectoria de descarga.",
    applications: ["Preconcentracion de mineral seco", "Retiro o recuperacion de fracciones ferrosas", "Procesamiento de escorias y materiales industriales"],
    options: ["Sistema de alimentacion y divisores de producto", "Proteccion contra polvo segun el sitio"],
    verifiedSpecifications: [{ label: "Proceso", value: "Separacion magnetica en seco" }, { label: "Elemento de separacion", value: "Tambor magnetico" }],
    selectionInputs: ["Mineralogia", "Granulometria", "Humedad", "Caudal", "Distribucion de alimentacion", "Objetivo de separacion"],
    limitations: ["La humedad y la alimentacion no uniforme reducen la estabilidad de separacion", "No se publican resultados sin ensayo del material"],
    faqs: [
      { question: "¿En que se diferencia del tambor humedo?", answer: "Trabaja con material seco; el tambor humedo opera con pulpa y requiere datos de solidos y comportamiento metalurgico." },
      { question: "¿Necesita alimentador?", answer: "La separacion requiere una alimentacion controlada y uniforme; el alcance se define con el layout del proceso." },
      { question: "¿Que datos se usan para seleccionar?", answer: "Mineralogia, granulometria, humedad, caudal, objetivo y pruebas de separabilidad cuando estén disponibles." }
    ], reviewedAt: "2026-08-08"
  },
  "belt-high-gradient-magnetic-separator": {
    slug: "belt-high-gradient-magnetic-separator", model: "Separador de banda de alto gradiente",
    esTitle: "Separador magnetico de banda de alto gradiente",
    equipmentType: "Separador magnetico de alta intensidad", magnetType: "no aplica", discharge: "proceso continuo",
    installation: ["En linea de proceso seco con alimentacion controlada"],
    principle: "Una zona de alto gradiente concentra el campo sobre el material transportado para separar particulas con respuesta magnetica debil. La configuracion exacta debe validarse con ensayo.",
    applications: ["Purificacion de minerales industriales", "Separacion de minerales debilmente magneticos"],
    options: ["Alimentacion y etapas de separacion segun pruebas"],
    verifiedSpecifications: [{ label: "Tipo de proceso", value: "Separacion magnetica de alto gradiente" }],
    selectionInputs: ["Mineralogia", "Granulometria", "Caudal", "Humedad", "Objetivo de calidad", "Resultados de prueba"],
    limitations: ["La respuesta no puede estimarse solo por el nombre del mineral", "Intensidad, etapas y rendimiento requieren validacion de laboratorio"],
    faqs: [
      { question: "¿Sirve para minerales debilmente magneticos?", answer: "Puede evaluarse, pero la seleccion depende de ensayos de susceptibilidad y separabilidad." },
      { question: "¿Se puede garantizar la calidad final?", answer: "No sin caracterizacion y prueba representativa del material." },
      { question: "¿Que debe enviar el proyecto?", answer: "Muestra o analisis, granulometria, caudal, humedad, composicion de alimentacion y calidad objetivo." }
    ], reviewedAt: "2026-08-08"
  },
  "disc-magnetic-separator-for-tailing": {
    slug: "disc-magnetic-separator-for-tailing", model: "Separador magnetico de discos",
    esTitle: "Separador magnetico de discos para minerales y relaves secos",
    equipmentType: "Separador magnetico de discos", magnetType: "no aplica", discharge: "proceso continuo",
    installation: ["En circuito seco preparado y con alimentacion uniforme"],
    principle: "Los discos crean zonas de captura selectiva para fracciones con distinta respuesta magnetica. La cantidad de etapas y los ajustes se determinan mediante prueba del material.",
    applications: ["Separacion de minerales secos", "Evaluacion de arenas minerales y relaves secos"],
    options: ["Numero de etapas y sistema de alimentacion segun ensayo"],
    verifiedSpecifications: [{ label: "Elemento de separacion", value: "Discos magneticos" }, { label: "Condicion de alimentacion", value: "Material seco preparado" }],
    selectionInputs: ["Mineralogia", "Granulometria y liberacion", "Humedad", "Caudal", "Fracciones objetivo", "Prueba de separabilidad"],
    limitations: ["No debe presentarse como solucion universal para relaves", "Los resultados requieren caracterizacion y pruebas"],
    faqs: [
      { question: "¿Puede tratar relaves humedos directamente?", answer: "Esta configuracion requiere material seco y preparado; una pulpa debe evaluarse con otra tecnologia." },
      { question: "¿Cuantas etapas necesita?", answer: "Se define con la mineralogia, el objetivo y los resultados de prueba." },
      { question: "¿Que resultado garantiza COWIN?", answer: "Ninguno sin ensayo representativo y criterios de aceptacion acordados." }
    ], reviewedAt: "2026-08-08"
  }
};

export function getProductTruthCard(slug: string) {
  return productTruthCards[slug] || null;
}

const categoryLabels: Record<string, string> = {
  "suspended-self-unloading-iron-removers": "Equipo suspendido para retiro de hierro",
  "magnetic-separation-equipment": "Equipo de separacion magnetica",
  "metal-detection-recycling-sorting": "Equipo de deteccion y clasificacion de metales",
  "magnetic-components-filters": "Componente de filtracion magnetica",
  "industry-application-equipment": "Equipo magnetico para aplicaciones industriales"
};

export function safeSpanishProductPresentation(product: { slug: string; title: string; category: string }) {
  const truth = getProductTruthCard(product.slug);
  if (truth) return {
    title: truth.esTitle,
    summary: `${truth.equipmentType} para proyectos en Chile y Latinoamerica. La seleccion final se valida con el material, el punto de instalacion y las condiciones reales de operacion.`
  };
  const model = product.title.match(/\b[A-Z][A-Z0-9-]{1,12}\b/)?.[0];
  const type = categoryLabels[product.category] || "Equipo magnetico industrial";
  return {
    title: model ? `${type} - modelo ${model}` : type,
    summary: `${type}. La ficha tecnica y la configuracion estan disponibles bajo solicitud y deben ser confirmadas por ingenieria de COWIN antes de cotizar.`
  };
}
