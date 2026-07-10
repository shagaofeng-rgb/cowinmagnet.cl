import fs from "node:fs/promises";
import path from "node:path";

export const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
export const MAX_SITEMAP_URLS = 49_000;
export const MAX_SITEMAP_BYTES = 49 * 1024 * 1024;

export function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function toW3cDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function normalizePublicEntry(entry, baseUrl) {
  if (!entry || entry.status && entry.status !== "published") return null;
  if (entry.noindex || entry.blocked || entry.canonical === false) return null;

  let url;
  try {
    url = new URL(entry.url, baseUrl);
  } catch {
    return null;
  }

  const origin = new URL(baseUrl).origin;
  if (url.origin !== origin || url.search || url.hash) return null;
  if (/^\/(admin|api)(\/|$)/.test(url.pathname) || /\/search\/?$/.test(url.pathname)) return null;

  const lastmod = toW3cDate(entry.lastmod);
  if (!lastmod) return null;
  return { ...entry, url: url.toString(), lastmod };
}

export function renderUrl(entry) {
  return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n  </url>`;
}

export function buildUrlset(entries) {
  const body = entries.map(renderUrl).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NAMESPACE}">\n${body}\n</urlset>\n`;
}

export function buildSitemapIndex(items) {
  const body = items.map((item) => {
    const lastmod = toW3cDate(item.lastmod);
    return `  <sitemap>\n    <loc>${escapeXml(item.url)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}\n  </sitemap>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${SITEMAP_NAMESPACE}">\n${body}\n</sitemapindex>\n`;
}

export function validateSitemapXml(xml, expectedRoot) {
  if (!xml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")) return false;
  if (!xml.includes(`xmlns="${SITEMAP_NAMESPACE}"`)) return false;
  if (expectedRoot === "urlset") {
    if (!xml.includes("<urlset") || !xml.endsWith("</urlset>\n")) return false;
    const urlCount = (xml.match(/<url>/g) || []).length;
    if (urlCount !== (xml.match(/<\/url>/g) || []).length) return false;
  }
  if (expectedRoot === "sitemapindex") {
    if (!xml.includes("<sitemapindex") || !xml.endsWith("</sitemapindex>\n")) return false;
    const count = (xml.match(/<sitemap>/g) || []).length;
    if (count !== (xml.match(/<\/sitemap>/g) || []).length) return false;
  }
  return !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(xml);
}

export function splitSitemapEntries(entries, { maxUrls = MAX_SITEMAP_URLS, maxBytes = MAX_SITEMAP_BYTES } = {}) {
  const chunks = [];
  let current = [];
  let bytes = Buffer.byteLength(buildUrlset([]), "utf8");

  for (const entry of entries) {
    const entryBytes = Buffer.byteLength(`${renderUrl(entry)}\n`, "utf8");
    if (current.length && (current.length >= maxUrls || bytes + entryBytes >= maxBytes)) {
      chunks.push(current);
      current = [];
      bytes = Buffer.byteLength(buildUrlset([]), "utf8");
    }
    current.push(entry);
    bytes += entryBytes;
  }
  if (current.length || !chunks.length) chunks.push(current);
  return chunks;
}

export function reconcileEntries(groups, existingRows, nowValue = new Date().toISOString()) {
  const existing = new Map(existingRows.map((row) => [row.url, row]));
  const currentUrls = new Set();
  const added = [];
  const modified = [];
  const resolvedGroups = {};

  for (const [group, entries] of Object.entries(groups)) {
    resolvedGroups[group] = entries.map((item) => {
      currentUrls.add(item.url);
      const previous = existing.get(item.url);
      let lastmod = item.lastmod;
      if (previous?.fingerprint === item.fingerprint && previous.active) lastmod = previous.lastmod;
      else if (previous) {
        lastmod = nowValue;
        modified.push(item.url);
      } else added.push(item.url);
      return { ...item, lastmod: new Date(lastmod).toISOString() };
    });
  }
  const deleted = existingRows.filter((row) => row.active && !currentUrls.has(row.url)).map((row) => row.url);
  return { groups: resolvedGroups, added, modified, deleted };
}

export async function atomicWriteFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, content, "utf8");
  const written = await fs.readFile(tempPath, "utf8");
  if (written !== content) {
    await fs.unlink(tempPath).catch(() => {});
    throw new Error(`Atomic sitemap verification failed for ${filePath}`);
  }
  await fs.rename(tempPath, filePath);
}

export async function withFileLock(lockPath, task, { staleMs = 10 * 60 * 1000 } = {}) {
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  let handle;
  try {
    handle = await fs.open(lockPath, "wx");
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const stat = await fs.stat(lockPath).catch(() => null);
    if (!stat || Date.now() - stat.mtimeMs <= staleMs) return { locked: true };
    await fs.unlink(lockPath).catch(() => {});
    handle = await fs.open(lockPath, "wx");
  }

  try {
    await handle.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    return await task();
  } finally {
    await handle.close().catch(() => {});
    await fs.unlink(lockPath).catch(() => {});
  }
}
