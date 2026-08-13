import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { databaseSsl, databaseUrl, withDatabaseRetry } from "./database.js";
import { getGoogleSearchConsoleSnapshot } from "./googleSearchConsole.js";

const { Pool } = pg;
const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-analytics") : path.join(process.cwd(), ".data");
const EVENT_FILE = path.join(DATA_DIR, "analytics-events.json");
const SYNC_FILE = path.join(DATA_DIR, "analytics-sync-runs.json");
const SCHEMA_LOCK_ID = 52402003;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const ANALYTICS_TABLE = `${TABLE_PREFIX}_analytics_events`;
const ANALYTICS_SYNC_TABLE = `${TABLE_PREFIX}_analytics_sync_runs`;

let pool;
let schemaReady = false;

function isConcurrentCreateTableError(error) {
  return String(error?.message || error).includes("pg_type_typname_nsp_index")
    || String(error?.message || error).includes("already exists");
}

async function safeSchemaQuery(client, sql) {
  try {
    await client.query(sql);
  } catch (error) {
    if (!isConcurrentCreateTableError(error)) throw error;
  }
}

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      ssl: databaseSsl(),
      max: 3,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
      maxLifetimeSeconds: 300,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      statement_timeout: 30000,
      query_timeout: 30000
    });
    pool.on("error", (error) => {
      console.warn("[analyticsStore] idle database connection error", error?.message || error);
    });
  }
  return pool;
}

async function ensureSchema() {
  const db = getPool();
  if (!db || schemaReady) return;
  const client = await db.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [SCHEMA_LOCK_ID]);
    await safeSchemaQuery(client, `
      CREATE TABLE IF NOT EXISTS ${ANALYTICS_TABLE} (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        type TEXT NOT NULL,
        visitor_id TEXT,
        page TEXT,
        country TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_TABLE}_type_date_idx ON ${ANALYTICS_TABLE} (type, created_at DESC)`);
    await safeSchemaQuery(client, `
      CREATE TABLE IF NOT EXISTS ${ANALYTICS_SYNC_TABLE} (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        status TEXT NOT NULL,
        source TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_SYNC_TABLE}_created_idx ON ${ANALYTICS_SYNC_TABLE} (created_at DESC)`);
    schemaReady = true;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_ID]).catch(() => {});
    client.release();
  }
}

function isSampleEvent(event) {
  return String(event?.id || "").startsWith("sample-");
}

async function readFileEvents() {
  try {
    const text = await fs.readFile(EVENT_FILE, "utf8");
    const data = JSON.parse(text);
    return Array.isArray(data) ? data.filter((event) => !isSampleEvent(event)) : [];
  } catch {
    return [];
  }
}

export function getAnalyticsStorageMode() {
  return process.env.DATABASE_URL ? "database" : "local-file";
}

export async function appendAnalyticsEvent(payload) {
  const event = {
    id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: payload.type || "page_view",
    visitorId: String(payload.visitorId || "anonymous").slice(0, 80),
    sessionId: String(payload.sessionId || "session").slice(0, 80),
    page: String(payload.page || "/").slice(0, 240),
    previousPage: String(payload.previousPage || "").slice(0, 240),
    pageTitle: String(payload.pageTitle || payload.page || "").slice(0, 180),
    country: String(payload.country || "Unknown").slice(0, 80),
    city: String(payload.city || "").slice(0, 80),
    device: String(payload.device || "Desktop"),
    browser: String(payload.browser || "Chrome"),
    os: String(payload.os || "Windows"),
    channel: String(payload.channel || "Direct"),
    sourcePlatform: String(payload.sourcePlatform || "Direct"),
    sourceDetail: String(payload.sourceDetail || "No referrer or UTM"),
    utmSource: String(payload.utmSource || payload.utm_source || "").slice(0, 120),
    utmMedium: String(payload.utmMedium || payload.utm_medium || "").slice(0, 120),
    utmCampaign: String(payload.utmCampaign || payload.utm_campaign || "").slice(0, 160),
    utmTerm: String(payload.utmTerm || payload.utm_term || "").slice(0, 160),
    utmContent: String(payload.utmContent || payload.utm_content || "").slice(0, 160),
    referrer: String(payload.referrer || "").slice(0, 500),
    language: String(payload.language || "").slice(0, 40),
    ip: String(payload.ip || ""),
    duration: Number(payload.duration || 0),
    timestamp: payload.timestamp || new Date().toISOString()
  };

  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await db.query(
      `INSERT INTO ${ANALYTICS_TABLE} (id, payload, type, visitor_id, page, country, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [event.id, event, event.type, event.visitorId, event.page, event.country, event.timestamp]
      );
    }, { label: "analyticsStore.append" });
    return { ok: true, storageMode: "database" };
  }

  const events = await readFileEvents();
  events.push(event);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(EVENT_FILE, JSON.stringify(events.slice(-5000), null, 2), "utf8");
  return { ok: true, storageMode: "local-file" };
}

async function readAnalyticsEvents() {
  const db = getPool();
  if (db) {
    const result = await withDatabaseRetry(async () => {
      await ensureSchema();
      return db.query(`SELECT payload FROM ${ANALYTICS_TABLE} ORDER BY created_at DESC LIMIT 5000`);
    }, { label: "analyticsStore.read" });
    return result.rows.map((row) => row.payload).filter((event) => !isSampleEvent(event));
  }
  return readFileEvents();
}

async function readFileSyncRuns() {
  try {
    const text = await fs.readFile(SYNC_FILE, "utf8");
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function saveSyncRun(run) {
  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await db.query(
      `INSERT INTO ${ANALYTICS_SYNC_TABLE} (id, payload, status, source, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [run.id, run, run.status, run.source, run.finishedAt || run.startedAt]
      );
    }, { label: "analyticsStore.sync-save" });
    return;
  }

  const runs = await readFileSyncRuns();
  runs.push(run);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SYNC_FILE, JSON.stringify(runs.slice(-200), null, 2), "utf8");
}

async function getLatestSyncRunBySource(source) {
  const db = getPool();
  if (db) {
    const result = await withDatabaseRetry(async () => {
      await ensureSchema();
      return db.query(
        `SELECT payload FROM ${ANALYTICS_SYNC_TABLE} WHERE source = $1 ORDER BY created_at DESC LIMIT 1`,
        [source]
      );
    }, { label: "analyticsStore.sync-read-source" });
    return result.rows[0]?.payload || null;
  }

  const runs = await readFileSyncRuns();
  return runs.slice().reverse().find((run) => run.source === source) || null;
}

export async function getLatestSyncStatus() {
  const db = getPool();
  if (db) {
    const result = await withDatabaseRetry(async () => {
      await ensureSchema();
      return db.query(`SELECT payload FROM ${ANALYTICS_SYNC_TABLE} ORDER BY created_at DESC LIMIT 1`);
    }, { label: "analyticsStore.sync-read" });
    if (result.rows[0]?.payload) return result.rows[0].payload;
  } else {
    const runs = await readFileSyncRuns();
    if (runs.length) return runs[runs.length - 1];
  }

  return {
    id: "",
    status: "waiting",
    source: "system",
    storageMode: getAnalyticsStorageMode(),
    processedCount: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    inquiries: 0,
    startedAt: "",
    finishedAt: "",
    error: ""
  };
}

export async function getLatestSearchConsoleSyncStatus() {
  return (await getLatestSyncRunBySource("google-search-console")) || {
    id: "",
    status: "waiting",
    source: "google-search-console",
    storageMode: getAnalyticsStorageMode(),
    startedAt: "",
    finishedAt: "",
    error: ""
  };
}

export async function runAnalyticsSync({ source = "cron" } = {}) {
  const startedAt = new Date();
  const rangeStart = new Date(startedAt);
  rangeStart.setHours(0, 0, 0, 0);
  const id = `${startedAt.getTime()}-${Math.random().toString(16).slice(2)}`;

  try {
    const snapshot = await getAnalyticsSnapshot({ startDate: rangeStart, endDate: startedAt });
    const run = {
      id,
      status: "success",
      source,
      storageMode: snapshot.storageMode,
      processedCount: snapshot.overview.pageViews + snapshot.overview.inquiries,
      pageViews: snapshot.overview.pageViews,
      uniqueVisitors: snapshot.overview.uniqueVisitors,
      sessions: snapshot.overview.sessions,
      inquiries: snapshot.overview.inquiries,
      rangeStart: snapshot.rangeStart,
      rangeEnd: snapshot.rangeEnd,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      error: ""
    };
    await saveSyncRun(run);
    return { success: true, data: run };
  } catch (error) {
    const run = {
      id,
      status: "error",
      source,
      storageMode: getAnalyticsStorageMode(),
      processedCount: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      inquiries: 0,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      error: error?.message || String(error)
    };
    await saveSyncRun(run).catch(() => {});
    return { success: false, data: run };
  }
}

export async function runSearchConsoleSync({ source = "vercel-cron" } = {}) {
  const startedAt = new Date();
  // Search Console finalizes search-performance data with a delay. Querying the
  // last complete day prevents an apparent all-zero result during that window.
  const rangeEnd = new Date(startedAt.getTime() - 3 * 86400000);
  rangeEnd.setHours(23, 59, 59, 999);
  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeStart.getDate() - 27);
  rangeStart.setHours(0, 0, 0, 0);
  const id = `${startedAt.getTime()}-${Math.random().toString(16).slice(2)}`;

  try {
    const snapshot = await getGoogleSearchConsoleSnapshot({ startDate: rangeStart, endDate: rangeEnd });
    if (snapshot.error) throw new Error(snapshot.error);

    const run = {
      id,
      status: "success",
      source,
      storageMode: getAnalyticsStorageMode(),
      siteUrl: snapshot.siteUrl || "",
      rangeStart: rangeStart.toISOString(),
      rangeEnd: rangeEnd.toISOString(),
      clicks: snapshot.overview?.clicks || 0,
      impressions: snapshot.overview?.impressions || 0,
      indexedPages: snapshot.overview?.indexedPages || 0,
      notIndexedPages: snapshot.overview?.notIndexedPages || 0,
      inspectedUrls: snapshot.indexingStatus?.length || 0,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      error: ""
    };
    await saveSyncRun(run);
    return { success: true, data: run };
  } catch (error) {
    const run = {
      id,
      status: "error",
      source,
      storageMode: getAnalyticsStorageMode(),
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      error: error?.message || String(error)
    };
    await saveSyncRun(run).catch(() => {});
    return { success: false, data: run };
  }
}

function inRange(event, range) {
  const time = new Date(event.timestamp).getTime();
  return time >= range.startDate.getTime() && time <= range.endDate.getTime();
}

function countBy(rows, key, limit = 10) {
  const map = new Map();
  rows.forEach((row) => {
    const value = row[key] || "Unknown";
    map.set(value, (map.get(value) || 0) + 1);
  });
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, limit);
}

function pageStats(events) {
  const map = new Map();
  events.filter((event) => event.type === "page_view").forEach((event) => {
    const item = map.get(event.page) || { page: event.page, title: event.pageTitle || event.page, views: 0, visitors: new Set(), durationTotal: 0, inquiries: 0 };
    item.views += 1;
    item.visitors.add(event.visitorId);
    item.durationTotal += Number(event.duration || 0);
    map.set(event.page, item);
  });
  events.filter((event) => event.type === "form_submit").forEach((event) => {
    const item = map.get(event.page);
    if (item) item.inquiries += 1;
  });
  return [...map.values()].map((item) => ({
    page: item.page,
    title: item.title,
    views: item.views,
    visitors: item.visitors.size,
    avgDuration: item.views ? Math.round(item.durationTotal / item.views) : 0,
    inquiries: item.inquiries,
    conversionRate: item.views ? Number(((item.inquiries / item.views) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.views - a.views);
}

function visitorSessionStats(events) {
  const sessionsByVisitor = new Map();
  events.filter((event) => event.type === "page_view").forEach((event) => {
    const visitorId = event.visitorId || event.id;
    const sessionId = event.sessionId || event.id;
    const sessions = sessionsByVisitor.get(visitorId) || new Set();
    sessions.add(sessionId);
    sessionsByVisitor.set(visitorId, sessions);
  });
  return sessionsByVisitor;
}

function calculateBounceRate(pageViews) {
  const sessions = new Map();
  pageViews.forEach((event) => {
    const sessionId = event.sessionId || event.id;
    sessions.set(sessionId, (sessions.get(sessionId) || 0) + 1);
  });
  if (!sessions.size) return 0;
  const bounced = [...sessions.values()].filter((count) => count === 1).length;
  return Number(((bounced / sessions.size) * 100).toFixed(1));
}

function series(events, range) {
  const days = new Map();
  const cursor = new Date(range.startDate);
  while (cursor <= range.endDate) {
    const key = cursor.toISOString().slice(0, 10);
    days.set(key, { date: key, pv: 0, uv: new Set(), inquiries: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  events.forEach((event) => {
    const key = new Date(event.timestamp).toISOString().slice(0, 10);
    const item = days.get(key);
    if (!item) return;
    if (event.type === "page_view") {
      item.pv += 1;
      item.uv.add(event.visitorId);
    }
    if (event.type === "form_submit") item.inquiries += 1;
  });
  return [...days.values()].map((item) => ({ ...item, uv: item.uv.size }));
}

function acquisitionStats(events) {
  const sessions = new Map();
  events.forEach((event) => {
    const key = event.sessionId || event.visitorId || event.id;
    const item = sessions.get(key) || {
      source: event.sourcePlatform || event.channel || "Direct",
      channel: event.channel || "Direct",
      platform: event.sourcePlatform || "Direct",
      campaign: event.utmCampaign || event.campaign || "",
      landingPage: event.page,
      visitors: new Set(),
      sessions: new Set(),
      pageViews: 0,
      leads: 0
    };
    item.visitors.add(event.visitorId);
    item.sessions.add(key);
    if (event.type === "page_view") item.pageViews += 1;
    if (event.type === "form_submit") item.leads += 1;
    sessions.set(key, item);
  });

  const sourceMap = new Map();
  sessions.forEach((session) => {
    const key = `${session.source}|${session.channel}|${session.platform}|${session.campaign}|${session.landingPage}`;
    const item = sourceMap.get(key) || {
      source: session.source,
      channel: session.channel,
      platform: session.platform,
      campaign: session.campaign,
      landingPage: session.landingPage,
      visitors: new Set(),
      sessions: 0,
      pageViews: 0,
      leads: 0
    };
    session.visitors.forEach((visitor) => item.visitors.add(visitor));
    item.sessions += session.sessions.size;
    item.pageViews += session.pageViews;
    item.leads += session.leads;
    sourceMap.set(key, item);
  });

  const sessionRows = [...sourceMap.values()].map((item) => ({
    ...item,
    visitors: item.visitors.size,
    conversionRate: item.sessions ? Number(((item.leads / item.sessions) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.pageViews - a.pageViews);

  const campaigns = sessionRows
    .filter((item) => item.campaign)
    .map((item) => ({
      utm_campaign: item.campaign,
      utm_source: item.source,
      utm_medium: item.channel,
      visitors: item.visitors,
      sessions: item.sessions,
      pageViews: item.pageViews,
      leads: item.leads,
      conversionRate: item.conversionRate
    }));

  return { session: sessionRows, campaigns };
}

export async function getAnalyticsSnapshot(range) {
  const all = await readAnalyticsEvents();
  const events = all.filter((event) => inRange(event, range));
  const pageViews = events.filter((event) => event.type === "page_view");
  const formEvents = events.filter((event) => event.type === "form_submit");
  const visitorNumbers = new Map([...new Set(all.map((event) => event.visitorId).filter(Boolean))].map((id, index) => [id, index + 1]));
  const sessionsByVisitor = visitorSessionStats(all);
  const journeys = new Map();
  pageViews.forEach((event) => {
    if (!event.previousPage) return;
    const key = `${event.previousPage} -> ${event.page}`;
    journeys.set(key, (journeys.get(key) || 0) + 1);
  });
  const pages = pageStats(events);

  return {
    rangeStart: range.startDate.toISOString(),
    rangeEnd: range.endDate.toISOString(),
    storageMode: getAnalyticsStorageMode(),
    overview: {
      pageViews: pageViews.length,
      uniqueVisitors: new Set(pageViews.map((event) => event.visitorId)).size,
      sessions: new Set(pageViews.map((event) => event.sessionId)).size,
      inquiries: formEvents.length,
      avgDuration: pageViews.length ? Math.round(pageViews.reduce((sum, event) => sum + Number(event.duration || 0), 0) / pageViews.length) : 0,
      bounceRate: calculateBounceRate(pageViews)
    },
    traffic: {
      series: series(events, range),
      channels: countBy(pageViews, "channel"),
      countries: countBy(pageViews, "country"),
      sourcePlatforms: countBy(pageViews, "sourcePlatform"),
      devices: countBy(pageViews, "device"),
      browsers: countBy(pageViews, "browser"),
      operatingSystems: countBy(pageViews, "os")
    },
    acquisition: acquisitionStats(events),
    visitors: pageViews.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100).map((event) => ({
      ...event,
      customerNumber: visitorNumbers.get(event.visitorId) || 0,
      visitDayNumber: sessionsByVisitor.get(event.visitorId)?.size || 1,
      customerType: (sessionsByVisitor.get(event.visitorId)?.size || 1) > 1 ? "Returning Customer" : "New Customer"
    })),
    pages,
    landingJourneys: pageViews.slice(0, 120).map((event) => ({
      ...event,
      customerNumber: visitorNumbers.get(event.visitorId) || 0,
      visitDayNumber: sessionsByVisitor.get(event.visitorId)?.size || 1,
      customerType: (sessionsByVisitor.get(event.visitorId)?.size || 1) > 1 ? "Returning Customer" : "New Customer"
    })),
    journeys: [...journeys.entries()].map(([route, value]) => ({ route, value })).sort((a, b) => b.value - a.value),
    searchConsole: {
      configured: Boolean(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL),
      overview: { clicks: 0, impressions: 0, ctr: 0, position: 0, indexedPages: 0, notIndexedPages: 0 },
      queries: [],
      pages: [],
      countries: [],
      devices: [],
      indexingStatus: []
    }
  };
}

export async function getSearchConsoleSnapshot(range) {
  return getGoogleSearchConsoleSnapshot(range);
}
