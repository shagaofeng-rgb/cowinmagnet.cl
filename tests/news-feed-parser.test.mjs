import test from "node:test";
import assert from "node:assert/strict";
import { parseNewsFeed } from "../lib/newsFeedParser.mjs";

const source = { name: "Example", group: "mining-mineral-processing", sourceTrustScore: 80, tier: "B", country: "Chile", rssOrApiUrl: "https://example.com/feed" };

test("parses RSS, Atom and JSON feeds without mixing formats", () => {
  const rss = parseNewsFeed("<rss><channel><item><title>Minería</title><link>https://example.com/a</link><pubDate>Wed, 19 Aug 2026 12:00:00 GMT</pubDate><description>Actualización de minería verificable.</description></item></channel></rss>", source);
  const atom = parseNewsFeed("<feed><entry><title>Reciclaje</title><link href=\"https://example.com/b\"/><updated>2026-08-19T12:00:00Z</updated><summary>Actualización de reciclaje verificable.</summary></entry></feed>", { ...source, feedFormat: "atom" });
  const json = parseNewsFeed(JSON.stringify({ items: [{ title: "Cemento", url: "https://example.com/c", date_published: "2026-08-19T12:00:00Z", summary: "Actualización de cemento verificable." }] }), { ...source, feedFormat: "json-feed" });
  assert.equal(rss.length, 1);
  assert.equal(atom.length, 1);
  assert.equal(json.length, 1);
});
