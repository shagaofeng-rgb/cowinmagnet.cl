import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "mainProductCatalog.json"), "utf8"));
const reportRoot = path.join(root, "reports", "cl-products");
const truthRoot = path.join(reportRoot, "product-truth-cards");

const categorySlugs = {
  "Suspended & Self-Unloading Iron Removers": "suspended-self-unloading-iron-removers",
  "Magnetic Separation Equipment": "magnetic-separation-equipment",
  "Metal Detection & Recycling Sorting": "metal-detection-recycling-sorting",
  "Magnetic Components & Filters": "magnetic-components-filters",
  "Industry Application Equipment": "industry-application-equipment"
};

const csv = (rows) => rows.map((row) => row.map((value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}).join(",")).join("\n") + "\n";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function compactName(product) {
  const meta = classify(product);
  const model = modelFrom(product);
  const names = {
    iman_permanente: meta.limpieza === "autolimpiante" ? "Separador magnético permanente autolimpiante" : "Separador magnético permanente suspendido",
    electromagnetico: meta.limpieza === "autolimpiante" ? "Separador electromagnético autolimpiante" : "Separador electromagnético suspendido",
    separacion_humeda: "Separador magnético para proceso húmedo",
    separacion_seca: "Separador magnético para proceso seco",
    deteccion_metal: "Detector de metales para proceso industrial",
    corrientes_foucault: "Separador por corrientes de Foucault",
    filtro_magnetico: "Filtro y componente magnético para proceso",
    auxiliar: "Equipo auxiliar para integración de proceso"
  };
  return `${model ? `${model}: ` : ""}${names[meta.tipo]}`;
}

function modelFrom(product) {
  const match = product.name.match(/\b(?:RCYDII|RCYD|RCYE|RCYP|RCYB|RCDB|RCDA|RCDE|RCDC|RCDD|RCDFJ?|RCPS|CTB|CTN|CTS|CTDG|CGT|CTZ|RCT|HJLH|HJPC|GTC|CLT|NCT|WBC|LJK|HMDN|CBZ|CGB|CQZ|CXJ|DCZ|DCX|RCYA|RCYF|RCYG|RCYZ|CLC|CYG|DLS|GJT|GLS|KGLA|KXB|QJZ|RBCDB|RBCDD|RBCYD)\b/i);
  return match ? match[0].toUpperCase() : null;
}

function classify(product) {
  const text = `${product.slug} ${product.name}`.toLowerCase();
  if (/(wet-drum|ctb|ctn|cts|wet-roller|coal-washing|hmdn)/.test(text)) return { tipo: "separacion_humeda", limpieza: "no_aplica", fields: ["Mineralogía", "Granulometría", "Caudal", "Porcentaje de sólidos", "Objetivo de separación"], applications: ["Procesamiento de minerales", "Evaluación de relaves", "Circuitos de pulpa"], selection: ["Muestra o análisis mineralógico", "Granulometría y humedad", "Caudal y porcentaje de sólidos", "Objetivo metalúrgico"] };
  if (/(dry-drum|ctdg|cgt|ctz|rct|high-gradient|disc-magnetic|tailings|hjlh|hjpc|gtc|clt|nct|ljk)/.test(text)) return { tipo: "separacion_seca", limpieza: "no_aplica", fields: ["Mineral", "Granulometría", "Humedad", "Capacidad", "Objetivo de separación"], applications: ["Minerales secos", "Áridos", "Recuperación de fracciones ferrosas"], selection: ["Mineralogía", "Granulometría y humedad", "Caudal", "Prueba de separabilidad"] };
  if (/(eddy-current|stainless-steel-separation)/.test(text)) return { tipo: "corrientes_foucault", limpieza: "no_aplica", fields: ["Tamaño de alimentación", "Capacidad", "Configuración de rotor", "Divisor de producto"], applications: ["Reciclaje de metales", "Clasificación de materiales", "Recuperación de no ferrosos"], selection: ["Composición de alimentación", "Tamaño de partícula", "Capacidad", "Objetivo de recuperación"] };
  if (/(metal-detector|dls|gjt|gls)/.test(text)) return { tipo: "deteccion_metal", limpieza: "no_aplica", fields: ["Ventana de detección", "Producto de prueba", "Velocidad", "Alarma e interbloqueo"], applications: ["Protección de proceso", "Correas transportadoras", "Control de contaminación metálica"], selection: ["Tamaño de producto", "Ancho de cinta", "Velocidad", "Sensibilidad requerida"] };
  if (/(drawer|hump|grid|rod|trap|pipe|filter|rcyz|clc|cyg|cbz|cgb|cqz|cxj|dcz|dcx|rcya|rcyf|rcyg)/.test(text)) return { tipo: "filtro_magnetico", limpieza: "manual", fields: ["Abertura o diámetro", "Barras o elementos magnéticos", "Caudal", "Material de construcción"], applications: ["Protección de proceso", "Polvos y graneles", "Líneas de producto"], selection: ["Producto y contaminación objetivo", "Caudal o flujo", "Diámetro o abertura", "Temperatura y presión si aplica"] };
  if (/(control-box|screen|lifting-magnet)/.test(text)) return { tipo: "auxiliar", limpieza: "no_aplica", fields: ["Configuración eléctrica o mecánica", "Condiciones ambientales", "Compatibilidad de proceso"], applications: ["Equipos auxiliares de proceso", "Integración de planta"], selection: ["Modelo asociado", "Alimentación eléctrica", "Ambiente", "Layout de instalación"] };
  const electromagnetic = /(electromagnetic|rcdb|rcda|rcde|rcdc|rcdd|rcdf|rbcdb|rbcdd)/.test(text);
  const automatic = /(self-dumping|self-cleaning|autolimpiante|overband|rcyd|rcye|rcdd|rcdf|rbcdd|rbcyd|rcps)/.test(text);
  return {
    tipo: electromagnetic ? "electromagnetico" : "iman_permanente",
    limpieza: automatic ? "autolimpiante" : "manual",
    fields: electromagnetic ? ["Alimentación eléctrica", "Altura de suspensión", "Ancho y velocidad de cinta", "Ambiente", "Configuración de descarga"] : ["Ancho y velocidad de cinta", "Altura de suspensión", "Capa de material", "Ambiente", "Configuración de descarga"],
    applications: ["Protección de chancadores", "Correas transportadoras", "Manejo de graneles y áridos"],
    selection: ["Material y contaminación ferrosa", "Ancho y velocidad de cinta", "Capa de material", "Altura de suspensión", "Espacio de instalación y ambiente"]
  };
}

function localMedia(product) {
  const directory = path.join(root, "public", "assets", "products", product.slug);
  if (fs.existsSync(directory)) {
    return fs.readdirSync(directory)
      .filter((file) => /\.(avif|jpe?g|png|webp)$/i.test(file))
      .sort()
      .map((file) => `/assets/products/${product.slug}/${file}`);
  }
  return product.image ? [product.image] : [];
}

function publicLeaks(text) {
  const patterns = ["cnmagnetics.com", "chnmag.com", "products_details.css", "synced from", "sincronizada desde", "catalogo principal", "catalogue principal"];
  return patterns.filter((pattern) => text.toLowerCase().includes(pattern));
}

ensureDir(truthRoot);

const detailPage = fs.readFileSync(path.join(root, "app", "[locale]", "products", "[category]", "[productSlug]", "page.tsx"), "utf8");
const presentation = fs.readFileSync(path.join(root, "data", "productPresentation.ts"), "utf8");
const publicSource = `${detailPage}\n${presentation}\n${JSON.stringify(catalog)}`;
const globalLeaks = publicLeaks(publicSource);
const inventory = [["Nombre público en español", "Serie", "Modelo", "URL actual", "Categoría", "Tipo magnético", "Modo de limpieza", "Estado de suministro", "Especificaciones confirmadas", "Campos pendientes", "Aplicaciones", "Imágenes", "Estado de autorización", "Estado de contenido"]];
const languageAudit = [["slug", "url", "titulo_es", "estado_idioma", "hallazgo", "prioridad"]];
const missingData = [["slug", "campo", "motivo", "tratamiento_publico"]];
const leakAudit = [["slug", "url", "estado", "hallazgos", "accion"]];
const redirects = [["url_actual", "url_destino", "tipo", "estado"]];
const schemaResults = [];

for (const product of catalog) {
  const meta = classify(product);
  const model = modelFrom(product);
  const title = compactName(product);
  const url = `/es-cl/products/${categorySlugs[product.category]}/${product.slug}`;
  const media = localMedia(product);
  const truthCard = {
    nombrePublico: title,
    serie: model || "Por confirmar",
    modelo: model,
    categoria: product.category,
    tipo: meta.tipo,
    limpieza: meta.limpieza,
    especificacionesConfirmadas: {},
    especificacionesPendientes: meta.fields,
    referenciaInterna: {
      catalogo: "Catálogo principal COWIN sincronizado",
      rutaPrincipal: `/en/products/${product.slug}`,
      versionAuditoria: new Date().toISOString().slice(0, 10),
      estadoValidacion: "Pendiente de confirmación del proveedor"
    },
    aplicaciones: meta.applications,
    datosParaSeleccion: meta.selection,
    afirmacionesPermitidas: ["Selección técnica conforme a las condiciones reales del proceso", "Soporte para proyectos en Chile y Latinoamérica", "Especificaciones disponibles bajo solicitud"],
    afirmacionesProhibidas: ["Stock local", "Oficina o equipo local no confirmado", "Rendimiento, intensidad, recuperación o certificación no confirmados"],
    mediaAprobada: media,
    confirmadoPorProveedor: false
  };
  writeJson(path.join(truthRoot, `${product.slug}.json`), truthCard);
  inventory.push([title, model || "Por confirmar", model || "", url, product.category, meta.tipo, meta.limpieza, "Por confirmar con proveedor", "Ninguna cifra pública validada en esta auditoría", meta.fields.join(" | "), meta.applications.join(" | "), media.length, "Pendiente de confirmación documental", "Requiere contenido detallado y ficha de verdad privada"]);
  languageAudit.push([product.slug, url, title, /\b(type|the|for|with|and)\b/i.test(title) ? "requiere_reescritura" : "requiere_revision", "El catálogo base conserva nombre de origen; la página debe mostrar título y contenido propio en español", "alta"]);
  for (const field of meta.fields) missingData.push([product.slug, field, "No hay valor confirmado en el catálogo público sincronizado", "Disponible bajo solicitud / Por confirmar por ingeniería de COWIN"]);
  leakAudit.push([product.slug, url, globalLeaks.length ? "revisar" : "sin_fuga_detectada", globalLeaks.join(" | ") || "", globalLeaks.length ? "Eliminar la huella antes de publicar" : "Mantener comprobación de regresión"]);
  redirects.push([url, url, "sin_cambio", "URL vigente conservada"]);
  schemaResults.push({ slug: product.slug, url, requiredTypes: ["Product", "BreadcrumbList"], publicSpecificationPolicy: "solo especificaciones confirmadas", status: "pendiente de validación posterior a la implementación" });
}

fs.writeFileSync(path.join(reportRoot, "product-inventory.csv"), csv(inventory));
fs.writeFileSync(path.join(reportRoot, "product-content-language-audit.csv"), csv(languageAudit));
fs.writeFileSync(path.join(reportRoot, "missing-product-data.csv"), csv(missingData));
fs.writeFileSync(path.join(reportRoot, "product-page-leak-audit.csv"), csv(leakAudit));
fs.writeFileSync(path.join(reportRoot, "product-url-redirect-map.csv"), csv(redirects));
writeJson(path.join(reportRoot, "product-schema-validation.json"), { auditedAt: new Date().toISOString(), scope: "Solo rutas de detalle de producto", products: schemaResults });
fs.writeFileSync(path.join(reportRoot, "product-page-qa-report.md"), `# Auditoría de páginas de producto Chile/LATAM\n\n- Productos auditados: ${catalog.length}\n- URLs de detalle conservadas: ${catalog.length}\n- Productos con galería local detectada: ${catalog.filter((product) => localMedia(product).length > 1).length}\n- Huellas públicas globales detectadas: ${globalLeaks.length ? globalLeaks.join(", ") : "ninguna"}\n- Datos técnicos numéricos publicados por esta auditoría: ninguno\n\n## Resultado\n\nLa auditoría conserva cada URL existente y no escribe en base de datos. Todas las fichas privadas marcan como pendientes los datos sin confirmación documental. La siguiente implementación debe traducir el contenido público, ampliar la galería local existente, restringir el schema a valores confirmados y mantener las especificaciones faltantes como información bajo solicitud.\n`);

console.log(JSON.stringify({ products: catalog.length, galleriesWithMultipleMedia: catalog.filter((product) => localMedia(product).length > 1).length, globalLeaks }, null, 2));
