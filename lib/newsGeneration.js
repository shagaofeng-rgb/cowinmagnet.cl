import { createHash } from "node:crypto";
import { getNewsSiteConfig } from "@/lib/newsSiteConfig.mjs";
import { getProductTruthCard } from "@/data/productTruth";

function clean(value = "") {
  return String(value).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value, locale = "es-CL") {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "fecha no indicada" : new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date);
}

function themeLabel(theme = "") {
  return {
    "cobre-mineria-procesamiento": "mineria y procesamiento de minerales",
    "litio-relaves-minerales": "minerales, agua de proceso y relaves",
    "aridos-cemento": "aridos, canteras y cemento",
    "reciclaje-metales": "reciclaje y recuperacion de metales",
    "puertos-graneles": "puertos, graneles y transporte de graneles"
  }[theme] || "operaciones industriales";
}

function editorialBody(candidate, site) {
  const source = candidate.sources?.[0] || {};
  const topic = themeLabel(candidate.topicClusterId);
  const sourceDate = formatDate(source.publishedAt, site.locale === "es-cl" ? "es-CL" : "es-ES");
  const sourceSummary = clean(source.supportedFact || candidate.summary);
  return `## Lo que comunicó la fuente

${clean(source.sourceName || "La fuente original")} publicó una actualización titulada "${clean(source.title || candidate.title)}" el ${sourceDate}. La información disponible en su canal público describe el tema de forma resumida: ${sourceSummary}

Esta página no reproduce ni traduce íntegramente la publicación original. El enlace de fuente al final permite consultar el texto completo, su contexto y cualquier actualización posterior directamente con el emisor.

## Qué cambió y qué conviene verificar

Para equipos de operación, ingeniería, mantenimiento y compras, las novedades de ${topic} se deben revisar como un punto de partida verificable, no como una especificación automática para cada planta. Los plazos, alcances, condiciones técnicas y responsables corresponden a la fuente original y pueden variar con el proyecto, la jurisdicción y el momento de consulta.

Antes de convertir esta novedad en una decisión operativa, conviene confirmar el alcance geográfico, la fecha efectiva, el documento técnico aplicable y la relación concreta con el proceso propio. En minería, reciclaje, áridos, cemento y manejo de graneles, un mismo cambio puede afectar etapas distintas: recepción de material, transporte por cinta, chancado, clasificación, mantenimiento, seguridad o disposición de subproductos.

## Por qué puede importar para operaciones industriales

La lectura práctica consiste en identificar si el hecho informado altera un requisito de continuidad, seguridad, trazabilidad, mantenimiento o disponibilidad de materiales. Esa revisión no exige asumir resultados que la fuente no haya publicado. Más bien ayuda a formular preguntas precisas: qué parte del flujo se ve afectada, qué dato de proceso debe confirmarse, qué equipo aguas abajo es sensible y qué evidencia técnica debe conservarse.

En instalaciones con transporte de material, por ejemplo, una evaluación responsable suele distinguir entre la protección de activos, la limpieza de una corriente y la recuperación de una fracción de valor. Esas finalidades pueden relacionarse, pero requieren datos distintos. El ancho de cinta, la granulometría, la capa de material, el tipo de contaminante, el espacio disponible y las condiciones ambientales siguen siendo propios de cada proyecto.

## Lectura editorial

La señal principal de esta actualización es que los equipos técnicos deben conservar una trazabilidad clara entre la fuente externa y la evaluación interna. Un titular por sí solo no confirma capacidad, rendimiento, cumplimiento normativo ni una solución de ingeniería. Las decisiones con impacto en proceso o inversión deben contrastarse con documentos vigentes, responsables designados y condiciones reales de operación.

Para organizaciones de Chile y Latinoamérica, también es útil comprobar si el hecho tiene efecto local o si se trata de una tendencia regional que necesita validación adicional. Esta distinción evita trasladar conclusiones entre países, materiales o procesos que no son equivalentes.

## Preguntas útiles para el equipo del proyecto

- ¿Qué dato original de la fuente respalda la posible relevancia para la operación?
- ¿Qué etapa de proceso, activo o condición de seguridad exige una revisión concreta?
- ¿Existe una fecha de entrada en vigor, documento técnico o actualización posterior que deba verificarse?
- ¿Qué variables locales de material, instalación y ambiente podrían cambiar la aplicación práctica?
- ¿Qué responsable debe validar la conclusión antes de modificar una especificación o un procedimiento?

## Cómo usar esta noticia sin perder el contexto

Una noticia sectorial resulta más útil cuando se conecta con un registro interno de decisiones. El equipo puede conservar la URL original, la fecha de publicación, la fecha de consulta y una nota breve sobre el posible impacto. Si una fuente actualiza o corrige su publicación, ese registro permite revisar la conclusión sin confundir la fecha del hecho con la fecha en que fue leído por la organización.

También conviene separar claramente tres niveles: lo que afirma la fuente, lo que la planta conoce de sus propias condiciones y lo que todavía debe validarse. Esta disciplina evita que una novedad de mercado se convierta, por repetición, en una especificación técnica no confirmada. En procesos con materiales variables, una misma palabra como mineral, residuo, concentrado o árido puede representar propiedades muy diferentes de tamaño, humedad, densidad, contenido metálico y comportamiento sobre una cinta o dentro de una etapa de clasificación.

El seguimiento responsable no exige reaccionar a cada titular. Exige identificar cuáles novedades tienen relación comprobable con un activo, una obligación, una decisión de compra o una condición de seguridad. Cuando no existe esa relación, la noticia puede conservarse como contexto de mercado sin convertirla en una acción técnica. Cuando sí existe, el siguiente paso es revisar la información primaria y definir quién confirmará el alcance para el sitio concreto.

## Verificación documental antes de actuar

En proyectos industriales, la trazabilidad de una noticia comienza por conservar el documento o comunicado original y comprobar si existen anexos, resoluciones, calendarios, datos de producción o aclaraciones posteriores. La fecha que figura en un titular no siempre coincide con la fecha de aplicación de una medida ni con la fecha de una decisión de inversión. Por eso, antes de modificar un plan de mantenimiento, una evaluación de riesgo o una especificación, conviene registrar qué documento se revisó, quién lo emitió, qué parte es obligatoria y qué parte corresponde a una expectativa o a una declaración de contexto.

También es importante revisar el alcance material de la información. Una actualización sobre cobre, litio, infraestructura, reciclaje o logística puede referirse a una zona, una etapa del proceso o una condición contractual muy concreta. Trasladarla sin revisión a otra faena, otro país o un material distinto puede producir interpretaciones equivocadas. La utilidad de una síntesis editorial está en ordenar las preguntas que deben responderse con fuentes primarias, no en reemplazar la confirmación técnica, legal o comercial que requiere cada organización.

## Impacto operativo que conviene separar

Una misma novedad puede tener consecuencias diferentes para continuidad, seguridad, abastecimiento y calidad. En una planta de procesamiento, por ejemplo, el equipo responsable puede necesitar distinguir entre una modificación de calendario, un cambio de requisito, una alerta de seguridad y una variación de disponibilidad de insumos. Cada caso exige responsables, evidencia y plazos diferentes. Mantener estas categorías separadas ayuda a evitar que un mensaje de mercado termine convertido en una instrucción operativa sin respaldo.

Cuando el tema se relaciona con transporte por cinta, chancado, clasificación o recuperación de materiales, el análisis debe volver a las condiciones reales de la instalación. La naturaleza del material, la variabilidad de la alimentación, el acceso para mantenimiento, el entorno y los límites de seguridad no se deducen de una noticia externa. Son datos de proyecto que deben confirmarse con registros de operación, planos vigentes y las personas que conocen la línea. Esta práctica permite identificar riesgos relevantes sin atribuir al artículo original conclusiones que no contiene.

## Datos que deben mantenerse separados

Para conservar una lectura útil en el tiempo, es recomendable separar la fecha de la fuente, la fecha de la revisión interna y la fecha de cualquier decisión posterior. También conviene guardar la URL canónica, el nombre del emisor, una descripción breve de la posible relación con el proceso y la evidencia que confirme o descarte esa relación. Este registro facilita revisiones posteriores, especialmente cuando una publicación es corregida, ampliada o reemplazada por una comunicación oficial más reciente.

La disciplina de datos también protege la calidad de las conversaciones entre operaciones, mantenimiento, compras y dirección. En lugar de asumir que una novedad aplica de forma general, cada área puede aportar el dato que conoce: condiciones del equipo, características del material, compromisos de suministro, exigencias regulatorias o disponibilidad de personal. El resultado no es una respuesta automática, sino una decisión mejor documentada y proporcionada al riesgo real.

## Alcance y límites de esta síntesis

La presente nota no certifica equipos, no anticipa resultados de proceso y no sustituye una evaluación de riesgos o de ingeniería. Tampoco implica que los requisitos descritos por una fuente sean aplicables automáticamente a todos los países de Latinoamérica. Las autoridades, los operadores y los proveedores pueden usar definiciones, calendarios y condiciones diferentes.

Por ese motivo, las referencias se presentan con atribución visible y una fecha original. El lector puede distinguir qué parte proviene de una publicación externa y qué parte corresponde a una lectura editorial general. Mantener esa diferencia mejora la trazabilidad del contenido y reduce el riesgo de usar un resumen como si fuera un documento oficial o una conclusión definitiva.

## Nota editorial y fuente

Esta es una síntesis editorial independiente elaborada para lectores de ${site.brandName}. Los hechos externos se atribuyen a la fuente indicada; las observaciones sobre lectura operativa son una interpretación general y no sustituyen documentación técnica, regulatoria ni asesoría profesional aplicable al proyecto.

Fuente original: [${clean(source.title || candidate.title)}](${source.url}) — ${clean(source.sourceName || candidate.sourceDomain)}, publicado el ${sourceDate}.`;
}

export function composeNewsArticle(candidate, { siteId } = {}) {
  const site = getNewsSiteConfig(siteId || candidate.siteId);
  if (!site) return { generated: false, reason: "unknown_site" };
  const source = candidate.sources?.[0];
  if (!source?.url || !source?.publishedAt) return { generated: false, reason: "candidate_missing_verified_source" };
  if (!getProductTruthCard(candidate.productSlug)) return { generated: false, reason: "missing_product_truth_card" };
  const slugHash = createHash("sha256").update(`${candidate.siteId}|${candidate.sourceFingerprint || source.url}`).digest("hex").slice(0, 12);
  const body = editorialBody(candidate, site);
  return {
    generated: true,
    article: {
      ...candidate,
      type: "news",
      slug: `noticia-${candidate.topicClusterId}-${slugHash}`,
      title: clean(candidate.title),
      summary: clean(candidate.summary).slice(0, 360),
      body,
      author: site.news.defaultAuthorType,
      categoryTitle: "Noticias de la industria",
      editorialDisclaimer: "Síntesis editorial independiente basada en la fuente enlazada. La información original pertenece a su fuente.",
      contentType: "news",
      relatedProducts: [],
      internalLinks: [],
      citations: [{ title: source.title, url: source.url, domain: source.domain }],
      image: "",
      imagePolicy: "no-external-news-image",
      imageRightsRecord: candidate.imageRightsRecord,
      canonicalUrl: `${site.siteUrl}${site.news.detailRoutePattern.replace("[slug]", `noticia-${candidate.topicClusterId}-${slugHash}`)}`,
      createdAt: new Date().toISOString()
    }
  };
}
