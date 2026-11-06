// The old HJLH listing used the same four images and public product data as the
// retained listing. Keep the source record in the synchronized catalog file.
const category = "magnetic-separation-equipment";
const from = "hjlh-type-vertical-ring-high-gradient-magnetic-separation";
const to = "hjlh-wet-vertical-ring-high-gradient-magnetic-separator";

export function canonicalProductSlug(productCategory, slug) {
  return productCategory === category && slug === from ? to : slug;
}

export function productRedirectPath(pathname) {
  const match = /^\/(es-cl|es|pt-br|en)\/products\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  const [, locale, productCategory, slug] = match;
  const canonical = canonicalProductSlug(productCategory, slug);
  return canonical === slug ? null : "/" + locale + "/products/" + productCategory + "/" + canonical;
}
