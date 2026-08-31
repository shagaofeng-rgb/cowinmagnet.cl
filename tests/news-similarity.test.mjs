import test from "node:test";
import assert from "node:assert/strict";
import { maxNewsDuplicationScore, NEWS_DUPLICATION_THRESHOLD, newsEventSimilarity } from "../lib/newsSimilarity.mjs";

const sharedTemplate = "Este bloque editorial común explica trazabilidad, seguridad, operación, mantenimiento y verificación documental. ".repeat(120);

test("shared editorial boilerplate does not make different source events duplicates", () => {
  const copper = {
    title: "Nueva inversión de cobre para ampliar una faena chilena",
    summary: "La compañía confirmó una ampliación de capacidad y un nuevo calendario de construcción.",
    body: sharedTemplate,
    sourceFingerprint: "source-copper",
    eventFingerprint: "event-copper",
    sources: [{ title: "Proyecto de cobre", supportedFact: "La inversión considera obras durante 2027." }]
  };
  const recycling = {
    title: "Planta de reciclaje incorpora clasificación de metales",
    summary: "El operador abrió una nueva línea para recuperar metales de residuos industriales.",
    body: sharedTemplate,
    sourceFingerprint: "source-recycling",
    eventFingerprint: "event-recycling",
    sources: [{ title: "Nueva planta de reciclaje", supportedFact: "La instalación procesará residuos industriales." }]
  };

  assert.ok(newsEventSimilarity(copper, recycling) < NEWS_DUPLICATION_THRESHOLD);
  assert.ok(maxNewsDuplicationScore(recycling, [copper]) < NEWS_DUPLICATION_THRESHOLD);
});

test("exact source and event fingerprints remain strict duplicate guards", () => {
  assert.equal(newsEventSimilarity({ sourceFingerprint: "same" }, { sourceFingerprint: "same" }), 1);
  assert.equal(newsEventSimilarity({ eventFingerprint: "same-event" }, { eventFingerprint: "same-event" }), 1);
});
