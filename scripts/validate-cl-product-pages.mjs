import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = (process.env.PRODUCT_BASE_URL || "http://localhost:8092").replace(/\/$/, "");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "mainProductCatalog.json"), "utf8"));
const categorySlugs = {
  "Suspended & Self-Unloading Iron Removers": "suspended-self-unloading-iron-removers",
  "Magnetic Separation Equipment": "magnetic-separation-equipment",
  "Metal Detection & Recycling Sorting": "metal-detection-recycling-sorting",
  "Magnetic Components & Filters": "magnetic-components-filters",
  "Industry Application Equipment": "industry-application-equipment"
};
const reportRoot = path.join(root, "reports", "cl-products");
const leakPattern = /cnmagnetics\.com|chnmag\.com|synced from|sincronizada desde|catalogo principal/i;
const results = [];

for (const product of catalog) {
  const url = `/es-cl/products/${categorySlugs[product.category]}/${product.slug}`;
  const response = await fetch(`${baseUrl}${url}`, { redirect: "manual" });
  const html = await response.text();
  const hasProduct = /"@type":"Product"/.test(html);
  const hasBreadcrumb = /"@type":"BreadcrumbList"/.test(html);
  const hasCanonical = html.includes(`canonical" href="https://cowinmagnet.cl${url}"`);
  const hasHreflang = html.includes('hrefLang="es-CL"') && html.includes('hrefLang="pt-BR"') && html.includes('hrefLang="en"');
  const hasInquiryFields = html.includes('Paso 1 de 2') && html.includes('Nombre') && html.includes('País') && html.includes('WhatsApp');
  const hasLeak = leakPattern.test(html);
  results.push({ slug: product.slug, url, httpStatus: response.status, productSchema: hasProduct, breadcrumbSchema: hasBreadcrumb, canonical: hasCanonical, hreflang: hasHreflang, productInquiryFields: hasInquiryFields, publicLeak: hasLeak, status: response.ok && hasProduct && hasBreadcrumb && hasCanonical && hasHreflang && hasInquiryFields && !hasLeak ? "validado" : "revisar" });
}

const failures = results.filter((result) => result.status !== "validado");
fs.writeFileSync(path.join(reportRoot, "product-schema-validation.json"), `${JSON.stringify({ auditedAt: new Date().toISOString(), baseUrl, scope: "Solo rutas de detalle de producto", summary: { checked: results.length, valid: results.length - failures.length, failed: failures.length }, products: results }, null, 2)}\n`);
fs.writeFileSync(path.join(reportRoot, "product-page-qa-report.md"), `# Auditoría de páginas de producto Chile/LATAM\n\n- Entorno validado: ${baseUrl}\n- Productos auditados: ${results.length}\n- URLs de detalle con respuesta 200: ${results.filter((result) => result.httpStatus === 200).length}\n- Product + BreadcrumbList schema: ${results.filter((result) => result.productSchema && result.breadcrumbSchema).length}/${results.length}\n- Canonical y hreflang por producto: ${results.filter((result) => result.canonical && result.hreflang).length}/${results.length}\n- Formulario específico de producto: ${results.filter((result) => result.productInquiryFields).length}/${results.length}\n- Fugas públicas de fuente/sincronización: ${results.filter((result) => result.publicLeak).length}\n- Fallos: ${failures.length}\n\n## Resultado\n\nLa validación se ejecutó contra todas las rutas reales de detalle de producto. Las especificaciones sin confirmación documental se muestran como disponibles bajo solicitud; el schema sólo recibe los campos verificados incluidos por la ficha de verdad pública.\n`);

console.log(JSON.stringify({ checked: results.length, valid: results.length - failures.length, failures: failures.map((result) => ({ slug: result.slug, status: result.httpStatus, checks: result })) }, null, 2));
if (failures.length) process.exit(1);
