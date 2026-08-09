import fs from "node:fs";
import path from "node:path";
import { isAllowedProductMedia } from "./product-media-policy.mjs";

const root = process.cwd();
const catalogPath = path.join(root, "data", "mainProductCatalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

for (const product of catalog) {
  const directory = path.join(root, "public", "assets", "products", product.slug);
  if (!fs.existsSync(directory)) continue;
  const gallery = fs.readdirSync(directory)
    .filter((file) => /\.(avif|jpe?g|png|webp)$/i.test(file))
    .filter((file) => isAllowedProductMedia(path.join(directory, file)))
    .sort()
    .map((file) => `/assets/products/${product.slug}/${file}`);
  if (gallery.length) {
    product.image = gallery[0];
    product.imageGallery = gallery;
  }
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(JSON.stringify({ products: catalog.length, galleriesWithMultipleMedia: catalog.filter((product) => product.imageGallery?.length > 1).length }, null, 2));
