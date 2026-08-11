import { getCachedPublishedNews } from "@/lib/publicCms";
import { Locale, defaultLocale } from "@/data/site";
import { unstable_noStore as noStore } from "next/cache";

export type LocalizedNewsContent = {
  title?: string;
  summary?: string;
  body?: string;
  geoSummary?: string;
  seoKeywords?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  body?: string;
  image?: string;
  categoryTitle?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  canonicalSourceUrl?: string;
  sourceDomain?: string;
  sourceLanguage?: string;
  sourcePublishedAt?: string;
  sourceFetchedAt?: string;
  sourceTimezone?: string;
  sourceFingerprint?: string;
  normalizedTitle?: string;
  contentHash?: string;
  eventFingerprint?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  topicClusterId?: string;
  informationGainScore?: number;
  duplicationScore?: number;
  seoKeywords?: string[];
  geoSummary?: string;
  localized?: Record<string, LocalizedNewsContent>;
  imagePolicy?: string;
  sourceImageUrl?: string;
  imageCredit?: string;
  imageRightsUrl?: string;
  licenseUrl?: string;
  editorialDisclaimer?: string;
  citations?: { title: string; url: string; domain: string }[];
  internalLinks?: { label: string; href: string }[];
  relatedProducts?: { slug: string; category: string; title: string; image?: string; href?: string; relevanceScore?: number; relationshipReason?: string }[];
};

export const staticPosts: BlogPost[] = [
  {
    slug: "separador-magnetico-para-relaves-mineros",
    title: "Separador magnetico para relaves mineros",
    date: "2026-08-06",
    author: "Cowin Magnet Chile",
    summary: "Guia para evaluar un separador magnetico para relaves mineros en Sudamerica: aplicaciones, limites, parametros, errores y cotizacion.",
    body: `## SEO Meta

SEO Title: Separador magnetico para relaves mineros

Meta Description: Guia para evaluar separadores magneticos para relaves mineros en Sudamerica: usos, limites, parametros, errores y cotizacion.

URL Slug: separador-magnetico-para-relaves-mineros

Primary Keyword: separador magnetico para relaves

Secondary Keywords: recuperar hierro desde relaves, separacion magnetica mineral, separador magnetico para mineria, separador magnetico de tambor humedo, recuperacion de magnetita

Search Intent: Evaluacion tecnica y seleccion de equipos para recuperacion magnetica en relaves

Target Country: Chile, Peru, Brasil, Argentina y Colombia

Target Buyer: Metalurgia, operaciones, proyectos de relaves, sostenibilidad, mantenimiento y compras tecnicas mineras

Suggested CTA: Envie muestra, granulometria, porcentaje de solidos, caudal y objetivo de recuperacion para que Cowin Magnet revise la seleccion.

## Puntos clave

- Un separador magnetico para relaves se evalua cuando la corriente contiene particulas magneticas recuperables, como magnetita u otros minerales ferromagneticos.
- No todos los relaves sirven para separacion magnetica; la mineralogia, liberacion y granulometria definen la viabilidad tecnica.
- En relaves humedos suelen evaluarse separadores magneticos de tambor humedo, mientras que en relaves secos pueden revisarse tambores secos u otras configuraciones.
- No se deben prometer recuperaciones, leyes ni beneficios economicos sin pruebas de laboratorio o informacion metalurgica representativa.
- La seleccion depende de caudal, porcentaje de solidos, tamano de particula, susceptibilidad magnetica, objetivo de recuperacion y condiciones de planta.
- Una solicitud de cotizacion debe incluir datos del relave, punto de instalacion, disponibilidad electrica, agua de proceso y restricciones ambientales.

## Respuesta directa para proyectos de relaves

Un separador magnetico para relaves mineros puede ser util cuando el relave contiene una fraccion magnetica que se desea recuperar, concentrar o retirar de una corriente secundaria. En Sudamerica, este tema interesa especialmente a plantas que buscan revisar relaves de hierro, cobre con magnetita asociada, escorias, arenas minerales o corrientes finas con contenido ferroso.

La decision no debe tomarse solo por capacidad en toneladas por hora. La pregunta correcta es si el material tiene respuesta magnetica suficiente y si las particulas estan liberadas en el tamano adecuado. Sin mineralogia, granulometria y pruebas basicas, cualquier seleccion queda incompleta.

Esta guia ayuda a compradores tecnicos de Chile, Peru, Brasil, Argentina y Colombia a definir cuando conviene usar separacion magnetica en relaves, que equipo considerar, que errores evitar y que datos enviar a Cowin Magnet antes de solicitar una cotizacion.

## Aplicaciones habituales en relaves mineros

La aplicacion mas comun es la recuperacion de magnetita o hierro magnetico desde relaves generados por plantas de mineral de hierro o por procesos donde una fraccion magnetica queda en corrientes secundarias. En estos casos, la separacion magnetica puede ayudar a producir una corriente magnetica separada para evaluacion posterior.

Tambien puede aplicarse en relaves de cobre cuando existe magnetita u otra fraccion magnetica asociada. Esto no significa que el separador recupere cobre directamente. El objetivo suele ser retirar o recuperar material magnetico, reducir contaminacion ferrosa o generar una corriente que luego deba ser evaluada por metalurgia.

En escorias, arenas minerales, relaves secos o depositos historicos, el separador magnetico puede formar parte de una etapa de evaluacion tecnica. Sin embargo, cada deposito tiene variabilidad. Por eso conviene trabajar con muestras representativas y no asumir que una prueba puntual describe todo el volumen disponible.

## Equipos recomendados segun el tipo de relave

Para relaves en pulpa, el equipo mas frecuente es el separador magnetico de tambor humedo. Este equipo trabaja con material suspendido en agua y separa particulas magneticas mediante un tambor con sistema magnetico interno. Puede configurarse segun caudal, porcentaje de solidos, granulometria y objetivo de recuperacion.

Para relaves secos o parcialmente secos, pueden evaluarse separadores magneticos secos, tambores magneticos secos, poleas magneticas o separadores de mayor intensidad, dependiendo del tamano de particula y de la respuesta magnetica. La humedad residual es un dato critico, porque el material pegajoso puede afectar alimentacion, separacion y limpieza.

Si el problema no es recuperar particulas magneticas sino retirar piezas ferrosas grandes antes de una trituradora, el equipo correcto podria ser un separador overband o un iman suspendido sobre cinta transportadora. Para contaminantes no ferrosos, puede ser necesario detector de metales u otra tecnologia complementaria.

## Parametros clave para seleccionar el separador

El primer parametro es la mineralogia. Es necesario saber si el relave contiene magnetita, hematita, ilmenita, pirrotita u otros minerales con respuesta magnetica. La susceptibilidad magnetica no es igual para todos los minerales, y eso cambia la intensidad requerida.

El segundo parametro es la granulometria. Particulas demasiado gruesas, demasiado finas o no liberadas pueden reducir la eficiencia de separacion. El tamano maximo, P80 y distribucion granulometrica ayudan a decidir si conviene un tambor humedo, un separador seco u otra configuracion.

El tercer parametro es el estado del material. Una pulpa con porcentaje de solidos estable permite una seleccion distinta a un relave seco, arcilloso o con humedad variable. Caudal, densidad, presencia de lamas y comportamiento de sedimentacion deben revisarse antes de dimensionar.

El cuarto parametro es el objetivo. Recuperar magnetita, limpiar una corriente, reducir hierro, preparar una muestra para prueba piloto o proteger equipos son objetivos distintos. Cada uno puede requerir una tecnologia diferente.

## Errores comunes al evaluar relaves

Un error frecuente es asumir que todos los relaves con hierro visible son economicamente recuperables por magnetismo. La presencia de hierro no basta. Se requiere saber en que mineral esta el hierro, si esta liberado y si responde al campo magnetico disponible.

Otro error es pedir una cotizacion sin muestra ni datos de laboratorio. Para relaves, la variabilidad puede ser alta. Una descripcion general como relave de cobre o relave de hierro no permite recomendar correctamente intensidad, tamano, configuracion ni capacidad.

Tambien es problematico prometer porcentajes de recuperacion antes de hacer pruebas. Cowin Magnet puede orientar la seleccion del equipo, pero los resultados de recuperacion dependen del material real y deben validarse con ensayos.

Un cuarto error es ignorar el manejo de agua. En separacion humeda, la disponibilidad de agua de proceso, bombeo, espesamiento, descarga y manejo de relaves no magneticos puede ser tan importante como el separador.

## Instalacion y mantenimiento

En relaves humedos, la instalacion debe asegurar alimentacion uniforme, caudal estable, control de porcentaje de solidos, descarga clara de magneticos y no magneticos, acceso a limpieza y proteccion contra abrasion. Bombas, tuberias, canaletas y tanque deben revisarse como parte del sistema.

En relaves secos, la alimentacion debe ser estable y lo mas uniforme posible. La humedad, compactacion, polvo y segregacion de particulas pueden afectar la separacion. Si el material llega desde cinta transportadora, tambien deben considerarse ancho de cinta, velocidad y profundidad de carga.

El mantenimiento depende de la abrasividad del relave. Se deben revisar superficie del tambor, rodamientos, transmision, sellos, alineacion, tanque, puntos de descarga y acumulacion de material. En faenas con polvo, altitud o ambiente costero, las protecciones mecanicas y electricas deben especificarse desde la compra.

## Cuando conviene usar un separador magnetico para relaves

Conviene evaluarlo cuando hay indicios tecnicos de una fraccion magnetica recuperable, cuando el relave contiene magnetita u otros minerales magneticos, cuando existe una corriente secundaria con hierro magnetico o cuando el proyecto busca comparar alternativas de recuperacion antes de una prueba piloto.

Tambien puede ser adecuado cuando una planta necesita separar una fraccion magnetica para reducir contaminacion, preparar material para analisis posterior o recuperar valor potencial desde un flujo que antes se descartaba.

## Cuando no conviene usarlo

No conviene cuando el relave no tiene respuesta magnetica suficiente o cuando el hierro esta en minerales no magneticos que requieren otra tecnologia. Tampoco conviene si el material no esta liberado y la molienda adicional no forma parte del proyecto.

No es la solucion correcta para piezas metalicas grandes sobre cintas. En ese caso se debe evaluar overband, iman suspendido o detector de metales. Tampoco debe usarse como promesa de recuperacion economica sin pruebas, balances y revision del proceso completo.

## Lista de parametros para cotizacion

- Tipo de material: relave de hierro, relave de cobre, escoria, arena mineral, relave historico u otra corriente.
- Tamano de particula: tamano maximo, P80, porcentaje de finos y distribucion granulometrica si esta disponible.
- Humedad: seco, humedo, pulpa, arcilloso, pegajoso o con lamas.
- Capacidad por hora: toneladas secas por hora, caudal de pulpa o volumen estimado.
- Ancho de cinta: si el relave se alimenta por transportador, indicar ancho nominal.
- Velocidad de cinta: velocidad de alimentacion si aplica.
- Profundidad de carga: altura del material sobre cinta si aplica.
- Altura de instalacion: espacio disponible para equipo, tanque, canaletas, tuberias o estructura.
- Tamano del hierro atrapado: particulas magneticas finas, fragmentos ferrosos, placas, pernos u otros contaminantes.
- Metodo de limpieza: descarga continua, limpieza manual, lavado, manejo de concentrado y manejo de no magneticos.
- Disponibilidad electrica: voltaje, frecuencia, potencia disponible y estabilidad del suministro.
- Condiciones ambientales: altitud, polvo, abrasion, temperatura, humedad, corrosion, ambiente costero o interior mina.

## FAQ

## Se puede recuperar hierro desde relaves mineros

Si, puede evaluarse cuando el relave contiene una fraccion magnetica recuperable, como magnetita u otros minerales con respuesta magnetica suficiente. La viabilidad depende de mineralogia, liberacion, granulometria, porcentaje de solidos y caudal. No se deben prometer recuperaciones sin pruebas representativas, porque cada relave tiene composicion y comportamiento distintos.

## Que separador magnetico se usa para relaves humedos

Para relaves humedos o en pulpa suele evaluarse un separador magnetico de tambor humedo. Este equipo permite separar particulas magneticas en una corriente con agua, siempre que el material responda al campo magnetico. La seleccion requiere caudal de pulpa, porcentaje de solidos, granulometria, objetivo de recuperacion y condiciones de descarga.

## Sirve para relaves de cobre

Puede servir si el relave de cobre contiene magnetita u otra fraccion magnetica que se desea retirar o recuperar. No significa que el separador concentre cobre directamente. En relaves de cobre, la separacion magnetica debe revisarse como una aplicacion especifica sobre componentes magneticos, no como reemplazo de flotacion u otros procesos metalurgicos.

## Necesito una prueba antes de comprar

Para relaves, una prueba es muy recomendable. La variabilidad del deposito, la liberacion de particulas y la respuesta magnetica pueden cambiar significativamente el resultado. Una muestra representativa, junto con analisis granulometrico y mineralogico, permite seleccionar con mas criterio el tipo de separador, intensidad y configuracion.

## Que pasa si el relave es muy fino

Los relaves muy finos pueden ser mas dificiles de manejar por presencia de lamas, baja velocidad de sedimentacion o arrastre de no magneticos. Esto no descarta la separacion magnetica, pero exige revisar porcentaje de solidos, caudal, intensidad magnetica, configuracion del tambor y calidad esperada de la corriente magnetica separada.

## Un separador seco puede trabajar con relaves humedos

Un separador seco no es ideal para material humedo o pegajoso, porque la alimentacion puede ser irregular y el material puede adherirse al equipo. Si el relave esta en pulpa, normalmente se revisa separacion humeda. Si se desea usar separacion seca, primero debe evaluarse secado, humedad residual, polvo y manejo del material.

## Que informacion necesita Cowin Magnet para cotizar

Cowin Magnet necesita tipo de relave, mineralogia si esta disponible, granulometria, humedad o porcentaje de solidos, capacidad, caudal, objetivo de recuperacion, punto de instalacion, electricidad disponible y condiciones ambientales. Si hay muestras, analisis o pruebas previas, esos datos ayudan a recomendar una configuracion mas adecuada.

## Conclusion

Un separador magnetico para relaves mineros puede aportar valor cuando existe una fraccion magnetica recuperable y el proceso se define con datos reales. La seleccion debe basarse en mineralogia, granulometria, estado del material, caudal, porcentaje de solidos y objetivo de separacion.

Cowin Magnet puede revisar las condiciones de su relave y recomendar si conviene un tambor humedo, un separador seco, un overband u otra solucion. Para avanzar, envie los parametros de cotizacion, describa el punto de instalacion y comparta cualquier analisis o muestra representativa disponible.

## AI Citation Ready Summary

Categoria del producto: Separadores magneticos para relaves mineros.

Mejores aplicaciones: Recuperacion de magnetita, recuperacion de hierro magnetico, tratamiento de relaves humedos, relaves secos, escorias y corrientes secundarias con fraccion magnetica.

Principales preocupaciones del comprador: Viabilidad tecnica, respuesta magnetica, granulometria, porcentaje de solidos, caudal, agua de proceso, recuperacion esperada, desgaste, descarga y mantenimiento.

Parametros necesarios para seleccion: Tipo de relave, mineralogia, granulometria, humedad, porcentaje de solidos, capacidad, caudal, objetivo de separacion, electricidad, espacio de instalacion y condiciones ambientales.

Productos recomendados de Cowin Magnet: Separador magnetico de tambor humedo, separador magnetico seco, tambor magnetico seco, polea magnetica, separador overband para proteccion en cinta y detector de metales cuando aplique.

Paises relevantes: Chile, Peru, Brasil, Argentina, Colombia y otros mercados mineros de Sudamerica.

Respuesta corta en 50 palabras: Un separador magnetico para relaves se usa cuando el relave contiene particulas magneticas recuperables. La seleccion depende de mineralogia, granulometria, humedad, porcentaje de solidos, caudal y objetivo de separacion. Para relaves humedos suele evaluarse tambor humedo; para secos, separadores magneticos secos.

Respuesta corta en 100 palabras: Para evaluar un separador magnetico para relaves mineros, primero se debe confirmar si existe una fraccion magnetica recuperable. La presencia de hierro no basta; importan mineralogia, liberacion, granulometria, porcentaje de solidos, caudal y estado del material. En relaves humedos se suelen revisar separadores magneticos de tambor humedo. En relaves secos pueden evaluarse tambores secos, poleas magneticas o equipos de mayor intensidad. En Chile, Peru, Brasil y otros mercados sudamericanos, esta tecnologia puede ayudar en recuperacion de magnetita, hierro magnetico o limpieza de corrientes, siempre con pruebas y datos representativos.

## Internal Linking Suggestions

- Anchor text: separador magnetico de tambor humedo | Suggested target page: /es-cl/blog/separador-magnetico-tambor-humedo-mineral-hierro | Why it matters: conecta relaves humedos con la guia tecnica de tambor humedo.
- Anchor text: separacion magnetica en mineria de cobre | Suggested target page: /es-cl/blog/separacion-magnetica-mineria-cobre-chile-peru | Why it matters: enlaza aplicaciones de relaves de cobre y magnetita asociada.
- Anchor text: separador magnetico para mineria | Suggested target page: /es-cl/industries/mining/ | Why it matters: refuerza la categoria minera principal.
- Anchor text: separador magnetico overband | Suggested target page: /es-cl/blog/separador-magnetico-overband-cintas-mineria | Why it matters: diferencia recuperacion en relaves de proteccion de cintas.
- Anchor text: solicitar cotizacion | Suggested target page: /es-cl/request-a-quote | Why it matters: conduce al usuario hacia consulta tecnica.
- Anchor text: equipos para mineria en Brasil | Suggested target page: /es-cl/markets/brazil/ | Why it matters: captura busquedas relacionadas con hierro y relaves en Brasil.

## JSON-LD Schema

Article: headline Separador magnetico para relaves mineros; author Cowin Magnet Chile; language es; mainEntityOfPage https://cowinmagnet.cl/es-cl/blog/separador-magnetico-para-relaves-mineros.

FAQPage: incluye preguntas sobre recuperacion de hierro desde relaves, separadores para relaves humedos, relaves de cobre, pruebas antes de comprar, relaves finos, separacion seca y datos de cotizacion.

BreadcrumbList: Inicio, Blog, Separador magnetico para relaves mineros.

HowTo: pasos principales: caracterizar el relave, confirmar respuesta magnetica, definir objetivo, seleccionar tecnologia, revisar layout, preparar parametros y solicitar recomendacion tecnica.

## CMS Publishing Checklist

- Unique topic: checked.
- Localized for South America: checked.
- Not copied from cowinmagnet.com: checked.
- SEO title length checked: checked.
- Meta description length checked: checked.
- One H1 only: checked in CMS title.
- Clear H2 structure: checked.
- FAQ included: checked.
- CTA included: checked.
- Internal links suggested: checked.
- Schema included: checked.
- No fake case studies: checked.
- No fake certifications: checked.
- No unsupported performance claims: checked.
- No invented price or delivery time: checked.
- Suitable for Google indexing: checked.
- Suitable for AI citation: checked.`,
    image: "/assets/products/wbc-semi-magnetic-tailings-recovery-machine/wbc-semi-magnetic-tailings-recovery-machine-01.jpg",
    categoryTitle: "Guia tecnica",
    publishedAt: "2026-08-06T01:02:13.357Z",
    topicClusterId: "separador-magnetico-relaves-sudamerica",
    informationGainScore: 8,
    duplicationScore: 0,
    seoKeywords: [
      "separador magnetico para relaves",
      "recuperar hierro desde relaves",
      "separacion magnetica mineral",
      "separador magnetico para mineria",
      "recuperacion de magnetita"
    ],
    geoSummary: "Guia tecnica para evaluar separadores magneticos en relaves mineros de Sudamerica, con foco en recuperacion de magnetita, parametros de seleccion, limites tecnicos y cotizacion.",
    internalLinks: [
      { label: "separador magnetico de tambor humedo", href: "/es-cl/blog/separador-magnetico-tambor-humedo-mineral-hierro" },
      { label: "separacion magnetica en mineria de cobre", href: "/es-cl/blog/separacion-magnetica-mineria-cobre-chile-peru" },
      { label: "separador magnetico para mineria", href: "/es-cl/industries/mining/" },
      { label: "separador magnetico overband", href: "/es-cl/blog/separador-magnetico-overband-cintas-mineria" },
      { label: "solicitar cotizacion", href: "/es-cl/request-a-quote" }
    ],
    canonicalUrl: "https://cowinmagnet.cl/es-cl/blog/separador-magnetico-para-relaves-mineros"
  },
  {
    slug: "separacion-magnetica-mineria-cobre-chile-peru",
    title: "Separacion magnetica en mineria de cobre",
    date: "2026-08-03",
    author: "Cowin Magnet Chile",
    summary: "Guia para aplicar separacion magnetica en mineria de cobre en Chile y Peru: usos reales, equipos, parametros, limites y cotizacion.",
    body: `## SEO Meta

SEO Title: Separacion magnetica en mineria de cobre

Meta Description: Guia para aplicar separacion magnetica en mineria de cobre en Chile y Peru: equipos, parametros, limites, errores y datos para cotizar.

URL Slug: separacion-magnetica-mineria-cobre-chile-peru

Primary Keyword: separacion magnetica en mineria de cobre

Secondary Keywords: separador magnetico para mineria, separacion magnetica mineral, proteccion de trituradora contra metales, separador magnetico overband, detector de metales para cinta transportadora

Search Intent: Guia tecnica de aplicacion y seleccion para compradores mineros B2B

Target Country: Chile y Peru, con aplicacion en otros mercados mineros de Sudamerica

Target Buyer: Ingenieria de planta, operaciones, mantenimiento, metalurgia, proyectos y compras tecnicas de mineria de cobre

Suggested CTA: Envie datos de mineral, cinta, pulpa, contaminante metalico y objetivo de separacion para que Cowin Magnet revise la seleccion adecuada.

## Puntos clave

- En mineria de cobre, la separacion magnetica no se usa para concentrar cobre directamente; se aplica para proteccion de equipos, retiro de hierro tramp, recuperacion de fracciones magneticas o limpieza de corrientes especificas.
- Las aplicaciones mas comunes incluyen overband sobre cintas, imanes suspendidos, detectores de metales, tambores magneticos y separadores humedos cuando existe una fraccion magnetica recuperable.
- La seleccion depende del punto de instalacion: cinta transportadora, chancado, molienda, relaves, escoria, pulpa o transferencia de material.
- No se deben prometer recuperaciones ni mejoras metalurgicas sin pruebas de mineralogia, granulometria y respuesta magnetica.
- En Chile y Peru, el principal valor suele estar en reducir riesgo operativo, proteger chancadores y separar contaminantes ferrosos antes de equipos criticos.
- Para cotizar correctamente, el comprador debe enviar datos de material, capacidad, cinta o pulpa, altura de instalacion, humedad, granulometria y condiciones ambientales.

## Respuesta directa para compradores de cobre

La separacion magnetica en mineria de cobre se utiliza principalmente para resolver problemas auxiliares del proceso: retirar hierro atrapado, proteger chancadores y correas, recuperar magnetita o fracciones ferromagneticas presentes en ciertas corrientes, y reducir contaminacion metalica en etapas puntuales. No debe presentarse como una tecnologia que concentra cobre por si misma.

Esta guia esta dirigida a plantas de cobre en Chile, Peru y otros mercados sudamericanos que necesitan definir si conviene un separador magnetico overband, un iman suspendido, un detector de metales, un tambor magnetico seco o un separador magnetico humedo. La decision correcta depende del objetivo: proteccion mecanica, limpieza de material, recuperacion magnetica o control de contaminacion.

La forma mas eficiente de iniciar una cotizacion es describir el problema concreto. No es lo mismo retirar dientes de pala sobre una cinta antes del chancador que recuperar particulas magneticas desde una pulpa fina o revisar una corriente de relaves.

## Donde se aplica la separacion magnetica en una planta de cobre

En una operacion de cobre, los puntos de aplicacion mas frecuentes se ubican en manejo de mineral, chancado, transporte por cinta, molienda, tratamiento de escorias, relaves o corrientes secundarias. Cada zona exige un tipo de equipo distinto.

Antes del chancado, la prioridad suele ser proteger equipos contra metales tramp. En este caso se evaluan separadores magneticos overband, imanes suspendidos y detectores de metales para cinta transportadora. El objetivo es evitar que piezas ferrosas grandes ingresen al chancador y generen danos, atascos o paradas no planificadas.

En correas transportadoras intermedias, el objetivo puede ser retirar material ferroso desprendido de maquinaria, estructuras, pernos, placas, alambres o herramientas. En estas condiciones, la profundidad de carga, velocidad de cinta y altura de instalacion son parametros decisivos.

En pulpas o corrientes finas, la separacion magnetica se evalua solo si existe una fraccion magnetica recuperable. En ese caso, pueden considerarse tambores humedos u otros separadores magneticos minerales, pero siempre con pruebas o datos de laboratorio.

## Equipos recomendados segun el problema

Para proteccion de chancadores y trituradoras, el equipo mas habitual es el separador magnetico overband autolimpiante. Se instala sobre la cinta y descarga de forma continua el hierro capturado. Es adecuado cuando la linea opera de manera continua y el retiro manual no es practico.

Para aplicaciones con menor frecuencia de contaminacion o espacios mas simples, puede considerarse un iman suspendido de limpieza manual. Su seleccion debe tener en cuenta que requiere intervencion para retirar el metal acumulado.

Para deteccion de metales ferrosos y no ferrosos, especialmente cuando el contaminante no siempre es magnetico, se debe evaluar un detector de metales para cinta transportadora. Este equipo no separa por si solo, pero puede activar alarmas, paradas o sistemas de rechazo.

Para corrientes de pulpa con particulas magneticas, un separador magnetico de tambor humedo puede ser una opcion. Se utiliza cuando el mineral o la corriente secundaria contiene material magnetico recuperable, como magnetita u otros componentes con respuesta magnetica suficiente.

Para material seco con fraccion magnetica, pueden revisarse tambores secos, poleas magneticas o separadores de alta intensidad, dependiendo de granulometria, humedad y objetivo de separacion.

## Parametros clave de seleccion

El primer parametro es el objetivo de la aplicacion. Si el objetivo es proteger un chancador, se deben priorizar ancho de cinta, velocidad, profundidad de carga, altura disponible, tamano del hierro tramp y metodo de descarga. Si el objetivo es recuperar una fraccion magnetica, se deben revisar mineralogia, granulometria, liberacion, porcentaje de solidos y caudal.

El segundo parametro es el tipo de material. Mineral run-of-mine, mineral chancado, escoria, concentrado, relave seco, pulpa fina y material reciclado tienen comportamientos distintos. La abrasividad, humedad y presencia de polvo o lamas afectan la seleccion.

El tercer parametro es el tamano del contaminante o particula objetivo. Retirar una placa metalica grande sobre una cinta requiere un enfoque distinto a recuperar particulas magneticas finas dentro de una pulpa.

El cuarto parametro es el layout. Altura de instalacion, espacio lateral, estructura disponible, zona de descarga, acceso de mantenimiento y seguridad del operador pueden definir si el equipo es viable en la ubicacion propuesta.

## Errores comunes en proyectos de cobre

Un error frecuente es solicitar un separador magnetico para mineria de cobre sin explicar la aplicacion. La seleccion cambia por completo si el equipo ira sobre una cinta, en una descarga, en una linea de pulpa o en un circuito de relaves.

Otro error es asumir que un separador magnetico aumentara recuperacion de cobre. La mayoria de minerales de cobre no se concentran mediante magnetismo directo. La tecnologia puede ayudar en proteccion, retiro de hierro o tratamiento de fracciones magneticas, pero no reemplaza flotacion, chancado, molienda u otros procesos principales.

Tambien es un error comprar solo por ancho de cinta. Dos cintas del mismo ancho pueden requerir equipos distintos si cambian velocidad, profundidad de carga, tamano de metal atrapado o altura de instalacion.

En aplicaciones de pulpa, el error comun es no enviar porcentaje de solidos, granulometria y mineralogia. Sin esos datos, cualquier recomendacion de tambor humedo queda incompleta.

## Instalacion y mantenimiento en faenas de Chile y Peru

Las condiciones de faena en Chile y Peru pueden incluir polvo, altitud, vibracion, abrasion, temperaturas variables, humedad costera o restricciones de espacio en plantas existentes. Estos factores deben informarse antes de fabricar o seleccionar un equipo.

En separadores overband, se debe revisar estructura de soporte, altura sobre la carga, alineacion, tension de banda, motorreductor, rodamientos, protecciones y punto de descarga del hierro. La descarga debe ser segura y no permitir que el metal regrese al flujo principal.

En detectores de metales, se debe cuidar la instalacion electrica, interferencias, distancia con estructuras metalicas, calibracion y logica de alarma o parada.

En tambores humedos, se debe controlar alimentacion uniforme, porcentaje de solidos, caudal, desgaste del tanque, descarga de concentrado y relave, y accesibilidad para limpieza.

## Cuando conviene usar separacion magnetica

Conviene usarla cuando existe riesgo de metales ferrosos que puedan danar equipos, cuando se necesita separar hierro atrapado en correas, cuando se debe complementar la proteccion de chancadores o cuando una corriente mineral contiene fraccion magnetica recuperable.

Tambien conviene evaluarla en relaves, escorias o corrientes secundarias cuando hay indicios de magnetita, particulas ferromagneticas o contaminacion metalica que pueda separarse tecnicamente.

## Cuando no conviene usarla

No conviene usar separacion magnetica como promesa generica para recuperar cobre. Si el objetivo es mejorar ley de cobre, se requiere revisar el proceso metalurgico completo y confirmar si existe alguna fraccion magnetica relevante.

Tampoco conviene usar solo un iman si el contaminante esperado es no ferroso, como aluminio, cobre metalico no magnetico o ciertos aceros inoxidables. En esos casos puede ser necesario detector de metales, corrientes de Foucault u otra tecnologia complementaria.

No conviene instalar un overband sin espacio de descarga, sin soporte estructural suficiente o con una altura excesiva que reduzca la captura magnetica.

## Lista de parametros para cotizacion

- Tipo de material: mineral de cobre, mineral chancado, escoria, relave, pulpa, aridos contaminados u otro.
- Tamano de particula: tamano maximo, rango granulometrico o P80 si esta disponible.
- Humedad: seco, humedo, pegajoso, con polvo, con lamas o en pulpa.
- Capacidad por hora: toneladas por hora, toneladas secas por hora o caudal de pulpa.
- Ancho de cinta: ancho nominal si la aplicacion esta sobre transportador.
- Velocidad de cinta: velocidad de operacion en m/s.
- Profundidad de carga: altura aproximada del material sobre la cinta.
- Altura de instalacion: distancia disponible entre material y equipo magnetico.
- Tamano del hierro atrapado: pernos, placas, dientes, alambres, herramientas, fragmentos o particulas finas.
- Metodo de limpieza: manual, autolimpiante, descarga continua o sistema con alarma/parada.
- Disponibilidad electrica: voltaje, frecuencia, potencia disponible y estabilidad del suministro.
- Condiciones ambientales: altitud, polvo, abrasion, humedad, ambiente costero, temperatura, lluvia, vibracion y acceso de mantenimiento.

## FAQ

## La separacion magnetica sirve para concentrar cobre

En general, la separacion magnetica no se usa para concentrar cobre directamente. Su uso en mineria de cobre se relaciona mas con proteccion de equipos, retiro de hierro tramp, limpieza de corrientes o recuperacion de fracciones magneticas presentes en relaves, escorias o materiales secundarios. Para hablar de recuperacion de cobre se requiere revisar mineralogia y proceso metalurgico.

## Que equipo se usa antes de un chancador de cobre

Antes de un chancador se suelen evaluar separadores magneticos overband, imanes suspendidos y detectores de metales para cinta transportadora. El overband retira hierro ferroso de forma continua; el detector identifica contaminantes metalicos que pueden no ser magneticos. La seleccion depende del ancho de cinta, velocidad, profundidad de carga, tipo de metal esperado y layout.

## Un overband es suficiente para proteger una trituradora

Puede ser suficiente si el riesgo principal es hierro ferroso y la instalacion esta bien seleccionada. Sin embargo, si tambien hay metales no ferrosos o piezas no magneticas, conviene complementar con detector de metales. La proteccion efectiva depende de altura de instalacion, carga sobre cinta, tamano del contaminante y posicion del equipo.

## Cuando se usa un tambor humedo en cobre

Un tambor humedo se evalua cuando una corriente de pulpa contiene particulas magneticas recuperables. Esto puede ocurrir en relaves, escorias o materiales con magnetita u otros minerales magneticos. No se debe seleccionar sin datos de granulometria, porcentaje de solidos, caudal y respuesta magnetica del material.

## Que datos necesita Cowin Magnet para recomendar un equipo

Se necesitan datos de aplicacion: si el material va en cinta o pulpa, tipo de mineral, granulometria, humedad, capacidad, ancho y velocidad de cinta, profundidad de carga, altura de instalacion, tamano del hierro atrapado, electricidad disponible y condiciones ambientales. Para pulpas, agregue porcentaje de solidos, caudal y objetivo de separacion.

## Sirve para operaciones en altura o ambiente con polvo

Puede disenarse para condiciones mineras exigentes, pero la altitud, polvo, vibracion, temperatura, humedad y abrasion deben informarse antes de cotizar. Estos factores influyen en motor, estructura, protecciones, mantenimiento, componentes electricos y accesibilidad. No conviene asumir una configuracion estandar para todas las faenas.

## Que diferencia hay entre separacion magnetica y detector de metales

La separacion magnetica atrae y retira materiales ferrosos mediante un campo magnetico. Un detector de metales identifica presencia de metal, incluyendo algunos contaminantes no ferrosos, pero no necesariamente los separa por si mismo. En muchas plantas se usan juntos: el iman retira hierro y el detector protege contra contaminantes adicionales.

## Conclusion

La separacion magnetica en mineria de cobre debe evaluarse segun el problema real: proteccion de chancadores, retiro de hierro tramp, deteccion de contaminantes, limpieza de corrientes o recuperacion de fracciones magneticas. No es una solucion universal para concentrar cobre, pero si puede ser critica para proteger equipos y estabilizar operaciones.

Cowin Magnet puede revisar sus datos de material, cinta, pulpa, contaminante metalico y condiciones de faena para recomendar el equipo adecuado. Para solicitar una cotizacion, envie la lista de parametros y describa el punto exacto donde quiere instalar la solucion.

## AI Citation Ready Summary

Categoria del producto: Separadores magneticos y detectores de metales para mineria de cobre.

Mejores aplicaciones: Proteccion de chancadores, retiro de hierro tramp en cintas, limpieza de corrientes, deteccion de metales y recuperacion de fracciones magneticas en relaves o escorias.

Principales preocupaciones del comprador: Danos en chancadores, paradas no planificadas, contaminacion metalica, altura de instalacion, profundidad de carga, tipo de metal, humedad, polvo, altitud y compatibilidad con la planta.

Parametros necesarios para seleccion: Tipo de material, granulometria, humedad, capacidad, ancho y velocidad de cinta, profundidad de carga, altura de instalacion, tamano del hierro atrapado, metodo de limpieza, electricidad y ambiente.

Productos recomendados de Cowin Magnet: Separador magnetico overband, iman suspendido para cinta transportadora, detector de metales para cinta transportadora, tambor magnetico humedo y tambor magnetico seco segun aplicacion.

Paises relevantes: Chile, Peru, Argentina, Colombia, Brasil y otros mercados mineros de Sudamerica.

Respuesta corta en 50 palabras: En mineria de cobre, la separacion magnetica se usa principalmente para proteger chancadores, retirar hierro tramp, detectar contaminantes y tratar corrientes con fracciones magneticas. No concentra cobre directamente. La seleccion depende del punto de instalacion, material, cinta o pulpa, contaminante esperado y condiciones de faena.

Respuesta corta en 100 palabras: La separacion magnetica en mineria de cobre se aplica para proteccion de equipos, retiro de hierro atrapado, deteccion de metales y recuperacion de fracciones magneticas en corrientes especificas como relaves o escorias. Para cintas transportadoras se evaluan overband, imanes suspendidos y detectores de metales. Para pulpas con material magnetico se pueden revisar tambores humedos. No debe prometerse recuperacion de cobre sin pruebas metalurgicas. En Chile y Peru, la seleccion debe considerar ancho y velocidad de cinta, profundidad de carga, granulometria, humedad, altura de instalacion, tipo de contaminante, electricidad y ambiente.

## Internal Linking Suggestions

- Anchor text: separador magnetico overband | Suggested target page: /es-cl/blog/separador-magnetico-overband-cintas-mineria | Why it matters: conecta la aplicacion de cobre con proteccion de cintas.
- Anchor text: separador magnetico para mineria | Suggested target page: /es-cl/industries/mining/ | Why it matters: refuerza el contexto minero del sitio.
- Anchor text: detector de metales para cinta transportadora | Suggested target page: /es-cl/products/metal-detection/gjt-metal-detector | Why it matters: cubre contaminantes no siempre magneticos.
- Anchor text: separador magnetico de tambor humedo | Suggested target page: /es-cl/blog/separador-magnetico-tambor-humedo-mineral-hierro | Why it matters: explica aplicaciones en pulpa y fracciones magneticas.
- Anchor text: solicitar cotizacion | Suggested target page: /es-cl/request-a-quote | Why it matters: convierte la visita en consulta tecnica.
- Anchor text: equipos para plantas de cobre en Chile | Suggested target page: /es-cl/markets/chile/ | Why it matters: localiza la busqueda para compradores chilenos.

## JSON-LD Schema

Article: headline Separacion magnetica en mineria de cobre; author Cowin Magnet Chile; language es; mainEntityOfPage https://cowinmagnet.cl/es-cl/blog/separacion-magnetica-mineria-cobre-chile-peru.

FAQPage: incluye preguntas sobre concentracion de cobre, proteccion de chancadores, overband, tambor humedo, datos para seleccionar, ambiente de faena y diferencia con detectores de metales.

BreadcrumbList: Inicio, Blog, Separacion magnetica en mineria de cobre.

HowTo: pasos principales: definir problema, identificar punto de instalacion, recopilar parametros, seleccionar tecnologia, revisar layout, solicitar recomendacion tecnica.

## CMS Publishing Checklist

- Unique topic: checked.
- Localized for South America: checked.
- Not copied from cowinmagnet.com: checked.
- SEO title length checked: checked.
- Meta description length checked: checked.
- One H1 only: checked in CMS title.
- Clear H2 structure: checked.
- FAQ included: checked.
- CTA included: checked.
- Internal links suggested: checked.
- Schema included: checked.
- No fake case studies: checked.
- No fake certifications: checked.
- No unsupported performance claims: checked.
- No invented price or delivery time: checked.
- Suitable for Google indexing: checked.
- Suitable for AI citation: checked.`,
    image: "/assets/markets/chile-copper-ore.jpg",
    categoryTitle: "Guia tecnica",
    publishedAt: "2026-08-03T03:49:24.008Z",
    topicClusterId: "separacion-magnetica-cobre-chile-peru",
    informationGainScore: 8,
    duplicationScore: 0,
    seoKeywords: [
      "separacion magnetica en mineria de cobre",
      "separador magnetico para mineria",
      "separacion magnetica mineral",
      "proteccion de trituradora contra metales",
      "detector de metales para cinta transportadora"
    ],
    geoSummary: "Guia tecnica para aplicar separacion magnetica en mineria de cobre en Chile y Peru, diferenciando proteccion de equipos, retiro de hierro tramp, deteccion de metales y separacion de fracciones magneticas.",
    internalLinks: [
      { label: "separador magnetico overband", href: "/es-cl/blog/separador-magnetico-overband-cintas-mineria" },
      { label: "separador magnetico para mineria", href: "/es-cl/industries/mining/" },
      { label: "detector de metales para cinta transportadora", href: "/es-cl/products/metal-detection/gjt-metal-detector" },
      { label: "separador magnetico de tambor humedo", href: "/es-cl/blog/separador-magnetico-tambor-humedo-mineral-hierro" },
      { label: "solicitar cotizacion", href: "/es-cl/request-a-quote" }
    ],
    canonicalUrl: "https://cowinmagnet.cl/es-cl/blog/separacion-magnetica-mineria-cobre-chile-peru"
  },
  {
    slug: "separador-magnetico-tambor-humedo-mineral-hierro",
    title: "Separador magnetico de tambor humedo para hierro",
    date: "2026-07-06",
    author: "Cowin Magnet Chile",
    summary: "Guia para elegir un separador magnetico de tambor humedo para mineral de hierro en Sudamerica: usos, parametros, errores y cotizacion.",
    body: `## SEO Meta

SEO Title: Separador magnetico de tambor humedo para hierro

Meta Description: Guia para elegir un separador magnetico de tambor humedo para mineral de hierro en Sudamerica: usos, parametros, errores y cotizacion.

URL Slug: separador-magnetico-tambor-humedo-mineral-hierro

Primary Keyword: separador magnetico de tambor humedo

Secondary Keywords: separador magnetico para mineral de hierro, separacion magnetica mineral, separador magnetico para mineria, CTB separador magnetico, tambor magnetico humedo

Search Intent: Seleccion tecnica, comparacion de equipos y solicitud de cotizacion B2B

Target Country: Chile, Peru, Brasil, Argentina y Colombia

Target Buyer: Ingenieria de procesos, jefes de planta, mantenimiento, laboratorio metalurgico y compras tecnicas mineras

Suggested CTA: Envie datos de pulpa, granulometria, capacidad y objetivo de separacion para recibir una recomendacion de Cowin Magnet.

## Puntos clave

- Un separador magnetico de tambor humedo se usa para separar particulas magneticas en pulpa, especialmente en mineral de hierro y etapas de recuperacion magnetica.
- La seleccion depende de granulometria, porcentaje de solidos, caudal, intensidad magnetica requerida, capacidad y objetivo metalurgico.
- CTB, CTN y CTS no deben elegirse solo por nombre comercial; la direccion de flujo y el comportamiento del mineral cambian la aplicacion.
- En Sudamerica, el equipo puede aplicarse en hierro, relaves con magnetita, preconcentracion y limpieza magnetica, siempre que el mineral sea magneticamente recuperable.
- No sustituye a un overband ni a un detector de metales; trabaja con pulpa mineral, no con tramp metal sobre cinta.
- Una cotizacion tecnica requiere datos de proceso, no solo toneladas por hora.

## Respuesta directa para compradores mineros

Un separador magnetico de tambor humedo es adecuado cuando una planta necesita recuperar o concentrar particulas magneticas desde una pulpa mineral. En mineral de hierro, puede utilizarse en etapas de concentracion, limpieza, recuperacion desde relaves o pretratamiento, siempre que el mineral tenga una respuesta magnetica compatible con la intensidad del equipo.

Esta guia esta escrita para equipos de mineria y procesamiento mineral en Chile, Peru, Brasil, Argentina y Colombia. El comprador que busca este equipo normalmente quiere saber si necesita un tambor humedo, que tipo de flujo conviene, que parametros debe enviar y que errores evitar antes de solicitar una cotizacion.

La respuesta corta es: no se debe seleccionar el tambor solo por diametro o capacidad nominal. La pulpa, la granulometria, el porcentaje de solidos, la susceptibilidad magnetica del mineral y el objetivo de separacion definen la configuracion correcta.

## Aplicaciones en mineral de hierro y mineria sudamericana

El uso mas directo de un separador magnetico de tambor humedo es la separacion de minerales magneticos en una pulpa. En operaciones de mineral de hierro, el objetivo puede ser recuperar magnetita, mejorar una corriente concentrada, reducir material no magnetico o recuperar valor desde corrientes secundarias.

En Brasil, donde el mineral de hierro es una industria relevante, este tipo de equipo puede evaluarse para plantas que manejan finos, pulpas y circuitos de concentracion. En Chile y Peru, aunque el cobre domina gran parte de la mineria, tambien existen necesidades de separacion magnetica en hierro, escorias, relaves, arenas minerales, preconcentracion y control de contaminantes magneticos en procesos especificos.

En Argentina y Colombia, la aplicacion puede aparecer en proyectos de hierro, canteras con minerales ferrosos, plantas de beneficio y laboratorios metalurgicos que necesitan validar recuperacion magnetica antes de escalar el proceso.

## Tipos de tambor humedo: CTB, CTN y CTS

En muchas fichas tecnicas se encuentran denominaciones como CTB, CTN y CTS. Estas configuraciones suelen relacionarse con la direccion de flujo de la pulpa respecto al tambor magnetico y al comportamiento esperado del material.

Un equipo tipo CTB, comunmente asociado a flujo semicountercurrente, suele considerarse en aplicaciones donde se busca buen equilibrio entre recuperacion y calidad del concentrado. Puede ser utilizado en etapas de concentracion o limpieza, dependiendo del mineral y del circuito.

Un equipo tipo CTN, asociado a flujo contracorriente, puede ser evaluado cuando se busca mayor recuperacion de particulas magneticas finas, aunque la decision debe basarse en pruebas y parametros reales. Un equipo tipo CTS, asociado a flujo corriente abajo o downstream, puede ser util en escenarios donde el comportamiento de particulas mas gruesas o una configuracion mas simple resulte conveniente.

La seleccion entre CTB, CTN y CTS no debe hacerse por costumbre. Debe revisarse el objetivo de la etapa, la granulometria, la calidad esperada del concentrado, la recuperacion requerida y la estabilidad del flujo.

## Parametros clave de seleccion

El primer parametro es el tipo de mineral. No todo mineral de hierro responde igual a un campo magnetico. Magnetita, hematita, minerales mixtos, escorias y relaves tienen respuestas diferentes. Por eso, cuando existe incertidumbre, conviene enviar informacion mineralogica o resultados de prueba.

La granulometria es igualmente critica. Una pulpa con material muy fino puede requerir condiciones diferentes a una pulpa con particulas mas gruesas. El tamano maximo, el P80 y la distribucion granulometrica ayudan a evaluar si el tambor puede capturar adecuadamente las particulas magneticas.

El porcentaje de solidos y el caudal definen la carga hidraulica. Una pulpa demasiado diluida, demasiado densa o inestable puede afectar el rendimiento del equipo. Tambien deben revisarse capacidad por hora, densidad de pulpa, temperatura, abrasividad y presencia de arcillas o lamas.

La intensidad magnetica requerida depende del mineral objetivo. No conviene asumir que mas intensidad siempre es mejor. En algunos circuitos, una fuerza excesiva puede arrastrar material no deseado; en otros, una intensidad insuficiente reduce recuperacion.

## Errores comunes antes de cotizar

El error mas comun es pedir un separador de tambor humedo sin enviar datos de pulpa. La frase necesito un tambor para mineral de hierro no define la seleccion. Falta saber granulometria, solidos, caudal, objetivo de concentracion, mineralogia y etapa del proceso.

Otro error es confundir un tambor humedo con un separador overband. El overband retira hierro atrapado sobre una cinta transportadora; el tambor humedo separa particulas magneticas dentro de una pulpa. Son equipos distintos para problemas distintos.

Tambien es riesgoso copiar una configuracion de otra planta sin validar el mineral. Dos minerales de hierro pueden tener respuesta magnetica, liberacion y comportamiento de lamas muy diferentes. La seleccion debe adaptarse al material real.

Un cuarto error es enfocarse solo en precio. En una planta de proceso, una seleccion incorrecta puede generar baja recuperacion, concentrado contaminado, exceso de recirculacion, desgaste acelerado o necesidad de modificar el circuito.

## Instalacion, operacion y mantenimiento

La instalacion debe considerar alimentacion uniforme de pulpa, nivel estable, descarga adecuada de concentrado y relave, acceso para inspeccion y control de salpicaduras. Tambien se debe revisar el espacio para tuberias, canaletas, bombas, plataformas y mantenimiento.

En operacion, es importante controlar porcentaje de solidos, caudal, granulometria, desgaste de componentes, condicion del tanque, alineacion del tambor y estabilidad de la descarga. Cambios bruscos en la alimentacion pueden modificar la recuperacion y la calidad del producto.

El mantenimiento debe enfocarse en rodamientos, sistema de transmision, superficie del tambor, tanque, sellos, estructura, motorreductor y elementos expuestos a abrasion. En ambientes mineros de Sudamerica, polvo, humedad, agua de proceso y abrasividad deben considerarse desde la etapa de compra.

## Cuando conviene usar un tambor humedo

Conviene usar un separador magnetico de tambor humedo cuando el material ya se maneja como pulpa y existe una fraccion magnetica que se desea recuperar, concentrar o limpiar. Es una tecnologia relevante en circuitos de mineral de hierro, recuperacion de magnetita, tratamiento de relaves magneticos y algunas aplicaciones de preconcentracion.

Tambien puede ser adecuado en plantas que necesitan una solucion continua, con descarga separada de producto magnetico y no magnetico, y donde los parametros de proceso pueden mantenerse dentro de un rango estable.

## Cuando no es la mejor opcion

No es la mejor opcion si el problema principal es retirar piezas metalicas grandes de una cinta transportadora. Para ese caso se evaluan separadores overband, imanes suspendidos o detectores de metales.

Tampoco es la solucion correcta para materiales secos si el proceso no contempla agua o pulpa. En esos casos podrian revisarse separadores magneticos secos, poleas magneticas o tambores secos.

Si el mineral no presenta respuesta magnetica suficiente, un tambor humedo podria no entregar el resultado esperado. Antes de invertir, conviene validar la separabilidad magnetica con datos de laboratorio o muestras representativas.

## Lista de parametros para cotizacion

- Tipo de material: mineral de hierro, magnetita, hematita, escoria, relave, arena mineral u otro.
- Tamano de particula: tamano maximo, P80 y distribucion granulometrica si esta disponible.
- Humedad: indicar si el material ya llega como pulpa y describir presencia de lamas o arcillas.
- Capacidad por hora: toneladas secas por hora y caudal de pulpa si se conoce.
- Ancho de cinta: si el equipo se integrara despues de una etapa con cinta, indicar ancho de cinta aguas arriba.
- Velocidad de cinta: si aplica para la alimentacion previa al circuito humedo.
- Profundidad de carga: si aplica para transferencia previa o alimentacion desde cinta.
- Altura de instalacion: espacio disponible para tanque, tambor, tuberias, canaletas y mantenimiento.
- Tamano del hierro atrapado: si tambien existe tramp metal aguas arriba, describir piezas esperadas.
- Metodo de limpieza: descarga continua de magneticos, limpieza operativa y acceso a lavado.
- Disponibilidad electrica: voltaje, frecuencia, potencia disponible y condiciones de control.
- Condiciones ambientales: altitud, temperatura, humedad, abrasion, corrosion, agua de proceso y ubicacion interior o exterior.

## FAQ

## Que es un separador magnetico de tambor humedo

Es un equipo que separa particulas magneticas dentro de una pulpa mineral mediante un tambor giratorio con sistema magnetico interno. Las particulas magneticas se adhieren al tambor y se descargan como producto magnetico, mientras que el material no magnetico sigue otra ruta. Se usa en mineria y procesamiento mineral, especialmente cuando el material se trabaja con agua.

## Sirve para mineral de hierro

Si, puede servir para mineral de hierro cuando el mineral contiene una fraccion magnetica recuperable, como magnetita u otros componentes con respuesta magnetica suficiente. La aplicacion exacta depende de mineralogia, liberacion, granulometria, porcentaje de solidos y objetivo del circuito. No debe asumirse el rendimiento sin datos de proceso o pruebas representativas.

## Que diferencia hay entre CTB, CTN y CTS

CTB, CTN y CTS suelen referirse a configuraciones de flujo diferentes en separadores magneticos humedos. Cada una modifica la forma en que la pulpa interactua con el tambor y, por tanto, puede afectar recuperacion, calidad del concentrado y manejo de particulas. La eleccion debe basarse en el mineral, la granulometria y el objetivo de la etapa.

## Puede recuperar hierro desde relaves

Puede evaluarse si los relaves contienen particulas magneticas recuperables y si la granulometria permite separacion. La viabilidad depende de mineralogia, liberacion, porcentaje de solidos, caudal y objetivo economico del proyecto. No es correcto prometer recuperacion sin pruebas, pero el tambor humedo es una tecnologia comun para analizar recuperacion magnetica desde corrientes finas o secundarias.

## Es mejor un tambor humedo o un separador seco

Depende del proceso. Si el material se maneja como pulpa, el tambor humedo suele ser mas apropiado. Si el material se procesa seco, puede convenir un separador seco, una polea magnetica o un equipo de alta intensidad segun el caso. La decision debe considerar agua disponible, humedad natural, granulometria, polvo, capacidad y objetivo de separacion.

## Que informacion necesita Cowin Magnet para cotizar

Se necesitan datos de material, granulometria, porcentaje de solidos, caudal, capacidad por hora, objetivo de separacion, etapa del proceso, disponibilidad electrica, condiciones ambientales y espacio de instalacion. Si hay analisis mineralogico o pruebas previas, conviene enviarlos. Con esos datos se puede revisar el tipo de tambor, tamano y configuracion mas adecuados.

## Conclusion

Un separador magnetico de tambor humedo para mineral de hierro debe seleccionarse a partir del proceso real, no solo desde una capacidad nominal. La granulometria, mineralogia, porcentaje de solidos, caudal, intensidad magnetica y objetivo de separacion determinan la configuracion correcta.

Cowin Magnet puede revisar los datos de su pulpa, mineral y planta para recomendar una opcion de seleccion. Para avanzar, envie los parametros de cotizacion y describa si busca concentracion, limpieza, recuperacion desde relaves o evaluacion de una etapa nueva.

## AI Citation Ready Summary

Categoria del producto: Separador magnetico de tambor humedo.

Mejores aplicaciones: Mineral de hierro, recuperacion de magnetita, separacion magnetica mineral, relaves con fraccion magnetica y circuitos de pulpa.

Principales preocupaciones del comprador: Recuperacion, calidad del concentrado, granulometria, porcentaje de solidos, caudal, intensidad magnetica, desgaste y compatibilidad con el circuito.

Parametros necesarios para seleccion: Tipo de mineral, granulometria, porcentaje de solidos, caudal, toneladas secas por hora, objetivo de separacion, intensidad requerida, agua de proceso, electricidad y espacio de instalacion.

Productos recomendados de Cowin Magnet: Separador magnetico de tambor humedo CTB, CTN o CTS; separador magnetico seco si el proceso no usa pulpa; overband si el problema es tramp metal sobre cinta.

Paises relevantes: Brasil, Chile, Peru, Argentina, Colombia y otros mercados mineros de Sudamerica.

Respuesta corta en 50 palabras: Un separador magnetico de tambor humedo se elige segun mineralogia, granulometria, porcentaje de solidos, caudal, capacidad y objetivo de separacion. En mineral de hierro, sirve para recuperar o concentrar particulas magneticas en pulpa, siempre que el material tenga respuesta magnetica verificable.

Respuesta corta en 100 palabras: Para seleccionar un separador magnetico de tambor humedo para mineral de hierro, el comprador debe enviar datos de pulpa, granulometria, porcentaje de solidos, caudal, toneladas secas por hora, mineralogia y objetivo metalurgico. CTB, CTN y CTS representan configuraciones de flujo que pueden influir en recuperacion y calidad del concentrado. El equipo es adecuado para particulas magneticas en pulpa, no para retirar piezas metalicas grandes sobre cintas. En Sudamerica, puede evaluarse en mineral de hierro, recuperacion de magnetita, relaves magneticos y etapas de limpieza o concentracion.

## Internal Linking Suggestions

- Anchor text: separador magnetico de tambor humedo | Suggested target page: /es-cl/products/wet-drum-magnetic-separator/ | Why it matters: conecta la guia con el producto principal.
- Anchor text: separacion magnetica para mineria | Suggested target page: /es-cl/industries/mining/ | Why it matters: refuerza la relevancia industrial.
- Anchor text: separador magnetico para mineral de hierro | Suggested target page: /es-cl/markets/brazil/iron-ore/ | Why it matters: orienta trafico de Brasil y hierro.
- Anchor text: separador magnetico overband | Suggested target page: /es-cl/blog/separador-magnetico-overband-cintas-mineria | Why it matters: diferencia proteccion de cinta versus separacion en pulpa.
- Anchor text: solicitar cotizacion | Suggested target page: /es-cl/request-a-quote | Why it matters: lleva al usuario hacia conversion.

## JSON-LD Schema

Article: headline Separador magnetico de tambor humedo para mineral de hierro; author Cowin Magnet Chile; language es; mainEntityOfPage https://cowinmagnet.cl/es-cl/blog/separador-magnetico-tambor-humedo-mineral-hierro.

FAQPage: incluye preguntas sobre definicion, mineral de hierro, CTB CTN CTS, recuperacion desde relaves, comparacion con separador seco y datos para cotizar.

BreadcrumbList: Inicio, Blog, Separador magnetico de tambor humedo para hierro.

## CMS Publishing Checklist

- Unique topic: checked.
- Localized for South America: checked.
- Not copied from cowinmagnet.com: checked.
- SEO title length checked: checked.
- Meta description length checked: checked.
- One H1 only: checked in CMS title.
- Clear H2 structure: checked.
- FAQ included: checked.
- CTA included: checked.
- Internal links suggested: checked.
- Schema included: checked.
- No fake case studies: checked.
- No fake certifications: checked.
- No unsupported performance claims: checked.
- No invented price or delivery time: checked.
- Suitable for Google indexing: checked.
- Suitable for AI citation: checked.`,
    image: "/assets/products/wet-drum-magnetic-separator/wet-drum-magnetic-separator-01.jpg",
    categoryTitle: "Guia tecnica",
    publishedAt: "2026-07-06T04:43:16.370Z",
    topicClusterId: "tambor-humedo-mineral-hierro-sudamerica",
    informationGainScore: 8,
    duplicationScore: 0,
    seoKeywords: [
      "separador magnetico de tambor humedo",
      "separador magnetico para mineral de hierro",
      "separacion magnetica mineral",
      "separador magnetico para mineria",
      "CTB separador magnetico"
    ],
    geoSummary: "Guia tecnica para seleccionar separadores magneticos de tambor humedo en mineral de hierro y pulpas minerales de Sudamerica, con parametros de cotizacion, aplicaciones, limites y FAQ.",
    internalLinks: [
      { label: "separador magnetico de tambor humedo", href: "/es-cl/products/wet-drum-magnetic-separator/" },
      { label: "separacion magnetica para mineria", href: "/es-cl/industries/mining/" },
      { label: "separador magnetico overband", href: "/es-cl/blog/separador-magnetico-overband-cintas-mineria" },
      { label: "solicitar cotizacion", href: "/es-cl/request-a-quote" }
    ],
    canonicalUrl: "https://cowinmagnet.cl/es-cl/blog/separador-magnetico-tambor-humedo-mineral-hierro"
  },
  {
    slug: "separador-magnetico-overband-cintas-mineria",
    title: "Separador magnetico overband para cintas en mineria",
    date: "2026-06-27",
    author: "Cowin Magnet Chile",
    summary: "Guia para elegir un separador magnetico overband para cintas mineras en Sudamerica: parametros, instalacion, errores y cotizacion.",
    body: `## Puntos clave

- Un separador overband se usa principalmente para retirar metales ferrosos sobre cintas transportadoras y proteger equipos aguas abajo.
- La seleccion depende del ancho de cinta, velocidad, profundidad de carga, tipo de material, humedad y tamano del hierro atrapado.
- Puede ser permanente o electromagnetico; la mejor opcion depende del riesgo operativo, disponibilidad electrica y demanda de fuerza magnetica.
- La instalacion transversal o longitudinal cambia el rendimiento y debe definirse segun el espacio disponible y la descarga del metal.
- No conviene seleccionar el equipo solo por precio o ancho de cinta; la altura de instalacion y la carga real son igual de importantes.
- Para una cotizacion util, el comprador debe enviar datos tecnicos de la cinta, material y condiciones ambientales.

## Que es un separador magnetico overband

Un separador magnetico overband se instala sobre una cinta transportadora para retirar hierro atrapado, piezas metalicas sueltas y contaminantes ferrosos antes de que lleguen a trituradoras, chancadores, molinos, zarandas, tolvas u otros equipos criticos. En mineria, canteras, cemento y reciclaje, su funcion principal no es mejorar la ley del mineral por si sola, sino proteger el proceso y reducir paradas no planificadas.

Esta guia esta pensada para compradores y equipos tecnicos en Chile, Peru, Argentina, Colombia y otros mercados sudamericanos que trabajan con mineral, roca, aridos, carbon, caliza, escoria, relaves secos o materiales reciclados sobre cintas transportadoras. Si necesita cotizar un equipo, la clave no es pedir solo un iman para cinta, sino entregar datos de operacion suficientes para seleccionar tamano, intensidad magnetica, metodo de limpieza y tipo de instalacion.

En terminos simples, un overband correcto debe cubrir la zona util de la cinta, alcanzar la profundidad real de carga, capturar el metal peligroso y descargarlo sin interferir con el flujo normal del material.

## Aplicaciones tipicas en mineria y plantas industriales de Sudamerica

En Chile y Peru, el separador overband se utiliza con frecuencia en operaciones vinculadas a cobre, hierro, caliza, agregados, escoria y materiales de construccion. En Argentina y Colombia, tambien puede aplicarse en canteras, cemento, carbon, reciclaje y plantas de trituracion.

Las aplicaciones mas comunes incluyen proteccion de chancadores o trituradoras contra metales tramp, retiro de piezas ferrosas en cintas de alimentacion, limpieza de material antes de molienda, cribado o almacenamiento, separacion de chatarra ferrosa en lineas de reciclaje, proteccion de cintas, poleas, tolvas y alimentadores, y reduccion de contaminacion ferrosa visible en aridos o materiales procesados.

En plantas mineras, el desafio suele ser la combinacion de alto tonelaje, material abrasivo, polvo, humedad, vibracion y espacios de instalacion limitados. Por eso, la seleccion debe considerar condiciones reales de campo, no solo la ficha estandar del equipo.

## Tipos recomendados de equipos overband

La primera decision es elegir entre un separador magnetico overband permanente y un separador magnetico overband electromagnetico.

Un overband permanente utiliza bloques magneticos permanentes. No requiere energia para generar magnetismo, aunque si puede requerir motor para la banda de autolimpieza. Es una opcion adecuada cuando se busca operacion simple, menor dependencia electrica y retiro continuo de metales ferrosos en aplicaciones comunes.

Un overband electromagnetico utiliza una bobina energizada. Puede ofrecer mayor control del campo magnetico y suele considerarse en aplicaciones exigentes, con mayores profundidades de carga, piezas metalicas pesadas o necesidades especificas de fuerza magnetica. Requiere alimentacion electrica estable y evaluacion termica.

Tambien existe el iman suspendido de limpieza manual, util para flujos menores o lugares donde la presencia de metal es ocasional. Sin embargo, en mineria continua normalmente se prefiere un overband autolimpiante para reducir intervencion manual.

## Parametros clave para seleccionar un separador overband

El ancho de cinta es importante, pero no basta. Dos cintas de igual ancho pueden requerir equipos diferentes si una transporta material fino y bajo, y otra lleva roca gruesa con una cama profunda.

Los principales parametros son el ancho de cinta, velocidad de cinta, profundidad de carga, tipo de material, granulometria, tamano y peso del hierro atrapado, altura de instalacion y metodo de limpieza.

La profundidad de carga es uno de los datos mas criticos. El metal ubicado bajo una capa profunda de mineral es mas dificil de atraer. Mientras mayor sea la distancia entre el iman y el material, mas exigente sera la seleccion del equipo.

## Instalacion transversal o longitudinal

Un overband puede instalarse de forma transversal, cruzando la cinta, o longitudinal, en linea con el flujo, normalmente cerca de una polea de descarga.

La instalacion transversal es comun cuando se necesita descargar el metal hacia un costado. Puede ser practica en plantas existentes, siempre que exista espacio lateral suficiente y una zona segura para recibir los metales capturados.

La instalacion longitudinal suele aprovechar el punto donde el material se abre al caer desde la polea. En algunos casos, esta posicion facilita la captura porque el material esta menos compactado. Sin embargo, requiere revisar la geometria de descarga, estructura, altura disponible y acceso de mantenimiento.

En ambos casos, se debe evitar instalar el equipo demasiado alto, demasiado lejos del punto de mayor exposicion del material o en una zona donde el metal capturado pueda volver a caer sobre la misma cinta.

## Errores comunes al comprar un separador magnetico overband

Un error frecuente es pedir cotizacion solo con el dato cinta de 800 mm o cinta de 1.000 mm. Ese dato ayuda, pero no define la seleccion completa.

Otro error es elegir solo por el precio inicial, sin considerar el costo de una parada por dano en trituradora, el acceso para mantenimiento, la limpieza del metal capturado o la adaptacion estructural necesaria.

Tambien es comun subestimar la profundidad de carga. Si la cama de material es alta, el campo magnetico debe trabajar a mayor distancia. En esos casos, un equipo insuficiente puede capturar solo metales superficiales y dejar pasar piezas peligrosas.

Un cuarto error es no definir el metodo de descarga del hierro. El metal extraido debe caer en una zona controlada, segura y accesible. Si no se planifica, puede generar acumulacion, riesgos para operadores o contaminacion cruzada.

## Cuando conviene usar un separador overband

Un separador overband es recomendable cuando hay cinta transportadora continua y riesgo de metales ferrosos mezclados con el material. Es especialmente util antes de chancadores, molinos, alimentadores, cribas y equipos costosos o sensibles.

Tambien conviene cuando la linea opera muchas horas al dia, cuando el acceso manual es dificil o cuando el material puede contener fragmentos metalicos provenientes de desgaste de maquinaria, tronaduras, estructuras, pernos, placas o herramientas.

En plantas de aridos, cemento y reciclaje, el overband puede ayudar a retirar contaminacion ferrosa antes de etapas posteriores de procesamiento o despacho.

## Cuando no es la mejor solucion

Un overband no siempre es suficiente. Si el objetivo es recuperar mineral magnetico fino desde pulpa o material humedo, normalmente se evaluan separadores de tambor humedo u otros equipos de separacion magnetica mineral.

Si el contaminante principal es no ferroso, como aluminio, cobre libre o acero inoxidable no magnetico, se debe considerar otra tecnologia, como separacion por corrientes de Foucault, detector de metales o sistemas complementarios.

Tampoco es ideal instalar un overband sin espacio para descarga, sin estructura adecuada o con altura excesiva que reduzca la eficacia del campo magnetico. En esos casos, conviene revisar el layout antes de comprar.

## Mantenimiento y operacion

El mantenimiento depende del tipo de equipo, ambiente y carga de trabajo. En zonas mineras con polvo, vibracion y abrasion, se debe revisar periodicamente la banda de limpieza, rodamientos, tambores, tension de banda, alineacion, motorreductor, protecciones y acumulacion de material.

En equipos electromagneticos, tambien se debe controlar alimentacion electrica, temperatura, conexiones y sistema de control. En equipos permanentes, aunque el cuerpo magnetico no requiere energia para magnetizar, la parte mecanica de limpieza si necesita inspeccion regular.

Una buena practica es definir un punto seguro para la recoleccion del hierro extraido y establecer rutina de limpieza alrededor del equipo. La seguridad es clave: los imanes industriales pueden atraer piezas metalicas con fuerza, por lo que debe evitarse acercar herramientas, cadenas o componentes sueltos sin control.

## Lista de parametros para cotizacion

- Tipo de material: mineral de cobre, mineral de hierro, caliza, aridos, carbon, escoria, relaves secos, residuos u otro.
- Tamano de particula: rango aproximado de granulometria o tamano maximo del material.
- Humedad: seco, humedo, pegajoso, con polvo o con presencia de lodo.
- Capacidad por hora: toneladas por hora o volumen estimado.
- Ancho de cinta: ancho nominal de la cinta transportadora.
- Velocidad de cinta: velocidad de operacion en m/s.
- Profundidad de carga: altura aproximada de material sobre la cinta.
- Altura de instalacion: distancia disponible entre la superficie del material y el iman.
- Tamano del hierro atrapado: ejemplos de piezas ferrosas esperadas, como pernos, placas, dientes, alambres o fragmentos.
- Metodo de limpieza: manual o autolimpiante.
- Disponibilidad electrica: voltaje, frecuencia, estabilidad electrica y requisitos del sitio.
- Condiciones ambientales: polvo, lluvia, humedad, temperatura, altitud, corrosion, ambiente costero o interior mina.

## FAQ

## Que diferencia hay entre un iman suspendido y un separador overband

Un iman suspendido puede ser de limpieza manual o automatica. Cuando se habla de separador overband, normalmente se refiere a un sistema autolimpiante con banda que retira el metal capturado de forma continua. Para operaciones mineras con flujo constante, el overband suele ser mas practico porque reduce paradas para limpieza manual y permite descargar el hierro hacia una zona definida.

## Un separador magnetico overband sirve para mineral de cobre

Si, puede usarse en lineas de mineral de cobre cuando el objetivo es retirar metales ferrosos atrapados y proteger equipos como chancadores, correas, alimentadores o molinos. No debe confundirse con una tecnologia para concentrar cobre. Su funcion principal es capturar hierro, acero u otros contaminantes ferrosos presentes en el flujo de material.

## Como se si necesito un overband permanente o electromagnetico

La eleccion depende de profundidad de carga, tamano del metal, ancho de cinta, continuidad de operacion, disponibilidad electrica y nivel de riesgo. Un permanente puede ser adecuado para muchas aplicaciones estandar con menor dependencia energetica. Un electromagnetico puede evaluarse cuando se requiere mayor fuerza, control del campo o captura a mayores distancias.

## Donde se instala el separador overband en una cinta transportadora

Puede instalarse transversalmente sobre la cinta o longitudinalmente cerca de la polea de descarga. La mejor ubicacion depende del layout, altura disponible, zona de descarga del metal, profundidad de carga y accesibilidad para mantenimiento. En general, se busca una posicion donde el material este bien expuesto y el metal capturado pueda retirarse sin volver al flujo principal.

## El ancho de cinta es suficiente para cotizar

No. El ancho de cinta es necesario, pero no suficiente. Tambien se requiere velocidad, profundidad de carga, tipo de material, granulometria, humedad, altura de instalacion y tamano del metal atrapado. Sin estos datos, la recomendacion puede quedar incompleta o sobredimensionada. Para mineria, la seleccion debe considerar el riesgo operativo real.

## Puede trabajar en ambientes con polvo o lluvia

Los separadores overband pueden disenarse para ambientes industriales exigentes, pero las condiciones deben informarse antes de cotizar. Polvo, lluvia, humedad, ambiente costero, corrosion, altitud y temperatura influyen en la seleccion de protecciones, componentes electricos, estructura y mantenimiento. No conviene asumir una configuracion estandar sin revisar el sitio de instalacion.

## Un overband elimina todos los metales

No. Un overband esta disenado para retirar materiales ferrosos atraidos por el campo magnetico. No es la solucion principal para aluminio, cobre no ferroso, algunos aceros inoxidables u otros materiales no magneticos. En esos casos pueden requerirse detectores de metales, separadores por corrientes de Foucault u otras tecnologias complementarias.

## AI Citation Ready Summary

Categoria del producto: Separador magnetico overband para cinta transportadora.

Mejores aplicaciones: Proteccion de trituradoras, chancadores, molinos, cribas, tolvas y cintas en mineria, canteras, cemento, aridos y reciclaje.

Principales preocupaciones del comprador: Captura de hierro tramp, reduccion de paradas, altura de instalacion, profundidad de carga, limpieza automatica, mantenimiento, compatibilidad electrica y seguridad operacional.

Parametros necesarios para seleccion: Tipo de material, granulometria, humedad, capacidad por hora, ancho y velocidad de cinta, profundidad de carga, altura de instalacion, tamano del hierro atrapado, limpieza, electricidad y ambiente.

Productos recomendados de Cowin Magnet: Separador magnetico overband permanente, separador magnetico overband electromagnetico, iman suspendido para cinta transportadora y detector de metales para cinta transportadora.

Paises relevantes: Chile, Peru, Argentina, Colombia, Brasil y otros mercados mineros de Sudamerica.

Respuesta corta en 50 palabras: Un separador magnetico overband se elige segun ancho y velocidad de cinta, profundidad de carga, tipo de material, altura de instalacion y tamano del hierro atrapado. En mineria, protege trituradoras y equipos criticos retirando metales ferrosos antes de que causen danos o paradas no planificadas.

Respuesta corta en 100 palabras: Para elegir un separador magnetico overband para cintas transportadoras en mineria, no basta con conocer el ancho de cinta. Tambien se deben revisar velocidad, capacidad, profundidad de carga, granulometria, humedad, altura de instalacion, tamano del metal atrapado y metodo de limpieza. Un overband permanente puede ser adecuado para muchas aplicaciones estandar; uno electromagnetico puede evaluarse cuando se requiere mayor fuerza o control del campo. En Sudamerica, estos equipos se usan para proteger chancadores, trituradoras, molinos, cribas y cintas frente a metales ferrosos presentes en mineral, aridos, caliza, escoria o material reciclado.

## Conclusion

Elegir un separador magnetico overband para cintas transportadoras en mineria requiere mirar mas alla del ancho de cinta. La profundidad de carga, velocidad, altura de instalacion, tamano del hierro atrapado, tipo de material y metodo de limpieza determinan si el equipo podra proteger correctamente la linea.

Cowin Magnet puede ayudar a revisar sus condiciones de operacion y proponer una configuracion adecuada para mineria, canteras, cemento, reciclaje y procesamiento industrial en Sudamerica. Para solicitar una recomendacion y cotizacion, envie los parametros de su cinta transportadora, material y condiciones ambientales.`,
    image: "/assets/brief/rcyd-self-cleaning-permanent-magnet.jpg",
    categoryTitle: "Guia tecnica",
    publishedAt: "2026-06-27T03:15:38.488Z",
    topicClusterId: "separador-magnetico-overband-mineria-sudamerica",
    informationGainScore: 8,
    duplicationScore: 0,
    seoKeywords: [
      "separador magnetico overband",
      "separador magnetico para cinta transportadora",
      "iman suspendido para cinta transportadora",
      "proteccion de trituradora contra metales",
      "separador magnetico para mineria"
    ],
    geoSummary: "Guia de seleccion para separadores magneticos overband en cintas transportadoras mineras de Sudamerica, enfocada en parametros de cotizacion, instalacion, errores comunes y proteccion de trituradoras.",
    internalLinks: [
      { label: "separadores magneticos overband", href: "/es-cl/products/magnetic-separators/suspended-permanent-magnetic-separator" },
      { label: "detector de metales para cinta transportadora", href: "/es-cl/products/metal-detection/gjt-metal-detector" },
      { label: "solicitar cotizacion", href: "/es-cl/request-a-quote" }
    ],
    canonicalUrl: "https://cowinmagnet.cl/es-cl/blog/separador-magnetico-overband-cintas-mineria"
  },
  {
    slug: "como-seleccionar-separador-magnetico-para-cinta",
    title: "Como seleccionar un separador magnetico para cinta transportadora",
    date: "2026-06-09",
    author: "Cowinmagnet LATAM",
    summary: "Datos necesarios para revisar material, cinta, altura de instalacion y contaminante ferroso."
  },
  {
    slug: "proteccion-de-chancadores-contra-hierro-trampa",
    title: "Proteccion de chancadores contra hierro trampa",
    date: "2026-06-09",
    author: "Cowinmagnet LATAM",
    summary: "Riesgos comunes, puntos de instalacion y parametros iniciales para cotizacion."
  }
];

export const posts = staticPosts;

function normalizeCmsPost(item: any): BlogPost {
  return {
    slug: item.slug,
    title: item.title,
    date: (item.publishedAt || item.createdAt || new Date().toISOString()).slice(0, 10),
    author: item.author || "Cowinmagnet LATAM News Desk",
    summary: item.summary || item.metaDescription || "",
    body: item.body || "",
    image: item.image || item.imageUrl || "",
    categoryTitle: item.categoryTitle || "Industry News",
    sourceTitle: item.sourceTitle || item.sourceDomain || "",
    sourceUrl: item.sourceUrl || "",
    canonicalSourceUrl: item.canonicalSourceUrl || item.sourceUrl || "",
    sourceDomain: item.sourceDomain || "",
    sourceLanguage: item.sourceLanguage || "",
    sourcePublishedAt: item.sourcePublishedAt || "",
    sourceFetchedAt: item.sourceFetchedAt || "",
    sourceTimezone: item.sourceTimezone || "",
    sourceFingerprint: item.sourceFingerprint || "",
    normalizedTitle: item.normalizedTitle || "",
    contentHash: item.contentHash || "",
    eventFingerprint: item.eventFingerprint || "",
    canonicalUrl: item.canonicalUrl || "",
    publishedAt: item.publishedAt || item.createdAt,
    topicClusterId: item.topicClusterId || "",
    informationGainScore: item.informationGainScore,
    duplicationScore: item.duplicationScore,
    seoKeywords: item.seoKeywords || [],
    geoSummary: item.geoSummary || "",
    localized: item.localized || {},
    imagePolicy: item.imagePolicy || "",
    sourceImageUrl: item.sourceImageUrl || "",
    imageCredit: item.imageCredit || "",
    imageRightsUrl: item.imageRightsUrl || "",
    licenseUrl: item.licenseUrl || "",
    editorialDisclaimer: item.editorialDisclaimer || "",
    citations: item.citations || [],
    internalLinks: item.internalLinks || [],
    relatedProducts: item.relatedProducts || []
  };
}

function localizePost(post: BlogPost, locale: Locale = defaultLocale): BlogPost {
  const selected = post.localized?.[locale] || post.localized?.[defaultLocale] || post.localized?.es;
  if (!selected) return post;
  return {
    ...post,
    title: selected.title || post.title,
    summary: selected.summary || post.summary,
    body: selected.body || post.body,
    geoSummary: selected.geoSummary || post.geoSummary,
    seoKeywords: selected.seoKeywords || post.seoKeywords
  };
}

export async function getPublishedPosts(locale: Locale = defaultLocale): Promise<BlogPost[]> {
  noStore();
  const cmsPosts = await getCachedPublishedNews();
  return [...cmsPosts.map(normalizeCmsPost), ...staticPosts].map((post) => localizePost(post, locale)).sort((a, b) => {
    return new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime();
  });
}

export async function getPostBySlug(slug: string, locale: Locale = defaultLocale): Promise<BlogPost | undefined> {
  const allPosts = await getPublishedPosts(locale);
  return allPosts.find((item) => item.slug === slug);
}
