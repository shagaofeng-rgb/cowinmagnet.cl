import test from "node:test";
import assert from "node:assert/strict";
import { getNewsSiteConfig } from "../lib/newsSiteConfig.mjs";
import { alreadyPublishedToday, localPublicationDayKey, publicationWindow } from "../lib/newsSchedule.mjs";

test("daily publication guard uses the configured Chile timezone", () => {
  const site = getNewsSiteConfig();
  const duringWindow = new Date("2026-08-20T14:00:00.000Z");
  const beforeWindow = new Date("2026-08-20T11:00:00.000Z");
  assert.equal(publicationWindow(site, duringWindow).isOpen, true);
  assert.equal(publicationWindow(site, beforeWindow).isOpen, false);
  const publishedAt = new Date("2026-08-20T13:30:00.000Z");
  assert.equal(alreadyPublishedToday(site, [{ status: "published", publishedAt }], duringWindow), true);
  assert.match(localPublicationDayKey(site, duringWindow), /^2026-08-20$/);
});
