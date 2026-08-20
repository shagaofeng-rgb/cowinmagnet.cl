import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_NEWS_SITE_ID, activeThemeForSite, getNewsSiteConfig, validateNewsSiteConfig } from "../lib/newsSiteConfig.mjs";

test("News site configuration is complete and uses strict site identity", () => {
  const site = getNewsSiteConfig(DEFAULT_NEWS_SITE_ID);
  assert.equal(site.siteId, "cowinmagnet_latam");
  assert.equal(validateNewsSiteConfig(site).valid, true);
  assert.equal(site.news.ingestIntervalHours, 12);
  assert.equal(site.news.publishIntervalHours, 24);
  assert.equal(site.news.dailyPublicationLimit, 1);
  assert.equal(site.blog.allowNewsAutomation, false);
  assert.ok(site.sources.primaryWhitelist.length >= 3);
  assert.ok(site.sources.fallbackWhitelist.length >= 2);
});

test("Product theme rotation returns an active theme only for the configured site", () => {
  const site = getNewsSiteConfig(DEFAULT_NEWS_SITE_ID);
  const theme = activeThemeForSite(site, new Date("2026-08-11T00:00:00.000Z"));
  assert.ok(theme);
  assert.ok(site.productThemePlan.some((item) => item.themeId === theme.themeId));
  assert.equal(getNewsSiteConfig("unconfigured-site"), null);
});
