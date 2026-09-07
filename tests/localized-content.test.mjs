import assert from "node:assert/strict";
import test from "node:test";
import {
  collectionIndexingMetadata,
  contentIndexingMetadata,
  indexableLocalesForContent,
  isLocaleContentIndexable
} from "../lib/localizedContent.js";

const primaryArticle = {
  title: "Separacion magnetica para mineria",
  summary: "Guia tecnica para seleccionar equipos magneticos.",
  body: "Contenido editorial primario con criterios de seleccion y aplicacion.",
  localized: {}
};

test("only a complete and distinct translation is indexable", () => {
  const article = {
    ...primaryArticle,
    localized: {
      en: {
        title: "Magnetic separation for mining",
        summary: "Technical guidance for selecting magnetic equipment.",
        body: "A distinct English editorial article with selection and application criteria."
      },
      "pt-br": { title: "Separacao magnetica", summary: "Resumo sem corpo" }
    }
  };
  assert.equal(isLocaleContentIndexable(article, "es-cl"), true);
  assert.equal(isLocaleContentIndexable(article, "en"), true);
  assert.equal(isLocaleContentIndexable(article, "pt-br"), false);
  assert.equal(isLocaleContentIndexable(article, "es"), false);
  assert.deepEqual(indexableLocalesForContent(article), ["es-cl", "en"]);
});

test("display-localized content still compares against the preserved primary source", () => {
  const article = {
    title: "English title",
    summary: "English summary",
    body: "English body",
    sourceContent: { title: "Titulo original", summary: "Resumen original", body: "Cuerpo original" },
    localized: { en: { title: "English title", summary: "English summary", body: "English body" } }
  };
  assert.equal(isLocaleContentIndexable(article, "en"), true);
});

test("fallback locale is noindex and canonicalizes to the primary article", () => {
  const metadata = contentIndexingMetadata(primaryArticle, "en", "blog/example");
  assert.equal(metadata.indexable, false);
  assert.equal(metadata.alternates.canonical, "/es-cl/blog/example");
  assert.deepEqual(metadata.alternates.languages, {
    "es-CL": "/es-cl/blog/example",
    "x-default": "/es-cl/blog/example"
  });
});

test("collection only indexes a locale after it has indexable content", () => {
  const fallback = collectionIndexingMetadata([primaryArticle], "pt-br", "news");
  assert.equal(fallback.indexable, false);
  assert.equal(fallback.alternates.canonical, "/es-cl/news");
});
