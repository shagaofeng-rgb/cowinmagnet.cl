import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportRoot = path.join(root, "reports", "cl");
const truthRoot = path.join(reportRoot, "product-truth-cards");
fs.mkdirSync(truthRoot, { recursive: true });

const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
const writeCsv = (name, rows) => fs.writeFileSync(path.join(reportRoot, name), csv(rows), "utf8");
const productsSource = fs.readFileSync(path.join(root, "data", "products.ts"), "utf8");
const productsJson = productsSource.match(/export const products: Product\[\] = (\[[\s\S]*\]);\s*$/)?.[1];
if (!productsJson) throw new Error("Could not parse data/products.ts");
const products = JSON.parse(productsJson);

const categorySlug = (value) => value.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const supplierPattern = /cnmagnetics\.com|chnmag\.com/i;
const internalPattern = /SEO Meta|Primary Keyword|Search Intent|AI \/ GEO|AI Citation Ready|CMS checklist/i;
const reviewed = new Set([
  "rcyd-type-permanent-magnet-self-dumping-iron-remover", "rcyb-type-permanent-magnet-manual-iron-remover",
  "rcdb-type-self-cooling-plate-electromagnetic-iron-remover", "rcdd-type-self-cooling-self-dumping-electromagnetic-iron-remover",
  "wet-drum-magnetic-separator", "dry-drum-magnetic-separator", "belt-high-gradient-magnetic-separator",
  "disc-magnetic-separator-for-tailing"
]);

writeCsv("product-inventory-before.csv", [["slug", "name", "category", "public_url", "image_count", "spec_count", "truth_review_status"], ...products.map((product) => [
  product.slug, product.name, product.category,
  `https://cowinmagnet.cl/es-cl/products/${categorySlug(product.category)}/${product.slug}`,
  product.imageGallery?.length || (product.image ? 1 : 0), product.specs?.length || 0,
  reviewed.has(product.slug) ? "reviewed" : "engineering_review_required"
])]);

const missing = [];
const leaks = [];
for (const product of products) {
  const evidence = [...(product.sourceUrls || []), product.sourceSite || ""].filter(Boolean);
  const missingFields = [];
  if (!product.specs?.length) missingFields.push("verified_specifications");
  if (!product.installation) missingFields.push("installation");
  if (!product.faqs?.length) missingFields.push("faq");
  if (!reviewed.has(product.slug)) missingFields.push("product_truth_review");
  if (missingFields.length) missing.push([product.slug, missingFields.join("|"), "Disponible bajo solicitud", "P1"]);
  const serialized = JSON.stringify(product);
  if (supplierPattern.test(serialized)) leaks.push([product.slug, "source-data", evidence.join("|"), "blocked from public rendering; source requires evidence migration"]);

  const card = {
    slug: product.slug,
    source_name: product.name,
    model_or_series: product.name.match(/\b[A-Z][A-Z0-9-]{1,12}\b/)?.[0] || "Por confirmar por ingenieria de COWIN",
    equipment_category: product.category,
    verified_identity: reviewed.has(product.slug),
    verified_parameters: reviewed.has(product.slug) ? "See runtime ProductTruthCard" : [],
    pending_parameters: missingFields,
    allowed_claims: ["Soporte para proyectos en Chile y Latinoamerica", "Seleccion y configuracion sujetas a validacion tecnica"],
    prohibited_claims: ["stock local", "oficina local", "fabrica propia", "rendimiento no ensayado", "certificacion no verificada"],
    evidence_status: evidence.length ? "legacy upstream reference; not approved for public attribution" : "COWIN engineering evidence required",
    reviewed_at: reviewed.has(product.slug) ? "2026-08-08" : null
  };
  fs.writeFileSync(path.join(truthRoot, `${product.slug}.json`), JSON.stringify(card, null, 2) + "\n", "utf8");
}
writeCsv("missing-product-data.csv", [["slug", "missing_fields", "public_fallback", "priority"], ...missing]);
writeCsv("content-visibility-and-supplier-leak-audit.csv", [["slug_or_file", "surface", "finding", "disposition"], ...leaks,
  ["app/[locale]/products/[category]/[productSlug]/page.tsx", "public-json-ld", "isRelatedTo removed", "fixed"],
  ["app/[locale]/news/[slug]/page.tsx", "public-html", "internal SEO/GEO labels suppressed", "fixed"]
]);

const locales = ["es-cl", "es", "pt-br", "en"];
writeCsv("url-canonical-hreflang-audit.csv", [["route_pattern", "canonical", "hreflang_set", "status"],
  ["/[locale]/products/[category]/[slug]", "self", locales.join("|"), "implemented"],
  ["/[locale]/industries/[slug]", "self", locales.join("|"), "implemented"],
  ["/[locale]/solutions/[slug]", "self", locales.join("|"), "implemented"],
  ["/[locale]/news/[slug]", "self", locales.join("|"), "implemented"]
]);
writeCsv("redirect-map.csv", [["old_url", "new_url", "status", "reason"], ["", "", "no change", "Existing public URLs retained"]]);
writeCsv("internal-link-map.csv", [["source_type", "target_type", "implementation"],
  ["product", "industry", "product detail related-industries section"], ["product", "solution", "product detail related-solutions section"],
  ["news", "product", "relatedProducts links"], ["sitemap", "all canonical content", "typed sitemap index"]
]);
writeCsv("seo-audit-before.csv", [["priority", "surface", "finding", "status"],
  ["P0", "product pages", "English identity and generic mixed parameters", "fixed in rendering; 80 truth reviews remain"],
  ["P0", "Product JSON-LD", "supplier isRelatedTo and placeholder properties", "fixed"],
  ["P0", "news detail", "internal SEO/GEO fields visible", "fixed"],
  ["P1", "product source records", "legacy supplier references and scraped fragments", "quarantined from public rendering; migration pending"],
  ["P1", "Search Console", "live indexing data requires authenticated production access", "pending verification"]
]);

const blogSource = fs.readFileSync(path.join(root, "data", "blog.ts"), "utf8");
const newsRows = [...blogSource.matchAll(/slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"/g)].map((match) => {
  const start = match.index || 0;
  const sample = blogSource.slice(start, start + 12000);
  return [match[1], match[2], match[3], internalPattern.test(sample) ? "internal_fields_present_in_source" : "clean", "manual review"];
});
writeCsv("news-library-audit.csv", [["slug", "title", "date", "content_flag", "action"], ...newsRows]);

writeCsv("seo-audit-after.csv", [["priority", "surface", "verification", "result"],
  ["P0", "Product JSON-LD", "source inspection", "supplier isRelatedTo removed; only verified properties emitted"],
  ["P0", "Spanish product identity", "runtime presentation", "8 reviewed truth cards; remaining products use safe engineering-review copy"],
  ["P0", "News public fields", "source inspection", "internal SEO/GEO labels suppressed"],
  ["P1", "Canonical/hreflang", "shared metadata helpers", "self-canonical plus es-CL/es/pt-BR/en/x-default"],
  ["P1", "Search Console indexing", "authenticated observation required", "pending verification"]
]);
fs.writeFileSync(path.join(reportRoot, "schema-validation.json"), JSON.stringify({
  generatedAt: new Date().toISOString(), product: { status: "implemented", prohibitedFields: ["offers", "aggregateRating", "review", "isRelatedTo"], verifiedAdditionalPropertiesOnly: true },
  breadcrumbList: { productPages: "implemented", newsPages: "existing" }, article: { status: "implemented", sourceEvidenceRequiredByNewGate: true }, externalRichResultsTest: "pending production URL validation"
}, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(reportRoot, "sitemap-validation.log"), `${new Date().toISOString()} source audit: typed sitemap index present; production HTTP and XML validation pending post-deployment\n`, "utf8");
writeCsv("indexing-observation.csv", [["url", "observed_at", "source", "state", "evidence"], ["https://cowinmagnet.cl/sitemap.xml", new Date().toISOString(), "local-audit", "unknown", "Search Console authenticated verification pending"]]);
fs.writeFileSync(path.join(reportRoot, "weekly-content-and-indexing-report.md"), `# Weekly content and indexing report\n\nGenerated: ${new Date().toISOString()}\n\n- Product inventory: ${products.length}\n- Reviewed high-value truth cards: ${reviewed.size}\n- Products requiring engineering evidence review: ${missing.length}\n- Legacy source records quarantined from public rendering: ${leaks.length}\n- News automation: source-led and quality-gated; one Spanish original article at most every 48 hours, enabled only after six candidates have passed editorial review\n- Search Console indexing state: pending authenticated verification; submission is not reported as indexing\n`, "utf8");

console.log(JSON.stringify({ products: products.length, reviewedTruthCards: reviewed.size, missingRows: missing.length, supplierSourceRows: leaks.length, newsRows: newsRows.length, reportRoot }, null, 2));
