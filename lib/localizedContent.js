export const INDEX_LOCALES = ["es-cl", "pt-br", "en"];
export const PRIMARY_INDEX_LOCALE = "es-cl";

const REQUIRED_FIELDS = ["title", "summary", "body"];

function normalizedText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function fieldsFor(item, locale) {
  const localized = item?.localized?.[locale];
  // Route data is localized for display. Preserve the source fields when they
  // are available so an English/Portuguese route is compared to the actual
  // primary article, rather than to its own already-merged fields.
  if (locale === PRIMARY_INDEX_LOCALE) return { ...(item?.sourceContent || item || {}), ...(localized || {}) };
  return localized && typeof localized === "object" ? localized : {};
}

function hasCompleteFields(fields) {
  return REQUIRED_FIELDS.every((field) => normalizedText(fields?.[field]).length > 0);
}

function contentSignature(fields) {
  return REQUIRED_FIELDS.map((field) => normalizedText(fields?.[field])).join("\n");
}

/**
 * Return whether a locale has its own complete, materially different article.
 * The public UI can still use a fallback translation, but fallback content must
 * not enter the sitemap or compete for a separate Google index entry.
 */
export function isLocaleContentIndexable(item, locale) {
  if (!INDEX_LOCALES.includes(locale)) return false;
  const localeFields = fieldsFor(item, locale);
  if (!hasCompleteFields(localeFields)) return false;
  if (locale === PRIMARY_INDEX_LOCALE) return true;

  const primaryFields = fieldsFor(item, PRIMARY_INDEX_LOCALE);
  if (!hasCompleteFields(primaryFields)) return false;
  return contentSignature(localeFields) !== contentSignature(primaryFields);
}

export function indexableLocalesForContent(item) {
  return INDEX_LOCALES.filter((locale) => isLocaleContentIndexable(item, locale));
}

export function canonicalLocaleForContent(item, locale) {
  return isLocaleContentIndexable(item, locale) ? locale : PRIMARY_INDEX_LOCALE;
}

export function contentIndexingMetadata(item, locale, path) {
  const indexableLocales = indexableLocalesForContent(item);
  const canonicalLocale = canonicalLocaleForContent(item, locale);
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const suffix = cleanPath ? `/${cleanPath}` : "";
  const languages = Object.fromEntries(indexableLocales.map((targetLocale) => {
    const hreflang = targetLocale === "es-cl" ? "es-CL" : targetLocale === "pt-br" ? "pt-BR" : "en";
    return [hreflang, `/${targetLocale}${suffix}`];
  }));
  languages["x-default"] = `/${PRIMARY_INDEX_LOCALE}${suffix}`;

  return {
    indexable: isLocaleContentIndexable(item, locale),
    canonicalLocale,
    alternates: {
      canonical: `/${canonicalLocale}${suffix}`,
      languages
    }
  };
}

export function collectionIndexingMetadata(items, locale, path) {
  const collection = Array.isArray(items) ? items : [];
  const indexableLocales = INDEX_LOCALES.filter((targetLocale) => (
    targetLocale === PRIMARY_INDEX_LOCALE || collection.some((item) => isLocaleContentIndexable(item, targetLocale))
  ));
  const indexable = indexableLocales.includes(locale);
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const suffix = cleanPath ? `/${cleanPath}` : "";
  const languages = Object.fromEntries(indexableLocales.map((targetLocale) => {
    const hreflang = targetLocale === "es-cl" ? "es-CL" : targetLocale === "pt-br" ? "pt-BR" : "en";
    return [hreflang, `/${targetLocale}${suffix}`];
  }));
  languages["x-default"] = `/${PRIMARY_INDEX_LOCALE}${suffix}`;
  return {
    indexable,
    alternates: {
      canonical: `/${indexable ? locale : PRIMARY_INDEX_LOCALE}${suffix}`,
      languages
    }
  };
}
