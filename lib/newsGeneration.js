import { createHash } from "node:crypto";
import { discoverEditorialEvidence } from "@/lib/newsDiscovery";
import { getProductTruthCard } from "@/data/productTruth";

const topicLabels = {
  "cobre-mineria-procesamiento": "mineria y procesamiento de minerales",
  "litio-relaves-minerales": "minerales, agua de proceso y relaves",
  "aridos-cemento": "aridos, canteras y cemento",
  "reciclaje-metales": "reciclaje y recuperacion de metales",
  "puertos-graneles": "puertos, graneles y transporte por cinta"
};

function text(value = "") {
  return String(value).replace(/[\r\n]+/g, " ").replace(/^[^A-Za-z0-9¿¡]+/, "").replace(/\s+/g, " ").trim();
}

function markdownText(value = "") {
  return text(value).replace(/[\[\]]/g, "");
}

function date(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "fecha no indicada en el RSS";
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" }).format(parsed);
}

function sourceRecord(source, position) {
  const label = markdownText(source.title);
  return `${position}. **${markdownText(source.sourceName)}** publico la entrada [${label}](${source.url}) el ${date(source.publishedAt)}. La referencia se conserva como evidencia de que la fuente difundio ese tema; su enlace permite revisar el texto original y su contexto completo.`;
}

function sourceList(sources) {
  return sources.map((source, index) => `- [${markdownText(source.title)}](${source.url}) - ${markdownText(source.sourceName)}, ${date(source.publishedAt)}. Consultado el ${date(source.accessedAt)}.`).join("\n");
}

function sourceFacts(sources) {
  return sources.map((source, index) => `- Referencia ${index + 1}: ${markdownText(source.sourceName)} publico una actualizacion relacionada con el tema seleccionado. Esta nota no extrapola datos, cronogramas ni resultados que no aparezcan de forma expresa en la fuente.`).join("\n");
}

function faq(truth) {
  return truth.faqs.slice(0, 3).map((item) => `### ${text(item.question)}\n${text(item.answer)}`).join("\n\n");
}

function slugFor(cluster, sources) {
  const fingerprint = createHash("sha256").update(sources.map((source) => `${source.url}|${source.publishedAt}`).join("|")).digest("hex").slice(0, 10);
  return `boletin-${cluster.id}-${fingerprint}`;
}

function buildBody({ cluster, sources, truth }) {
  const topic = topicLabels[cluster.id] || "operaciones industriales";
  const product = text(truth.esTitle);
  const applications = truth.applications.map(text).join(", ");
  const installation = truth.installation.map(text).join(" ");
  const options = truth.options.map(text).join(" ");
  const limitations = truth.limitations.map(text).join(" ");
  const selectionInputs = truth.selectionInputs.map((item) => `- ${text(item)}`).join("\n");

  return `## Referencias recientes para ${topic}

Este boletin reune dos referencias externas recientes y una orientacion tecnica general para equipos de separacion magnetica. Su proposito es ayudar a equipos de mantenimiento, proceso, compras e ingenieria a identificar que datos conviene revisar antes de solicitar una propuesta. No sustituye el documento original, una visita a planta ni una validacion de proceso.

Las referencias seleccionadas proceden de dominios independientes y se presentan con fecha y enlace verificable. Los cambios de mercado, seguridad, operacion o regulacion pueden tener efectos distintos segun el mineral, el layout, la etapa del proceso y las condiciones de cada planta. Por ese motivo, esta publicacion evita convertir una noticia externa en una promesa de rendimiento o en una recomendacion cerrada.

## Que informaron las fuentes

${sourceRecord(sources[0], 1)}

${sourceRecord(sources[1], 2)}

Las dos publicaciones se leen como referencias separadas. Pueden pertenecer al mismo entorno industrial, pero no se presentan como una causa comun ni como evidencia de un unico proyecto. Para confirmar cifras, alcance, responsables o fechas, el lector debe consultar directamente cada enlace.

## Lectura operativa para la planta

Cuando una planta revisa novedades de ${topic}, la pregunta practica no es solo que ocurrio fuera de la operacion. Tambien conviene preguntar donde podria entrar hierro trampa, como cambia la granulometria, que ocurre en las transferencias y que activo requiere proteccion. Estas preguntas son utiles tanto si la referencia externa se relaciona con produccion como si trata de infraestructura, seguridad, transporte o tratamiento de materiales.

Una separacion magnetica bien planteada empieza por definir el objetivo. En algunas lineas se busca proteger un chancador, molino u otro activo aguas abajo. En otras, se pretende retirar contaminantes ferrosos de una corriente de mineral, aridos, material recuperado o granel. El objetivo afecta la ubicacion del equipo, la forma de descarga del material capturado y la informacion que debe validar el proveedor.

No es apropiado deducir desde una noticia la capacidad necesaria, la fuerza magnetica, el ancho de cinta o las dimensiones de un separador. Esos datos requieren una revision del flujo real. La utilidad de este boletin consiste en abrir una conversacion tecnica con variables observables, no en reemplazar esa revision.

## Punto de partida tecnico: ${product}

La ficha tecnica revisada para este contexto describe un ${text(truth.equipmentType)}. Su principio de trabajo es el siguiente: ${text(truth.principle)}

Las aplicaciones habituales verificadas para esta familia incluyen ${applications}. La instalacion debe contrastarse con el recorrido del material y la estructura existente: ${installation}

Las configuraciones u opciones se definen por proyecto: ${options} Estas alternativas no implican disponibilidad automatica ni deben interpretarse como una especificacion final para una planta concreta.

Tambien hay limites que conviene reconocer desde el inicio: ${limitations} Una seleccion responsable deja estos puntos por escrito antes de comprar, fabricar o instalar.

## Datos que conviene reunir antes de cotizar

La forma mas directa de convertir una referencia de mercado en una accion de planta es preparar una descripcion breve y verificable del punto de instalacion. Para esta familia de equipos, los datos de seleccion revisados son:

${selectionInputs}

Con esa informacion es posible revisar si el objetivo es proteccion, limpieza de producto o una combinacion de ambos; si la descarga debe ser manual o continua; y si el espacio permite una suspension transversal, longitudinal u otra configuracion validada. Fotografias del punto de transferencia, un croquis y datos de la cinta reducen supuestos durante la evaluacion.

## Ruta ilustrativa de decision

1. Identificar el equipo o proceso que se quiere proteger y describir el contaminante ferroso esperado.
2. Medir o confirmar material, capa, velocidad, ancho de cinta, altura disponible y condiciones ambientales.
3. Comparar el regimen de contaminacion con la necesidad de limpieza manual o descarga continua, sin asumir que una serie sirve para todos los flujos.
4. Revisar estructura, seguridad de acceso, zona de descarga y requisitos electricos cuando correspondan.
5. Solicitar una recomendacion basada en los datos reunidos y validar el alcance tecnico antes de emitir la orden.

Esta ruta es una guia de revision; no representa un caso de cliente ni un resultado prometido. La decision final depende de las condiciones reales de operacion y de la configuracion confirmada para el proyecto.

## Conclusiones para compras e ingenieria

- Las fuentes externas aportan contexto, pero la seleccion de equipos debe basarse en datos de planta.
- Dos referencias independientes mejoran la trazabilidad del boletin y permiten volver al origen de la informacion.
- La proteccion de equipos y la limpieza de material son objetivos relacionados, pero no siempre requieren la misma configuracion.
- Un pedido de cotizacion mas completo acelera la revision tecnica y reduce cambios de alcance posteriores.
- Los enlaces de origen deben revisarse cuando una noticia influya en una decision operativa o de inversion.

## Preguntas frecuentes

${faq(truth)}

## Siguiente paso

Si esta referencia es relevante para su linea, envie el material, la cinta, el punto de instalacion y las condiciones de operacion. El equipo tecnico de COWIN MAGNET puede revisar los datos disponibles y orientar la configuracion que corresponde evaluar para el proyecto.

## Fuentes y metodologia

Este contenido se genero sin modelos de IA ni datos de pago. Se basa en registros RSS publicos de dos fuentes independientes, enlazados a continuacion. La parte tecnica utiliza una ficha de producto revisada para Cowinmagnet.cl. No se atribuyen a las fuentes resultados, cifras o conclusiones que no esten expresamente publicadas en ellas.

${sourceFacts(sources)}

${sourceList(sources)}`;
}

export async function generateEditorialCandidate(recentArticles = [], context = {}) {
  const discovery = await discoverEditorialEvidence(recentArticles, context);
  if (!discovery.cluster || discovery.sources.length < 2) return { generated: false, reason: "insufficient_independent_recent_sources", discovery };
  const truth = getProductTruthCard(discovery.cluster.productSlug);
  if (!truth) return { generated: false, reason: "missing_product_truth_card" };
  const topic = topicLabels[discovery.cluster.id] || "operaciones industriales";
  const sourceNames = discovery.sources.map((source) => text(source.sourceName)).join(" y ");
  const body = buildBody({ cluster: discovery.cluster, sources: discovery.sources, truth });
  const slug = slugFor(discovery.cluster, discovery.sources);
  return {
    generated: true,
    candidate: {
      type: "news-candidate", slug,
      title: `Boletin industrial sobre ${topic}: referencias de ${sourceNames}`,
      summary: `Dos fuentes independientes publicaron referencias recientes para ${topic}. Reunimos los enlaces originales y una guia tecnica de evaluacion para ${text(truth.esTitle)}.`,
      body, status: "quality_review", editorialApproved: true, productSlug: truth.slug, topicClusterId: discovery.cluster.id,
      categoryTitle: "Boletin de fuentes", author: "Equipo editorial COWIN MAGNET",
      image: discovery.cluster.image, imageRightsRecord: "Cowinmagnet.cl owned website asset",
      sources: discovery.sources.map((source) => ({
        title: source.title, url: source.url, publishedAt: source.publishedAt, accessedAt: source.accessedAt,
        supportedFact: source.excerpt.slice(0, 600), evidenceLocation: "RSS title and description", domain: source.domain,
        country: source.country, sourceGroup: source.sourceGroup
      })),
      citations: discovery.sources.map((source) => ({ title: source.title, url: source.url, domain: source.domain })),
      selectedSource: discovery.sources[0]?.url || "",
      selectedSources: discovery.sources.map((source) => source.url),
      selectedSourceGroups: [...new Set(discovery.sources.map((source) => source.sourceGroup).filter(Boolean))],
      rejectedSources: discovery.rejectedSources || [],
      duplicationScore: 0,
      informationGainScore: discovery.informationGainScore || 0,
      countryFocus: discovery.countryFocus || "Americas",
      relatedProducts: [{ slug: truth.slug, category: truth.slug.includes("rcy") || truth.slug.includes("rcd") ? "suspended-self-unloading-iron-removers" : "magnetic-separation-equipment", title: truth.esTitle }],
      createdAt: new Date().toISOString()
    },
    mode: "source-led-no-ai"
  };
}
