import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const mainCatalogUrl = "https://www.cowinmagnet.com/en/products";
const outputPath = path.join(root, "data", "mainProductCatalog.json");
const sourceFile = process.argv[2] === "--from-file" ? process.argv[3] : "";

async function readSource() {
  if (sourceFile) return fs.readFile(path.resolve(sourceFile), "utf8");
  const response = await fetch(mainCatalogUrl, {
    headers: { "user-agent": "Cowinmagnet catalog synchronizer/1.0" },
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`Main catalog request failed with HTTP ${response.status}`);
  return response.text();
}

function decode(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");
}

function field(fragment, pattern) {
  return decode((fragment.match(pattern)?.[1] || "").trim());
}

function decodeUrl(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function parseCatalog(html) {
  const cards = [...html.matchAll(/<article class="product-card">([\s\S]*?)<\/article>/g)];
  const products = await Promise.all(cards.map(async (card) => {
    const fragment = card[1];
    const slug = field(fragment, /href="\/en\/products\/([^"]+)"/);
    const name = field(fragment, /<img alt="([^"]+)"/);
    const category = field(fragment, /<span>([\s\S]*?)<\/span>/).replace(/<[^>]+>/g, "");
    const image = decodeUrl(field(fragment, /src="\/_next\/image\?url=([^&"]+)/));
    return { slug, name, category, image, imageGallery: await localGallery(slug, image) };
  }));
  const validProducts = products.filter((product) => product.slug && product.name && product.category && product.image);

  const unique = new Map(validProducts.map((product) => [product.slug, product]));
  if (unique.size < 1 || unique.size !== validProducts.length) {
    throw new Error(`Catalog parse rejected: ${validProducts.length} cards, ${unique.size} unique products`);
  }
  return [...unique.values()];
}

async function localGallery(slug, fallback) {
  const directory = path.join(root, "public", "assets", "products", slug);
  try {
    const files = (await fs.readdir(directory))
      .filter((file) => /\.(avif|jpe?g|png|webp)$/i.test(file))
      .sort()
      .map((file) => `/assets/products/${slug}/${file}`);
    return files.length ? files : [fallback];
  } catch {
    return [fallback];
  }
}

const html = await readSource();
const products = await parseCatalog(html);
await fs.writeFile(outputPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ source: sourceFile ? path.resolve(sourceFile) : mainCatalogUrl, products: products.length, outputPath }, null, 2));
