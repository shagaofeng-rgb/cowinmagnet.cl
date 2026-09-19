import { inspectGoogleSearchConsoleUrls } from "@/lib/googleSearchConsole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE_URL = "https://cowinmagnet.cl";
const CORE_URLS = [
  `${BASE_URL}/es-cl`,
  `${BASE_URL}/es-cl/products`,
  `${BASE_URL}/es-cl/news`,
  `${BASE_URL}/sitemap.xml`
];

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function readPositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, max)) : fallback;
}

function rotatingOffset(total, limit) {
  if (!total) return 0;
  // The cron runs every two hours. Advancing by one inspected batch per slot
  // covers the sitemap in roughly two days without storing mutable cursor state.
  const slot = Math.floor(Date.now() / (2 * 60 * 60 * 1000));
  return (slot * limit) % total;
}

function extractLocations(xml) {
  return [...String(xml || "").matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

async function fetchXml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: "application/xml,text/xml;q=0.9,*/*;q=0.1" } });
    if (!response.ok) throw new Error(`Sitemap fetch failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function sitemapUrls() {
  const index = await fetchXml(`${BASE_URL}/sitemap.xml`);
  const childSitemaps = extractLocations(index).filter((url) => url.startsWith(`${BASE_URL}/sitemaps/`));
  const entries = await Promise.all(childSitemaps.map(async (url) => extractLocations(await fetchXml(url))));
  return [...new Set(entries.flat().filter((url) => url.startsWith(`${BASE_URL}/`)))];
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") === "core" ? "core" : "sitemap";
  const requestedOffset = url.searchParams.get("offset");
  const limit = readPositiveInteger(url.searchParams.get("limit"), 8, 10) || 8;
  const candidates = scope === "core" ? CORE_URLS : await sitemapUrls();
  const offset = requestedOffset === null
    ? rotatingOffset(candidates.length, limit)
    : readPositiveInteger(requestedOffset, 0, 10_000);
  const urls = candidates.slice(offset, offset + limit);
  const inspection = await inspectGoogleSearchConsoleUrls(urls, { concurrency: 2 });

  const payload = {
    success: !inspection.error,
    scope,
    totalCandidates: candidates.length,
    offset,
    limit,
    rotation: requestedOffset === null,
    nextOffset: offset + urls.length < candidates.length ? offset + urls.length : null,
    ...inspection
  };
  console.log("[search-console-audit]", JSON.stringify({
    success: payload.success,
    scope,
    totalCandidates: payload.totalCandidates,
    offset,
    limit,
    rotation: payload.rotation,
    summary: inspection.summary,
    error: inspection.error || ""
  }));
  return Response.json(payload, { status: inspection.error ? 502 : 200 });
}
