import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 8091);
const locales = ["es-cl", "es", "pt-br", "en"];
const defaultLocale = "es-cl";
const dbDir = join(root, "data", "local-db");
const enquiriesFile = join(dbDir, "enquiries.json");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadCatalog() {
  const source = await readFile(join(root, "data", "catalog.ts"), "utf8");
  const imageSource = source.match(/export const categoryImages = \{([\s\S]*?)\} as const;/)?.[1] || "";
  const categoryImages = Object.fromEntries([...imageSource.matchAll(/(\w+): "([^"]+)"/g)].map((match) => [match[1], match[2]]));

  const categorySource = source.match(/export const productCategories = \[([\s\S]*?)\] as const;/)?.[1] || "";
  const categories = [...categorySource.matchAll(/\{\s*slug: "([^"]+)",\s*key: "([^"]+)",\s*title: "([^"]+)",\s*summary: "([^"]+)"\s*\}/g)].map((match) => ({
    slug: match[1],
    key: match[2],
    title: match[3],
    summary: match[4],
    image: categoryImages[match[2]]
  }));

  const groupSource = source.match(/const mainSiteProductGroups = \[([\s\S]*?)\] as const;/)?.[1] || "";
  const products = [];
  for (const group of groupSource.matchAll(/\{\s*category: "([^"]+)",\s*imageKey: "([^"]+)",\s*products: \[([\s\S]*?)\]\s*\}/g)) {
    const category = group[1];
    const imageKey = group[2];
    for (const product of group[3].matchAll(/"([^"]+)"/g)) {
      const categoryItem = categories.find((item) => item.slug === category);
      products.push({
        id: `${category}-${slugify(product[1])}`,
        sku: product[1].split(" ").slice(0, 3).join("-").toUpperCase().replace(/[^A-Z0-9-]/g, ""),
        slug: slugify(product[1]),
        category,
        title: product[1],
        spanishName: product[1],
        portugueseName: product[1],
        englishName: product[1],
        shortDescription: categoryItem?.summary || "Cowinmagnet main-site product.",
        fullDescription: "Producto sincronizado desde el catalogo publico principal de Cowinmagnet. La seleccion tecnica final requiere material, capacidad, dimensiones de transporte, altura de instalacion, energia y condiciones ambientales.",
        image: categoryImages[imageKey],
        gallery: [categoryImages[imageKey]],
        features: ["Catalogo principal Cowinmagnet", "Datos tecnicos verificables antes de cotizar", "Apto para seleccion por proyecto"],
        applications: ["Mineria", "Cintas transportadoras", "Agregados", "Reciclaje", "Lineas industriales"],
        workingPrinciple: "La configuracion se define por el tipo de material, contaminante ferroso, flujo de proceso y condiciones de instalacion.",
        technicalSpecifications: [
          ["Material", "Confirmar por proyecto", ""],
          ["Capacity", "Confirmar por proyecto", ""],
          ["Belt width or pipe size", "Confirmar por proyecto", ""],
          ["Installation height or flow condition", "Confirmar por proyecto", ""],
          ["Voltage and frequency", "Confirmar por proyecto", ""],
          ["Operating environment", "Confirmar por proyecto", ""]
        ],
        installationOptions: ["Cross-belt", "Inline", "Pipeline", "Process integration"],
        optionalConfigurations: ["Manual cleaning", "Self-cleaning", "Control cabinet", "Custom dimensions"],
        operatingConditions: ["Altitude", "Dust", "Outdoor exposure", "Temperature", "Humidity"],
        maintenanceInformation: "Definir mantenimiento segun configuracion, acceso de limpieza y ambiente operativo.",
        spareParts: ["Belt", "Rollers", "Bearings", "Control components", "Magnetic elements where applicable"],
        packagingInformation: "Export packaging to be confirmed before shipment.",
        shippingInformation: "Route, port, destination and Incoterms to be confirmed.",
        downloads: [],
        relatedProducts: [],
        relatedIndustries: ["mineria-de-cobre", "reciclaje", "sistemas-de-transporte"],
        relatedSolutions: ["eliminacion-de-hierro-trampa", "proteccion-de-cintas"],
        seoTitle: `${product[1]} | Cowinmagnet LATAM`,
        seoDescription: `Product page for ${product[1]} in Cowinmagnet Chile and South America catalog.`,
        seoKeywords: ["magnetic separator", "iron remover", "Cowinmagnet", "South America"],
        canonicalUrl: `/es-cl/products/${category}/${slugify(product[1])}`,
        openGraphImage: categoryImages[imageKey],
        status: "published",
        sortOrder: products.length + 1,
        featured: products.length < 9,
        createdAt: "2026-06-09",
        updatedAt: "2026-06-09"
      });
    }
  }

  return { categories, products };
}

async function ensureDb() {
  await mkdir(dbDir, { recursive: true });
  if (!existsSync(enquiriesFile)) {
    await writeFile(enquiriesFile, "[]\n", "utf8");
  }
}

async function readEnquiries() {
  await ensureDb();
  return JSON.parse(await readFile(enquiriesFile, "utf8"));
}

async function saveEnquiry(payload) {
  const enquiries = await readEnquiries();
  const item = {
    id: `INQ-${Date.now()}`,
    status: "New",
    createdAt: new Date().toISOString(),
    ...payload
  };
  enquiries.unshift(item);
  await writeFile(enquiriesFile, `${JSON.stringify(enquiries, null, 2)}\n`, "utf8");
  return item;
}

function layout({ locale, title, description, body }) {
  const prefix = `/${locale}`;
  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="noindex,nofollow" />
  <link rel="stylesheet" href="/styles.css" />
  <style>
    .preview-toolbar{position:fixed;right:18px;bottom:18px;z-index:20;display:flex;gap:8px;flex-wrap:wrap}
    .preview-toolbar a{background:#0c5b4d;color:#fff;padding:10px 12px;border-radius:6px;text-decoration:none;font-size:13px}
    .admin-table{width:100%;border-collapse:collapse;background:#fff}
    .admin-table th,.admin-table td{border-bottom:1px solid #e3e7e5;padding:10px;text-align:left;vertical-align:top}
    .filter-bar{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
    .filter-bar input,.filter-bar select{padding:11px;border:1px solid #cbd5d1;border-radius:6px;min-width:220px}
    .product-layout{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:32px;align-items:start}
    .product-media img{width:100%;height:auto;object-fit:contain;background:#fff;border:1px solid #e5ece8;border-radius:8px}
    .notice-list{display:grid;gap:10px}
    @media (max-width: 760px){.product-layout{grid-template-columns:1fr}.preview-toolbar{left:12px;right:12px}.preview-toolbar a{flex:1;text-align:center}}
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="${prefix}"><img src="/assets/logo.jpg" alt="Cowinmagnet" width="42" height="42"><span>LATAM</span></a>
    <nav class="site-nav open" aria-label="Preview navigation">
      <a href="${prefix}">Inicio</a>
      <a href="${prefix}/products">Productos</a>
      <a href="${prefix}/search">Buscar</a>
      <a href="${prefix}/request-a-quote">Cotizacion</a>
      <a href="/admin">Admin</a>
    </nav>
  </header>
  <main class="route-main">${body}</main>
  <footer class="footer">
    <div><strong>Cowinmagnet LATAM local preview</strong><p>Preview local noindex. Los parametros tecnicos se confirman antes de produccion.</p></div>
    <div><a href="${prefix}/products">Productos</a><a href="${prefix}/request-a-quote">Solicitar cotizacion</a><a href="/admin/enquiries">Enquiries</a></div>
  </footer>
  <div class="preview-toolbar"><a href="${prefix}/request-a-quote">Quote</a><a href="https://wa.me/8615665135205">WhatsApp</a><a href="/admin">Admin</a></div>
</body>
</html>`;
}

function card(item, href) {
  return `<article class="content-card">
    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
    <div class="content-card-body">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary || item.shortDescription)}</p>
      <a class="button primary" href="${href}">Ver detalle</a>
    </div>
  </article>`;
}

function homePage(locale, catalog) {
  return layout({
    locale,
    title: "Cowinmagnet Chile & South America Local Preview",
    description: "Local preview for Cowinmagnet Chile and South America website.",
    body: `
      <section class="hero-banner">
        <div><p class="eyebrow">Cowinmagnet LATAM</p><h1>Equipos de separacion magnetica para Chile y Sudamerica</h1><p>Preview local conectado al catalogo sincronizado desde el sitio principal.</p><a class="button primary" href="/${locale}/products">Ver productos</a></div>
      </section>
      <section class="band"><div class="section-heading"><p class="eyebrow">Products</p><h2>Catalogo principal sincronizado</h2><p>${catalog.products.length} productos en ${catalog.categories.length} categorias.</p></div><div class="page-grid">${catalog.categories.map((category) => card(category, `/${locale}/products/${category.slug}`)).join("")}</div></section>
      <section class="band muted"><div class="geo-grid"><article><h3>Frontend</h3><p>Rutas reales, detalle de producto, busqueda y cotizacion.</p></article><article><h3>Data</h3><p>Productos leidos desde <code>data/catalog.ts</code>.</p></article><article><h3>Admin</h3><p>Dashboard local para productos e inquiries guardados.</p></article></div></section>`
  });
}

function productsPage(locale, catalog, url) {
  const q = (url.searchParams.get("q") || "").toLowerCase();
  const category = url.searchParams.get("category") || "";
  const products = catalog.products.filter((item) => (!q || item.title.toLowerCase().includes(q)) && (!category || item.category === category));
  return layout({
    locale,
    title: "Productos | Cowinmagnet LATAM",
    description: "Product catalog synchronized from Cowinmagnet main website.",
    body: `
      <section class="band"><div class="section-heading"><p class="eyebrow">Products</p><h1>Centro de productos</h1><p>${products.length} resultados de ${catalog.products.length} productos sincronizados.</p></div>
      <form class="filter-bar" method="get"><input name="q" value="${escapeHtml(url.searchParams.get("q") || "")}" placeholder="Buscar producto"><select name="category"><option value="">Todas las categorias</option>${catalog.categories.map((item) => `<option value="${item.slug}" ${item.slug === category ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select><button class="button primary" type="submit">Filtrar</button><a class="button ghost" href="/${locale}/products">Limpiar</a></form>
      <div class="page-grid">${products.map((product) => card(product, `/${locale}/products/${product.category}/${product.slug}`)).join("") || "<p>No results.</p>"}</div></section>`
  });
}

function categoryPage(locale, catalog, categorySlug) {
  const category = catalog.categories.find((item) => item.slug === categorySlug);
  if (!category) return null;
  const products = catalog.products.filter((item) => item.category === categorySlug);
  return layout({
    locale,
    title: `${category.title} | Cowinmagnet LATAM`,
    description: category.summary,
    body: `<section class="band"><div class="section-heading"><p class="eyebrow">Product Category</p><h1>${escapeHtml(category.title)}</h1><p>${escapeHtml(category.summary)}</p></div><div class="page-grid">${products.map((product) => card(product, `/${locale}/products/${product.category}/${product.slug}`)).join("")}</div></section>`
  });
}

function productPage(locale, catalog, categorySlug, productSlug) {
  const product = catalog.products.find((item) => item.category === categorySlug && item.slug === productSlug);
  if (!product) return null;
  const specs = product.technicalSpecifications.map(([name, value, unit]) => `<tr><th>${escapeHtml(name)}</th><td>${escapeHtml(value)}</td><td>${escapeHtml(unit)}</td></tr>`).join("");
  return layout({
    locale,
    title: product.seoTitle,
    description: product.seoDescription,
    body: `
      <section class="band">
        <div class="product-layout">
          <div class="product-media"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}"></div>
          <div><p class="eyebrow">Product Detail</p><h1>${escapeHtml(product.title)}</h1><p>${escapeHtml(product.fullDescription)}</p><a class="button primary" href="/${locale}/request-a-quote?product=${encodeURIComponent(product.title)}">Solicitar cotizacion</a></div>
        </div>
      </section>
      <section class="band muted"><div class="geo-grid"><article><h3>Features</h3><ul>${product.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article><article><h3>Applications</h3><ul>${product.applications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article><article><h3>Working Principle</h3><p>${escapeHtml(product.workingPrinciple)}</p></article></div></section>
      <section class="band"><div class="section-heading"><p class="eyebrow">Technical Specifications</p><h2>Parametros estructurados</h2><p>Los valores vacios se ocultan en produccion; en preview se muestran como campos a confirmar.</p></div><table class="spec-table"><tbody>${specs}</tbody></table></section>
      <section class="band muted"><div class="geo-grid"><article><h3>Installation</h3><ul>${product.installationOptions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article><article><h3>Maintenance</h3><p>${escapeHtml(product.maintenanceInformation)}</p></article><article><h3>Shipping</h3><p>${escapeHtml(product.shippingInformation)}</p></article></div></section>`
  });
}

function quotePage(locale, catalog, url) {
  const product = url.searchParams.get("product") || "";
  return layout({
    locale,
    title: "Solicitar Cotizacion | Cowinmagnet LATAM",
    description: "Request a quote form for Cowinmagnet LATAM.",
    body: `<section class="band"><div class="section-heading"><p class="eyebrow">Quote</p><h1>Solicitud de cotizacion tecnica</h1><p>La informacion se guarda localmente en <code>data/local-db/enquiries.json</code>.</p></div>
      <form class="quote-form" method="post" action="/api/enquiries">
        <input name="sourcePage" type="hidden" value="${escapeHtml(url.pathname)}">
        <label>Name<input name="name" required></label>
        <label>Company<input name="company" required></label>
        <label>Country<input name="country" required value="Chile"></label>
        <label>Region<input name="region"></label>
        <label>Email<input name="email" type="email" required></label>
        <label>WhatsApp<input name="whatsapp" required></label>
        <label>Preferred Language<select name="language"><option>Spanish</option><option>Portuguese</option><option>English</option></select></label>
        <label>Product<select name="product"><option value="">Select product</option>${catalog.products.map((item) => `<option ${item.title === product ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></label>
        <label>Industry<input name="industry"></label>
        <label>Material<input name="material"></label>
        <label>Capacity<input name="capacity"></label>
        <label>Belt Width<input name="beltWidth"></label>
        <label>Belt Speed<input name="beltSpeed"></label>
        <label>Suspension Height<input name="suspensionHeight"></label>
        <label>Voltage<input name="voltage"></label>
        <label>Frequency<input name="frequency"></label>
        <label>Project Description<textarea name="projectDescription" rows="5" required></textarea></label>
        <button class="button primary" type="submit">Enviar solicitud</button>
      </form></section>`
  });
}

function searchPage(locale, catalog, url) {
  return productsPage(locale, catalog, url);
}

async function adminPage(catalog) {
  const enquiries = await readEnquiries();
  return layout({
    locale: defaultLocale,
    title: "Admin Dashboard | Cowinmagnet LATAM",
    description: "Local admin dashboard.",
    body: `<section class="band"><div class="section-heading"><p class="eyebrow">Admin</p><h1>Dashboard local</h1><p>Preview de administracion no expuesto a produccion.</p></div><div class="geo-grid"><article><h3>Products</h3><p>${catalog.products.length}</p><a href="/admin/products">Manage products</a></article><article><h3>Categories</h3><p>${catalog.categories.length}</p></article><article><h3>Enquiries</h3><p>${enquiries.length}</p><a href="/admin/enquiries">View enquiries</a></article></div></section>`
  });
}

function adminProductsPage(catalog) {
  return layout({
    locale: defaultLocale,
    title: "Admin Products | Cowinmagnet LATAM",
    description: "Local product admin.",
    body: `<section class="band"><div class="section-heading"><p class="eyebrow">Admin</p><h1>Products</h1><p>Productos sincronizados desde catalogo principal.</p></div><table class="admin-table"><thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Status</th></tr></thead><tbody>${catalog.products.map((item) => `<tr><td>${escapeHtml(item.sku)}</td><td><a href="/${defaultLocale}/products/${item.category}/${item.slug}">${escapeHtml(item.title)}</a></td><td>${escapeHtml(item.category)}</td><td>${item.status}</td></tr>`).join("")}</tbody></table></section>`
  });
}

async function adminEnquiriesPage() {
  const enquiries = await readEnquiries();
  return layout({
    locale: defaultLocale,
    title: "Admin Enquiries | Cowinmagnet LATAM",
    description: "Local enquiries admin.",
    body: `<section class="band"><div class="section-heading"><p class="eyebrow">Admin</p><h1>Enquiries</h1><p>${enquiries.length} saved records.</p></div><table class="admin-table"><thead><tr><th>ID</th><th>Name</th><th>Company</th><th>Product</th><th>Status</th><th>Date</th></tr></thead><tbody>${enquiries.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.company)}</td><td>${escapeHtml(item.product)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.createdAt)}</td></tr>`).join("") || "<tr><td colspan=\"6\">No enquiries yet.</td></tr>"}</tbody></table></section>`
  });
}

async function collectBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function serveStatic(pathname, response) {
  const publicRoot = pathname.startsWith("/assets/") ? join(root, "public") : root;
  const filePath = normalize(join(publicRoot, pathname));
  if (!filePath.startsWith(publicRoot) || !existsSync(filePath)) return false;
  const types = { ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
  response.writeHead(200, { "content-type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
  return true;
}

function send(response, status, html, headers = {}) {
  response.writeHead(status, { "content-type": "text/html; charset=utf-8", ...headers });
  response.end(html);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/enquiries") {
      const body = new URLSearchParams(await collectBody(request));
      const payload = Object.fromEntries(body.entries());
      if (!payload.name || !payload.email || !payload.projectDescription) {
        response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        response.end("Missing required fields");
        return;
      }
      const saved = await saveEnquiry(payload);
      response.writeHead(303, { location: `/admin/enquiries?saved=${encodeURIComponent(saved.id)}` });
      response.end();
      return;
    }

    if (request.method !== "GET") {
      response.writeHead(405);
      response.end("Method not allowed");
      return;
    }

    if (url.pathname === "/styles.css" || url.pathname.startsWith("/assets/")) {
      if (await serveStatic(url.pathname, response)) return;
    }

    const catalog = await loadCatalog();
    if (url.pathname === "/") {
      response.writeHead(302, { location: `/${defaultLocale}` });
      response.end();
      return;
    }
    if (url.pathname === "/admin") return send(response, 200, await adminPage(catalog));
    if (url.pathname === "/admin/products") return send(response, 200, adminProductsPage(catalog));
    if (url.pathname === "/admin/enquiries") return send(response, 200, await adminEnquiriesPage());

    const parts = url.pathname.split("/").filter(Boolean);
    const locale = locales.includes(parts[0]) ? parts[0] : defaultLocale;
    const route = locales.includes(parts[0]) ? parts.slice(1) : parts;

    if (route.length === 0) return send(response, 200, homePage(locale, catalog));
    if (route[0] === "products" && route.length === 1) return send(response, 200, productsPage(locale, catalog, url));
    if (route[0] === "products" && route.length === 2) {
      const html = categoryPage(locale, catalog, route[1]);
      return html ? send(response, 200, html) : send(response, 404, notFound(locale));
    }
    if (route[0] === "products" && route.length === 3) {
      const html = productPage(locale, catalog, route[1], route[2]);
      return html ? send(response, 200, html) : send(response, 404, notFound(locale));
    }
    if (route[0] === "request-a-quote") return send(response, 200, quotePage(locale, catalog, url));
    if (route[0] === "search") return send(response, 200, searchPage(locale, catalog, url));
    return send(response, 404, notFound(locale));
  } catch (error) {
    console.error(error);
    send(response, 500, `<pre>${escapeHtml(error.stack || error.message)}</pre>`);
  }
});

function notFound(locale) {
  return layout({
    locale,
    title: "404 | Cowinmagnet LATAM",
    description: "Page not found.",
    body: `<section class="band"><div class="section-heading"><p class="eyebrow">404</p><h1>Pagina no encontrada</h1><p>La ruta solicitada no existe en el preview local.</p><a class="button primary" href="/${locale}">Volver al inicio</a></div></section>`
  });
}

await ensureDb();
server.listen(port, () => {
  console.log(`Cowinmagnet local preview running at http://localhost:${port}/`);
});
