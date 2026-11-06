import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarDayKeys, getAdminDateRange, localDateKey } from "../lib/adminDateRange.js";
import { normalizeInquiry } from "../lib/inquiryInput.js";
import { buildInquiryNotification } from "../lib/inquiryNotification.js";
import { listIndexing } from "../lib/listPagination.js";
import { preferredLocale } from "../lib/preferredLocale.js";
import { productRedirectPath } from "../lib/productUrlAliases.js";
import { productLocalizationKey, publicLocalization } from "../lib/productLocalization.js";
import { weeklySubmissionSkip } from "../lib/weeklySitemap.js";

test("Santiago dates handle DST and do not add a UTC day to the chart", () => {
  const day = getAdminDateRange({ range: "custom", start: "2026-09-06", end: "2026-09-06" });
  assert.equal(day.startDate.toISOString(), "2026-09-06T04:00:00.000Z");
  assert.equal(day.endDate.toISOString(), "2026-09-07T02:59:59.999Z");
  assert.deepEqual(calendarDayKeys(day), ["2026-09-06"]);
  assert.equal(localDateKey(new Date("2026-11-07T02:55:00Z")), "2026-11-06");
  const invalid = getAdminDateRange({ range: "custom", start: "2026-02-29", end: "2026-03-05" });
  assert.equal(invalid.preset, "week");
});

test("weekly submission is due at Monday 01:00 UTC even after a Sunday legacy submission", () => {
  const due = new Date("2026-11-09T01:00:00Z");
  assert.equal(weeklySubmissionSkip("2026-11-08T23:40:00Z", due), null);
  assert.equal(weeklySubmissionSkip("2026-11-09T01:00:00Z", new Date("2026-11-09T01:05:00Z")).reason, "already-submitted-this-week");
  assert.equal(weeklySubmissionSkip(null, new Date("2026-11-09T00:59:59Z")).reason, "outside-weekly-window");
});

test("Chile browser language wins over a lower-priority English fallback", () => {
  assert.equal(preferredLocale({ languages: "es-CL, en;q=0.2" }), "es-cl");
  assert.equal(preferredLocale({ languages: "es-CL;q=0,pt-PT;q=.8,en;q=.9" }), "en");
  assert.equal(preferredLocale({ userAgent: "Googlebot", saved: "en" }), "es-cl");
  assert.equal(preferredLocale({ saved: "pt-br", languages: "es-CL" }), "pt-br");
});

test("collection pages have clean canonicals and filtered variants do not enter the index", () => {
  const shared = { total: 35, pageSize: 12, alternates: { canonical: "/es-cl/products/group", languages: { en: "/en/products/group" } }, filterKeys: ["sort"] };
  const indexed = listIndexing({ ...shared, query: { page: "2", utm_source: "campaign" } });
  assert.equal(indexed.alternates.canonical, "/es-cl/products/group?page=2");
  assert.equal(indexed.alternates.languages.en, "/en/products/group?page=2");
  assert.equal(indexed.robots.index, true);
  for (const query of [{ page: "2", sort: "model" }, { page: "9" }, { page: "2x" }, { page: ["1", "2"] }]) {
    const result = listIndexing({ ...shared, query });
    assert.equal(result.robots.index, false);
    assert.equal(result.alternates.canonical, "/es-cl/products/group");
  }
});

test("an HJLH duplicate redirects to the same language, and draft copy cannot render on the public product", () => {
  const prefix = "/pt-br/products/magnetic-separation-equipment/";
  assert.equal(productRedirectPath(prefix + "hjlh-type-vertical-ring-high-gradient-magnetic-separation"),
    prefix + "hjlh-wet-vertical-ring-high-gradient-magnetic-separator");
  const productSlug = "rcyd";
  const item = { type: "product-localization", status: "published", title: "RCYD", summary: "Summary", productSlug, locale: "es-cl", slug: productLocalizationKey("es-cl", productSlug) };
  assert.equal(publicLocalization(item, "es-cl", productSlug), item);
  assert.equal(publicLocalization({ ...item, status: "draft" }, "es-cl", productSlug), null);
  assert.equal(publicLocalization(item, "en", productSlug), null);
});

test("RCYD inquiry fields are normalized without letting a public caller set mail or record state", () => {
  const received = normalizeInquiry({
    name: " TEST-CL-LOCAL-QA-001 ", country: "Chile", product: "RCYD", model: "RCYD",
    projectDescription: "Conveyor selection QA", email: "customer@example.com", company: "Fixture",
    sourceUrl: "https://cowinmagnet.cl/es-cl/request-a-quote?test=1&model=rcyd&utm_source=qa&email=private",
    status: "Closed", rateKey: "untrusted", notification: { status: "delivered" },
    submissionId: "50100000-8090-4020-8310-000000000001"
  });
  assert.deepEqual(received.errors, {});
  assert.equal(received.payload.isTest, true);
  assert.equal(received.payload.model, "RCYD");
  assert.equal(received.payload.notification, undefined);
  assert.equal(received.payload.status, undefined);
  assert.equal(received.payload.sourceUrl, "https://cowinmagnet.cl/es-cl/request-a-quote?model=rcyd&utm_source=qa");
  assert.equal(normalizeInquiry({ ...received.payload, name: 123 }).errors.name, "Expected text.");
  assert.equal(normalizeInquiry({ ...received.payload, sourceUrl: "https://external.example/es-cl?test=1", name: "Customer" }).payload.sourceUrl, undefined);
  const mail = buildInquiryNotification({ ...received.payload, id: "INQ-" + received.submissionId, ipHash: "not-for-email" });
  assert.match(mail.subject, /^\[cowinmagnet\.cl website\]/);
  assert.match(mail.text, /Model: RCYD/);
  assert.doesNotMatch(mail.text, /not-for-email/);
});
