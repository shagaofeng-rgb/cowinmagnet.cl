import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  atomicWriteFile,
  buildSitemapIndex,
  buildUrlset,
  escapeXml,
  normalizePublicEntry,
  reconcileEntries,
  splitSitemapEntries,
  validateSitemapXml,
  withFileLock
} from "../lib/sitemapCore.mjs";
import { submitSitemapRequest } from "../lib/searchConsoleSitemap.mjs";

const baseUrl = "https://cowinmagnet.cl";
const date = "2026-07-10T00:00:00.000Z";
const entry = (url, extra = {}) => ({ url, lastmod: date, status: "published", canonical: true, fingerprint: "a", active: true, ...extra });

test("generates a valid UTF-8 sitemap", () => {
  const xml = buildUrlset([entry(`${baseUrl}/es-cl`)]);
  assert.equal(validateSitemapXml(xml, "urlset"), true);
  assert.match(xml, /<loc>https:\/\/cowinmagnet\.cl\/es-cl<\/loc>/);
});

test("escapes XML special characters", () => {
  assert.equal(escapeXml(`a&b<c>\"d'e`), "a&amp;b&lt;c&gt;&quot;d&apos;e");
});

test("excludes draft, noindex, blocked, query and admin URLs", () => {
  assert.equal(normalizePublicEntry(entry("/es-cl/news/draft", { status: "draft" }), baseUrl), null);
  assert.equal(normalizePublicEntry(entry("/es-cl/news/noindex", { noindex: true }), baseUrl), null);
  assert.equal(normalizePublicEntry(entry("/es-cl/private", { blocked: true }), baseUrl), null);
  assert.equal(normalizePublicEntry(entry("/es-cl/products?q=x"), baseUrl), null);
  assert.equal(normalizePublicEntry(entry("/admin"), baseUrl), null);
});

test("removes deleted URLs during reconciliation", () => {
  const oldUrl = `${baseUrl}/es-cl/news/old`;
  const result = reconcileEntries({ posts: [] }, [entry(oldUrl)], date);
  assert.deepEqual(result.deleted, [oldUrl]);
});

test("preserves lastmod when content fingerprint is unchanged", () => {
  const url = `${baseUrl}/es-cl/products`;
  const oldDate = "2026-06-01T00:00:00.000Z";
  const result = reconcileEntries({ pages: [entry(url)] }, [entry(url, { lastmod: oldDate })], date);
  assert.equal(result.groups.pages[0].lastmod, oldDate);
  assert.equal(result.modified.length, 0);
});

test("updates lastmod only when the fingerprint changes", () => {
  const url = `${baseUrl}/es-cl/products`;
  const result = reconcileEntries({ pages: [entry(url, { fingerprint: "new" })] }, [entry(url, { fingerprint: "old", lastmod: "2026-06-01" })], date);
  assert.equal(result.groups.pages[0].lastmod, date);
  assert.deepEqual(result.modified, [url]);
});

test("splits before the configured URL limit", () => {
  const entries = Array.from({ length: 5 }, (_, index) => entry(`${baseUrl}/es-cl/news/${index}`));
  const chunks = splitSitemapEntries(entries, { maxUrls: 2, maxBytes: 50 * 1024 * 1024 });
  assert.deepEqual(chunks.map((chunk) => chunk.length), [2, 2, 1]);
});

test("splits before the configured byte limit", () => {
  const entries = [entry(`${baseUrl}/es-cl/news/${"a".repeat(80)}`), entry(`${baseUrl}/es-cl/news/${"b".repeat(80)}`)];
  assert.equal(splitSitemapEntries(entries, { maxUrls: 50_000, maxBytes: 250 }).length, 2);
});

test("generates a valid sitemap index", () => {
  const xml = buildSitemapIndex([{ url: `${baseUrl}/sitemaps/sitemap-pages.xml`, lastmod: date }]);
  assert.equal(validateSitemapXml(xml, "sitemapindex"), true);
  assert.match(xml, /<sitemapindex/);
});

test("concurrent file jobs are rejected by the lock", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sitemap-lock-"));
  const lockPath = path.join(dir, "job.lock");
  let release;
  const blocker = new Promise((resolve) => { release = resolve; });
  const first = withFileLock(lockPath, async () => { await blocker; return { done: true }; });
  await new Promise((resolve) => setTimeout(resolve, 25));
  const second = await withFileLock(lockPath, async () => ({ done: true }));
  assert.deepEqual(second, { locked: true });
  release();
  await first;
});

test("atomic write failure retains the previous file", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sitemap-write-"));
  const file = path.join(dir, "sitemap.xml");
  await atomicWriteFile(file, "old");
  await assert.rejects(() => atomicWriteFile(file, Symbol("invalid")));
  assert.equal(await fs.readFile(file, "utf8"), "old");
});

test("Search Console request reports successful submission", async () => {
  let method = "";
  const result = await submitSitemapRequest({
    accessToken: "token",
    siteUrl: "sc-domain:cowinmagnet.cl",
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    fetchImpl: async (_url, options) => { method = options.method; return new Response(null, { status: 204 }); }
  });
  assert.equal(method, "PUT");
  assert.equal(result.success, true);
});

test("Search Console authentication failure is returned without throwing", async () => {
  const result = await submitSitemapRequest({
    accessToken: "bad-token",
    siteUrl: "sc-domain:cowinmagnet.cl",
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    retries: 0,
    fetchImpl: async () => new Response(JSON.stringify({ error: { message: "Forbidden" } }), { status: 403, headers: { "content-type": "application/json" } })
  });
  assert.equal(result.success, false);
  assert.equal(result.status, 403);
  assert.equal(result.error, "Forbidden");
});
