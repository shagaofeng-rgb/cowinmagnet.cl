import { Locale } from "@/data/site";
import { getProductTruthCard } from "@/data/productTruth";

type ProductIdentity = {
  slug: string;
  title: string;
  category: string;
  sourceCategory: string;
};

export type ProductDetailContent = {
  title: string;
  summary: string;
  series: string | null;
  howItWorks: string;
  features: string[];
  applications: string[];
  problems: string[];
  installation: string[];
  selectionInputs: string[];
  options: string[];
  operation: string[];
  faqs: { question: string; answer: string }[];
  confirmedSpecifications: { label: string; value: string }[];
  pendingSpecifications: string[];
};

type Profile = Omit<ProductDetailContent, "title" | "summary" | "series" | "confirmedSpecifications"> & {
  family: string;
};

function seriesFrom(product: ProductIdentity) {
  const match = product.title.match(/\b(?:RCYDII|RCYD|RCYE|RCYP|RCYB|RCDB|RCDA|RCDE|RCDC|RCDD|RCDFJ?|RCPS|CTB|CTN|CTS|CTDG|CGT|CTZ|RCT|HJLH|HJPC|GTC|CLT|NCT|WBC|LJK|HMDN|CBZ|CGB|CQZ|CXJ|DCZ|DCX|RCYA|RCYF|RCYG|RCYZ|CLC|CYG|DLS|GJT|GLS|KGLA|KXB|QJZ|RBCDB|RBCDD|RBCYD)\b/i);
  return match ? match[0].toUpperCase() : null;
}

function is(product: ProductIdentity, expression: RegExp) {
  return expression.test(`${product.slug} ${product.title}`.toLowerCase());
}

function suspendedProfile(product: ProductIdentity): Profile {
  const electromagnetic = is(product, /(electromagnetic|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rbcdb|rbcdd)/);
  const automatic = is(product, /(self-dumping|self-cleaning|overband|rcyd|rcye|rcdd|rcdf|rbcdd|rbcyd|rcps)/);
  const source = electromagnetic ? "una bobina electromagnética energizada" : "un circuito de imanes permanentes";
  const discharge = automatic
    ? "Una banda de descarga retira el material capturado fuera del flujo principal."
    : "La limpieza se programa con acceso seguro y procedimiento de bloqueo del proceso.";
  return {
    family: electromagnetic
      ? automatic ? "Separador electromagnético suspendido autolimpiante" : "Separador electromagnético suspendido"
      : automatic ? "Separador magnético permanente autolimpiante" : "Separador magnético permanente suspendido",
    howItWorks: `El equipo se ubica sobre la correa o el punto de transferencia. ${source} atrae hierro trampa desde el flujo de material; la distancia real de trabajo depende de la altura, la capa y la distribución del material. ${discharge}`,
    features: [
      electromagnetic ? "Campo generado mediante configuración electromagnética" : "Campo generado mediante imanes permanentes",
      automatic ? "Descarga continua del hierro capturado" : "Limpieza manual planificada con acceso seguro",
      "Montaje transversal o longitudinal a validar con el layout",
      "Selección basada en condiciones reales de cinta y material",
      "Configuración para ambientes industriales y de manejo de graneles"
    ],
    applications: ["Protección de chancadores y equipos aguas abajo", "Correas de minerales, áridos y cemento", "Transferencias de graneles y plantas de reciclaje"],
    problems: ["Reduce el riesgo de daño por piezas ferrosas", "Ayuda a controlar hierro trampa antes de equipos críticos", "Facilita una operación más ordenada del punto de transferencia", automatic ? "Evita paradas frecuentes para retirar hierro acumulado" : "Permite programar la limpieza según la carga de contaminación"],
    installation: ["Definir posición sobre cinta, chute o transferencia", "Validar ancho, velocidad, altura de suspensión y capa de material", "Reservar acceso seguro para inspección, descarga y mantenimiento", electromagnetic ? "Confirmar alimentación eléctrica, control y condiciones térmicas" : "Confirmar estructura de suspensión y protección ambiental"],
    selectionInputs: ["Material y tamaño de las piezas ferrosas esperadas", "Ancho, velocidad y sentido de la cinta", "Espesor de capa y altura disponible", "Régimen de operación, polvo, humedad, temperatura y altitud", ...(electromagnetic ? ["Tensión, frecuencia y control disponibles"] : [])],
    options: ["Orientación de montaje según el punto de proceso", "Protección superficial según ambiente", ...(automatic ? ["Configuración de banda, accionamiento y raspador según modelo"] : []), ...(electromagnetic ? ["Alcance eléctrico y gabinete por proyecto"] : [])],
    operation: ["Inspeccionar fijaciones, guardas y acumulación de material", ...(automatic ? ["Revisar alineación, condición de banda y sistema de descarga"] : ["Realizar limpieza solo con procedimiento seguro"]), ...(electromagnetic ? ["Revisar cables, conexiones y parámetros de control"] : [])],
    faqs: [
      { question: "¿Qué información se necesita para seleccionar el equipo?", answer: "Material, contaminación ferrosa, ancho y velocidad de cinta, capa de material, altura disponible y ambiente de trabajo." },
      { question: automatic ? "¿La descarga de hierro puede funcionar en continuo?" : "¿Cómo se realiza la limpieza?", answer: automatic ? "La configuración autolimpiante se evalúa para retirar el material capturado sin una limpieza manual periódica; el alcance se confirma por modelo." : "La limpieza se planifica con acceso seguro y el proceso detenido o aislado según el procedimiento de planta." },
      { question: "¿COWIN tiene stock local en Chile?", answer: "No se declara stock local. COWIN coordina la selección técnica y el suministro para proyectos en Chile y Latinoamérica." }
    ],
    pendingSpecifications: electromagnetic ? ["Potencia o excitación", "Refrigeración", "Aislamiento", "Altura de suspensión", "Dimensiones y peso"] : ["Altura de suspensión", "Ancho de cinta aplicable", "Capa de material", "Dimensiones y peso", "Configuración de montaje"]
  };
}

function wetProfile(): Profile {
  return {
    family: "Separador magnético para proceso húmedo",
    howItWorks: "El material se alimenta como pulpa a la zona de separación. El sistema magnético y el tambor o elemento activo guían las partículas con respuesta magnética hacia una descarga separada. El estanque, el sentido de flujo y los ajustes se definen con la mineralogía y el objetivo de proceso.",
    features: ["Configuración para circuitos de pulpa", "Selección basada en mineralogía y granulometría", "Evaluación de estanque y flujo por aplicación", "Datos de proceso confirmados antes de cotizar", "Integración posible en circuitos de concentración o recuperación"],
    applications: ["Concentración de minerales magnéticos", "Evaluación de relaves con fracción magnética", "Circuitos de beneficio y lavado de minerales"],
    problems: ["Apoya la separación de fracciones con respuesta magnética", "Permite estudiar recuperación o limpieza dentro de un circuito húmedo", "Ayuda a definir una etapa de separación con datos metalúrgicos"],
    installation: ["Confirmar caudal, porcentaje de sólidos y química de pulpa", "Revisar alimentación, descarga y espacio de mantenimiento", "Validar materiales de construcción y entorno corrosivo", "Definir instrumentación y agua de proceso si corresponde"],
    selectionInputs: ["Análisis mineralógico y susceptibilidad magnética", "Granulometría y liberación", "Caudal y porcentaje de sólidos", "Química, temperatura y abrasividad de pulpa", "Objetivo metalúrgico y resultados de prueba"],
    options: ["Configuración de estanque por proceso", "Materiales de construcción a validar", "Etapas o arreglo según pruebas"],
    operation: ["Mantener alimentación uniforme", "Controlar desgaste, sellos y condiciones de pulpa", "Registrar cambios de mineralogía antes de variar ajustes"],
    faqs: [
      { question: "¿Se puede definir el equipo solo por el nombre del mineral?", answer: "No. La mineralogía, liberación, granulometría y caudal deben revisarse antes de seleccionar una configuración." },
      { question: "¿Se garantiza recuperación o ley?", answer: "No se publica una recuperación o ley sin pruebas representativas y criterios de aceptación definidos." },
      { question: "¿Qué datos conviene enviar?", answer: "Análisis, granulometría, caudal, porcentaje de sólidos, condiciones de pulpa y objetivo de proceso." }
    ],
    pendingSpecifications: ["Diámetro y longitud", "Configuración de estanque", "Caudal", "Potencia", "Peso"]
  };
}

function dryProfile(): Profile {
  return {
    family: "Separador magnético para proceso seco",
    howItWorks: "El material seco y distribuido de forma uniforme pasa por la zona magnética. Las fracciones responden de forma distinta al campo y se encaminan hacia descargas separadas. La configuración, los divisores y el número de etapas se ajustan según mineralogía, granulometría, humedad y objetivo de separación.",
    features: ["Separación de material seco preparado", "Selección basada en prueba de separabilidad", "Revisión de alimentación y divisores de producto", "Configuración ajustable al objetivo de proceso", "Aplicación posible en minerales y materiales industriales"],
    applications: ["Preconcentración de minerales secos", "Recuperación de fracciones ferrosas", "Procesamiento de áridos, escorias y minerales industriales"],
    problems: ["Ayuda a separar fracciones por respuesta magnética", "Facilita el estudio de recuperación en circuito seco", "Permite diseñar una etapa de limpieza o preconcentración"],
    installation: ["Asegurar alimentación uniforme", "Controlar humedad y material apelmazado", "Definir captación de polvo y espacio de ajuste", "Validar descarga, divisores y acceso de mantenimiento"],
    selectionInputs: ["Mineralogía y objetivo de separación", "Granulometría, humedad y distribución de alimentación", "Capacidad requerida", "Resultados de pruebas de separabilidad", "Condiciones ambientales del sitio"],
    options: ["Alimentador y sistema de distribución", "Divisores de producto", "Número de etapas según prueba", "Protección contra polvo por proyecto"],
    operation: ["Mantener alimentación estable", "Revisar desgaste, limpieza y ajuste de divisores", "Evitar cambios de material sin revisar la condición de separación"],
    faqs: [
      { question: "¿Funciona con material húmedo?", answer: "La humedad puede afectar la alimentación y la separación. La condición admisible se revisa con la muestra y el proceso." },
      { question: "¿Se puede garantizar una calidad final?", answer: "La calidad final se valida con caracterización y pruebas representativas, no solo con el nombre del mineral." },
      { question: "¿Qué debe incluir la consulta?", answer: "Mineralogía, granulometría, humedad, capacidad, objetivo de separación y datos de prueba disponibles." }
    ],
    pendingSpecifications: ["Intensidad de campo", "Etapas de separación", "Capacidad", "Potencia", "Dimensiones y peso"]
  };
}

function detectorProfile(): Profile {
  return {
    family: "Detector de metales para proceso industrial",
    howItWorks: "El equipo supervisa el material que atraviesa su zona de detección y genera una señal cuando identifica un elemento metálico según la configuración seleccionada. La ventana, la pieza de prueba, la velocidad y la lógica de alarma o interbloqueo se validan con la aplicación.",
    features: ["Detección integrada al flujo de proceso", "Configuración de alarma o interbloqueo por aplicación", "Validación mediante pieza de prueba", "Selección según ventana y velocidad", "Integración a protección de equipos aguas abajo"],
    applications: ["Correas transportadoras", "Protección de chancadores y maquinaria", "Control de contaminación metálica en procesos industriales"],
    problems: ["Advierte presencia de metal antes de equipos sensibles", "Ayuda a definir una respuesta de alarma o detención", "Permite estructurar controles de proceso con datos de prueba"],
    installation: ["Definir zona libre de interferencias", "Confirmar ventana, velocidad y posición de montaje", "Definir señal de alarma e interbloqueo", "Reservar acceso para pruebas y ajuste"],
    selectionInputs: ["Dimensiones del material", "Ancho de cinta y velocidad", "Tipo y tamaño de metal a detectar", "Sensibilidad requerida", "Lógica de alarma o interbloqueo"],
    options: ["Ventana y configuración mecánica", "Salida de alarma", "Interbloqueo con el proceso", "Protección ambiental según aplicación"],
    operation: ["Realizar pruebas periódicas con pieza patrón", "Revisar fijaciones y cableado", "Registrar ajustes y alarmas para trazabilidad"],
    faqs: [
      { question: "¿La sensibilidad es igual para todos los materiales?", answer: "No. Debe validarse con tamaño, orientación, velocidad y pieza de prueba representativa." },
      { question: "¿Puede detener una correa?", answer: "La lógica de alarma e interbloqueo se define con el sistema de control del proyecto." },
      { question: "¿Qué información se necesita?", answer: "Ventana requerida, tamaño de material, velocidad, metal objetivo y la acción esperada ante una detección." }
    ],
    pendingSpecifications: ["Ventana", "Sensibilidad", "Velocidad máxima", "Salidas e interbloqueo", "Protección ambiental"]
  };
}

function filterProfile(): Profile {
  return {
    family: "Filtro y componente magnético para proceso",
    howItWorks: "El flujo de producto atraviesa barras, rejillas o elementos magnéticos dispuestos en la carcasa o punto de proceso. Las partículas ferrosas son retenidas en el elemento activo; la disposición final, el método de limpieza y el material de construcción se confirman según producto, caudal y condiciones de operación.",
    features: ["Configuración para polvo, granulado o flujo por tubería", "Disposición de elementos magnéticos por aplicación", "Selección según abertura, diámetro o caudal", "Limpieza manual o configuración específica según modelo", "Integración en puntos de protección de proceso"],
    applications: ["Protección de equipos de proceso", "Retiro de partículas ferrosas en graneles", "Líneas de producto, tolvas y tuberías"],
    problems: ["Ayuda a reducir contaminación ferrosa", "Protege equipos posteriores", "Permite definir un punto de inspección y limpieza del proceso"],
    installation: ["Confirmar dirección de flujo y espacio disponible", "Revisar diámetro, abertura o sección de paso", "Definir acceso para limpieza", "Validar temperatura, presión y material de construcción si corresponde"],
    selectionInputs: ["Producto y contaminación objetivo", "Caudal o flujo", "Diámetro, abertura o sección", "Tamaño de partícula", "Temperatura, presión y ambiente si aplica"],
    options: ["Número y disposición de elementos", "Carcasa o conexión por proyecto", "Materiales de construcción a validar", "Método de limpieza según modelo"],
    operation: ["Inspeccionar acumulación de material", "Realizar limpieza con el procedimiento adecuado", "Revisar sellos, conexiones y condición de los elementos"],
    faqs: [
      { question: "¿Qué tipo de contaminación retiene?", answer: "La respuesta depende del material, tamaño de partícula, velocidad de flujo y configuración del elemento magnético." },
      { question: "¿Se puede instalar en una tubería existente?", answer: "Se revisan diámetro, conexión, caudal, presión, temperatura y espacio de mantenimiento antes de confirmar la configuración." },
      { question: "¿Qué datos debe enviar el proyecto?", answer: "Producto, caudal, diámetro o abertura, contaminación objetivo y condiciones de operación." }
    ],
    pendingSpecifications: ["Diámetro o abertura", "Número de barras", "Caudal o presión", "Material de construcción", "Método de limpieza"]
  };
}

function recyclingProfile(): Profile {
  return {
    family: "Equipo de separación y clasificación para reciclaje",
    howItWorks: "El sistema recibe una alimentación preparada y la conduce por una zona de separación. El elemento activo, el rotor, la polea o el divisor se selecciona según el material objetivo y el tamaño de entrada. El resultado depende de la composición real de la alimentación, la distribución y los ajustes de proceso.",
    features: ["Configuración según material de alimentación", "Selección de flujo, cinta y divisor por proceso", "Integración posible en líneas de recuperación", "Validación con muestra o composición de entrada", "Parámetros de proceso confirmados antes de cotizar"],
    applications: ["Reciclaje de metales", "Clasificación de materiales industriales", "Recuperación de fracciones ferrosas o no ferrosas"],
    problems: ["Ayuda a separar fracciones objetivo", "Permite estudiar mejoras de recuperación", "Ordena una etapa de clasificación dentro de la línea"],
    installation: ["Definir preparación y tamaño de alimentación", "Validar cinta, posición de divisores y descargas", "Reservar espacio de ajuste y mantenimiento", "Confirmar extracción de polvo y seguridad de línea"],
    selectionInputs: ["Composición de la alimentación", "Tamaño de partícula", "Capacidad", "Material objetivo", "Resultados de prueba o recuperación actual"],
    options: ["Configuración de rotor o elemento activo", "Cinta y divisor", "Protección ambiental", "Integración de control por proyecto"],
    operation: ["Mantener alimentación homogénea", "Revisar desgaste y alineación de componentes", "Controlar la separación con muestras periódicas"],
    faqs: [
      { question: "¿Se puede prometer una recuperación?", answer: "No sin prueba representativa, composición de alimentación y condiciones de operación definidas." },
      { question: "¿Qué tamaño de material se necesita?", answer: "El rango se determina por tecnología y modelo; envíe distribución de tamaños y fotos o muestra representativa." },
      { question: "¿Qué se revisa antes de cotizar?", answer: "Materiales presentes, capacidad, tamaño, humedad, objetivo de recuperación y layout disponible." }
    ],
    pendingSpecifications: ["Configuración de rotor o elemento activo", "Tamaño de alimentación", "Capacidad", "Potencia", "Configuración de divisor"]
  };
}

function auxiliaryProfile(): Profile {
  return {
    family: "Equipo auxiliar para integración de proceso",
    howItWorks: "Este equipo se integra como parte de una configuración de proceso o de control. Su función exacta, interfaces mecánicas o eléctricas y condiciones de trabajo deben confirmarse junto con el equipo principal y el layout de planta.",
    features: ["Integración revisada por proyecto", "Configuración mecánica o eléctrica según modelo", "Compatibilidad con condiciones ambientales a validar", "Datos de interfaz confirmados antes de suministro"],
    applications: ["Integración de equipos de proceso", "Control o apoyo a líneas industriales", "Aplicaciones mineras e industriales"],
    problems: ["Apoya una configuración de proceso definida", "Permite revisar compatibilidad con el equipo principal", "Ayuda a documentar interfaces y condiciones de operación"],
    installation: ["Confirmar equipo asociado y función requerida", "Revisar alimentación, estructura y espacio", "Validar seguridad, ambiente y conexión al control"],
    selectionInputs: ["Modelo asociado", "Función requerida", "Alimentación eléctrica", "Ambiente", "Layout e interfaces disponibles"],
    options: ["Configuración según equipo principal", "Protección ambiental por proyecto", "Interfaces eléctricas o mecánicas a confirmar"],
    operation: ["Seguir el manual final del modelo confirmado", "Verificar conexiones, guardas y condiciones de uso", "Mantener registro de inspección y servicio"],
    faqs: [
      { question: "¿Puede seleccionarse sin el equipo principal?", answer: "Se necesita revisar la función, interfaces y condiciones del conjunto antes de confirmar una configuración." },
      { question: "¿Qué datos se deben enviar?", answer: "Equipo asociado, función requerida, alimentación, ambiente y planos o fotografías del punto de instalación." },
      { question: "¿La configuración publicada es final?", answer: "No. La configuración final se confirma por ingeniería de COWIN para el proyecto." }
    ],
    pendingSpecifications: ["Configuración de interfaz", "Alimentación", "Protección ambiental", "Dimensiones", "Peso"]
  };
}

function profileFor(product: ProductIdentity): Profile {
  // Mineral separators are classified from their actual process medium first.
  // This avoids describing wet vertical-ring and tailings equipment as dry units.
  if (is(product, /(wet|ctb|ctn|cts|coal-washing|hmdn|clt|nct|wbc|dcx|hjlh|hjpc|gtc|qcg)/)) return wetProfile();
  if (is(product, /(dry-drum|ctdg|cgt|ctz|rct|dcz|hcg|dhj|dhd|ctzs)/)) return dryProfile();
  if (is(product, /(metal-detector|dls|gjt|gls)/)) return detectorProfile();
  if (is(product, /(drawer|hump|grid|rod|trap|pipe|filter|rcyz|clc|cyg|cbz|cgb|cqz|cxj|dcz|dcx|rcya|rcyf|rcyg)/)) return filterProfile();
  if (is(product, /(eddy-current|stainless-steel-separation|magnetic-head-pulley|drum-magnet)/)) return recyclingProfile();
  if (is(product, /(control-box|high-frequency-screen|lifting-magnet)/)) return auxiliaryProfile();
  return suspendedProfile(product);
}

function spanishSummary(title: string, profile: Profile) {
  const common = "COWIN acompaña la definición técnica y el suministro para proyectos en Chile y Latinoamérica; las dimensiones, capacidad y configuración final se confirman con ingeniería antes de cotizar.";
  if (profile.family.includes("proceso húmedo")) {
    return `${title} se evalúa para circuitos de pulpa, concentración y recuperación de minerales. La selección parte de la mineralogía, granulometría, caudal, porcentaje de sólidos y objetivo metalúrgico, además de la química y abrasividad de la pulpa. No se publican recuperaciones, intensidades ni capacidades sin una condición de prueba o de proceso confirmada. ${common}`;
  }
  if (profile.family.includes("proceso seco")) {
    return `${title} se utiliza para estudiar la separación de material seco en minería, áridos y procesos industriales. La configuración se valida con mineralogía, granulometría, humedad, distribución de alimentación, capacidad requerida y objetivo de separación. Los divisores, etapas y condiciones de operación se ajustan al proceso real, sin prometer resultados que no hayan sido verificados. ${common}`;
  }
  if (profile.family.includes("Detector")) {
    return `${title} permite definir una etapa de detección de metal antes de equipos sensibles o dentro de una correa de proceso. La selección considera la ventana útil, el tamaño y tipo de metal objetivo, la velocidad, la pieza de prueba y la lógica de alarma o interbloqueo. La sensibilidad se valida con condiciones representativas, no con valores genéricos. ${common}`;
  }
  if (profile.family.includes("Filtro")) {
    return `${title} se configura para retirar partículas ferrosas en tolvas, líneas de producto o tuberías industriales. Se revisan el producto, la contaminación objetivo, el caudal, la abertura o diámetro, el acceso de limpieza y, cuando corresponde, la presión y temperatura. Las barras, conexiones y materiales se confirman solo para la condición operativa indicada. ${common}`;
  }
  if (profile.family.includes("reciclaje")) {
    return `${title} se evalúa para líneas de recuperación y clasificación de materiales ferrosos o no ferrosos. La selección se basa en la composición de entrada, el tamaño de partícula, la capacidad, la humedad, el material objetivo y el layout disponible. La recuperación final se valida con una muestra o con datos representativos de operación. ${common}`;
  }
  if (profile.family.includes("auxiliar")) {
    return `${title} se integra como parte de una solución de proceso o control industrial. La configuración depende del equipo asociado, las interfaces mecánicas o eléctricas, el ambiente y la función requerida. Antes de cotizar se revisan el layout, la alimentación y los requisitos de seguridad para evitar suposiciones de catálogo. ${common}`;
  }
  return `${title} se evalúa para retirar hierro trampa y proteger equipos en minería, áridos, reciclaje y manejo de graneles. La selección considera el material, la contaminación ferrosa, el ancho y velocidad de cinta, la capa de material, la altura disponible y el ambiente operativo. En configuraciones autolimpiantes también se valida el sistema de descarga; en equipos electromagnéticos se revisan alimentación y control. ${common}`;
}

function spanishContent(product: ProductIdentity): ProductDetailContent {
  const profile = profileFor(product);
  const truth = getProductTruthCard(product.slug);
  const series = truth?.model || seriesFrom(product);
  const title = truth?.esTitle || `${series ? `${series}: ` : ""}${profile.family}`;
  const summary = spanishSummary(title, profile);
  return {
    ...profile,
    title,
    summary,
    series,
    howItWorks: truth?.principle || profile.howItWorks,
    applications: truth?.applications || profile.applications,
    installation: truth?.installation || profile.installation,
    selectionInputs: truth?.selectionInputs || profile.selectionInputs,
    options: truth?.options || profile.options,
    faqs: profile.faqs,
    confirmedSpecifications: truth?.verifiedSpecifications || [],
    pendingSpecifications: profile.pendingSpecifications
  };
}

function genericContent(product: ProductIdentity, locale: Locale): ProductDetailContent {
  const profile = profileFor(product);
  const series = seriesFrom(product);
  const portuguese = locale === "pt-br";
  const title = product.title;
  const summary = portuguese
    ? `${title} para projetos industriais na América Latina. A configuração é revisada conforme material, processo, capacidade e condições de instalação antes da cotação.`
    : `${title} for industrial projects in Latin America. Configuration is reviewed against material, process, capacity and installation conditions before quotation.`;
  return {
    ...profile,
    title,
    summary,
    series,
    howItWorks: portuguese ? "O princípio de funcionamento e a configuração final são confirmados para o processo e o modelo selecionado." : "The operating principle and final configuration are confirmed for the selected process and model.",
    features: portuguese ? ["Configuração por projeto", "Seleção com dados de processo", "Opções confirmadas antes da cotação"] : ["Project-based configuration", "Selection using process data", "Options confirmed before quotation"],
    applications: portuguese ? ["Projetos industriais", "Processamento de materiais", "Operações na América Latina"] : ["Industrial projects", "Material processing", "Latin America operations"],
    problems: portuguese ? ["Apoia a definição técnica do processo", "Ajuda a confirmar a configuração aplicável"] : ["Supports technical process definition", "Helps confirm the applicable configuration"],
    installation: portuguese ? ["Validar layout e espaço", "Confirmar condições ambientais"] : ["Validate layout and available space", "Confirm environmental conditions"],
    selectionInputs: portuguese ? ["Material", "Capacidade", "Condições do local"] : ["Material", "Capacity", "Site conditions"],
    options: portuguese ? ["Disponível sob consulta"] : ["Available on request"],
    operation: portuguese ? ["Seguir a configuração final confirmada"] : ["Follow the confirmed final configuration"],
    faqs: portuguese ? [{ question: "Quais dados são necessários?", answer: "Material, capacidade e condições de instalação." }] : [{ question: "What information is needed?", answer: "Material, capacity and installation conditions." }],
    confirmedSpecifications: [],
    pendingSpecifications: profile.pendingSpecifications
  };
}

export function getProductDetailContent(product: ProductIdentity, locale: Locale): ProductDetailContent {
  return locale === "es-cl" || locale === "es" ? spanishContent(product) : genericContent(product, locale);
}
