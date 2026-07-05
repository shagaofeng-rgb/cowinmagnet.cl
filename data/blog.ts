import { getCmsItems } from "@/lib/cmsStore";
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
  citations?: { title: string; url: string; domain: string }[];
  internalLinks?: { label: string; href: string }[];
  relatedProducts?: { slug: string; category: string; title: string; image?: string; href?: string; relevanceScore?: number; relationshipReason?: string }[];
};

export const staticPosts: BlogPost[] = [
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
    image: "/assets/generated/latam-mining-overband.png",
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
  const cmsPosts = await getCmsItems("news");
  return [...cmsPosts.map(normalizeCmsPost), ...staticPosts].map((post) => localizePost(post, locale)).sort((a, b) => {
    return new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime();
  });
}

export async function getPostBySlug(slug: string, locale: Locale = defaultLocale): Promise<BlogPost | undefined> {
  const allPosts = await getPublishedPosts(locale);
  return allPosts.find((item) => item.slug === slug);
}
