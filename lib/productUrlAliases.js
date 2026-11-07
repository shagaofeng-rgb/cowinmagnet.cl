// Each pair has the same model, public description and byte-identical gallery.
// Keep the source records in the synchronized catalog file.
const category = "magnetic-separation-equipment";
const aliases = new Map([
  ["hjlh-type-vertical-ring-high-gradient-magnetic-separation", "hjlh-wet-vertical-ring-high-gradient-magnetic-separator"],
  ["dcz-type-dry-fully-automatic-magnetic-separation", "dcz-type-dry-fully-automatic-magnetic-separator"],
  ["cqz-type-fully-automatic-online-magnetic-separation", "cqz-type-fully-automatic-online-magnetic-separator"]
]);

export function canonicalProductSlug(productCategory, slug) {
  return productCategory === category ? canonicalQuoteModel(slug) : slug;
}

export function canonicalQuoteModel(slug) {
  return aliases.get(slug) || slug;
}

export function productRedirectPath(pathname) {
  const match = /^\/(es-cl|es|pt-br|en)\/products\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  const [, locale, productCategory, slug] = match;
  const canonical = canonicalProductSlug(productCategory, slug);
  return canonical === slug ? null : "/" + locale + "/products/" + productCategory + "/" + canonical;
}
