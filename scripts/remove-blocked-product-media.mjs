import fs from "node:fs";
import path from "node:path";
import { isAllowedProductMedia } from "./product-media-policy.mjs";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const productRoot = path.join(publicRoot, "assets", "products");
const catalogPath = path.join(root, "data", "mainProductCatalog.json");
const imagePattern = /\.(avif|jpe?g|png|webp)$/i;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const blockedFiles = walk(publicRoot).filter((filePath) => imagePattern.test(filePath) && !isAllowedProductMedia(filePath));
for (const filePath of blockedFiles) fs.unlinkSync(filePath);

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
for (const product of catalog) {
  const directory = path.join(productRoot, product.slug);
  if (!fs.existsSync(directory)) continue;
  const gallery = fs.readdirSync(directory)
    .filter((file) => imagePattern.test(file))
    .map((file) => path.join(directory, file))
    .filter(isAllowedProductMedia)
    .sort()
    .map((file) => `/assets/products/${product.slug}/${path.basename(file)}`);
  if (gallery.length) {
    product.image = gallery[0];
    product.imageGallery = gallery;
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ removed: blockedFiles.length, files: blockedFiles.map((file) => path.relative(root, file)), catalogProducts: catalog.length }, null, 2));
