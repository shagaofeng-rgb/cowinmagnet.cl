export const PRODUCT_LOCALIZATION_TYPE = "product-localization";
export const PRODUCT_LOCALIZATION_TAG = "public-product-localizations";
export const EDITABLE_PRODUCT_LOCALES = ["es-cl", "en", "pt-br"];

export function productLocalizationKey(locale, productSlug, state = "live") {
  return [locale, productSlug, state].join("--");
}

export function readProductLocalization(form) {
  const fields = { title: 140, summary: 280, overview: 1600 };
  const values = {};
  for (const [field, max] of Object.entries(fields)) {
    const value = form.get(field);
    if (typeof value !== "string" || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) return null;
    values[field] = (field === "overview" ? value.replace(/\r\n/g, "\n") : value.replace(/\s+/g, " ")).trim();
  }
  return values.title && values.summary ? values : null;
}

export function publicLocalization(item, locale, productSlug) {
  return item?.type === PRODUCT_LOCALIZATION_TYPE && item.status === "published"
    && item.slug === productLocalizationKey(locale, productSlug) && item.locale === locale
    && item.productSlug === productSlug && typeof item.title === "string" && item.title
    && typeof item.summary === "string" && item.summary
    ? item : null;
}
