import test from "node:test";
import assert from "node:assert/strict";
import { getNewsSiteConfig } from "../lib/newsSiteConfig.mjs";
import { sourceCatalog } from "../data/news/cowinmagnet-cl-source-catalog.mjs";
import { activeSourcesForNewsSite, canonicalDomain, sourceCatalogForNewsSite, sourceIsEligibleForPublishing } from "../lib/newsSourceCatalog.mjs";
import { buildValidationResult, canUseSourceForCandidate, classifySource } from "../lib/newsSourceValidation.mjs";

test("normalizes canonical source domains without treating subdomains as separate publishers", () => {
  assert.equal(canonicalDomain("https://www.portalminero.com/wp/feed/"), "portalminero.com");
  assert.equal(canonicalDomain("subdomain.example.co.uk"), "example.co.uk");
});

test("only verified, robots-permitted catalog sources are available to the active crawler", async () => {
  const site = getNewsSiteConfig();
  const active = await activeSourcesForNewsSite(site, { fallback: true });
  assert.ok(active.every((source) => source.rssOrApiUrl && source.tier !== "discovery-only"));
  assert.equal(sourceCatalog.length, 300);
  assert.ok(sourceCatalog.every((source) => source.active === false && source.validationStatus === "pending"));
  assert.ok(sourceIsEligibleForPublishing({ active: true, validationStatus: "verified", robotsAllowed: true, tier: "A" }));
  assert.equal(sourceIsEligibleForPublishing({ active: true, validationStatus: "verified", robotsAllowed: false, tier: "A" }), false);
});

test("configured whitelist sources are present and prioritized for health validation", () => {
  const site = getNewsSiteConfig();
  const catalog = sourceCatalogForNewsSite(site);
  const configured = catalog.filter((source) => source.configuredPriority);
  const configuredDomains = new Set(configured.map((source) => source.canonicalDomain));
  for (const source of [...site.sources.primaryWhitelist, ...site.sources.fallbackWhitelist]) {
    assert.ok(configuredDomains.has(canonicalDomain(source.domain)));
  }
  assert.ok(configured.every((source) => source.rssOrApiUrl && source.sourceOrdinal < configured.length));
});

test("classifies communities as discovery-only and refuses source cooldown violations", () => {
  assert.equal(classifySource({ name: "Reddit r/Mining", requestedDomain: "reddit.com" }), "discovery-only");
  assert.deepEqual(canUseSourceForCandidate({ active: true, validationStatus: "verified", robotsAllowed: true, tier: "B" }, { domainUsesLast14Days: 1 }), { eligible: false, reason: "same_domain_cooldown_14d" });
});

test("validation does not activate a source when robots or a valid discovery method is missing", () => {
  const entry = { id: "source-1", requestedDomain: "example.com", active: false, validationStatus: "pending", tier: "B" };
  const blocked = buildValidationResult(entry, { status: 200, finalUrl: "https://example.com/", robotsAllowed: false, discoveryMethod: ["rss"] });
  assert.equal(blocked.validationStatus, "robots-blocked");
  const noMethod = buildValidationResult(entry, { status: 200, finalUrl: "https://example.com/", robotsAllowed: true, discoveryMethod: [] });
  assert.equal(noMethod.active, false);
});
