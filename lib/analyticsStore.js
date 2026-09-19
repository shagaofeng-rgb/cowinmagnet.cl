import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { getDatabasePool, withDatabaseRetry } from "./database.js";
import { getGoogleSearchConsoleSnapshot } from "./googleSearchConsole.js";
import { ANALYTICS_TIMEZONE, classifyTraffic, classifyVisitor, hashIp, maskIp } from "./analyticsPolicy.js";

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-analytics") : path.join(process.cwd(), ".data");
const EVENT_FILE = path.join(DATA_DIR, "analytics-events.json");
const SYNC_FILE = path.join(DATA_DIR, "analytics-sync-runs.json");
const SCHEMA_LOCK_ID = 52402003;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const ANALYTICS_TABLE = `${TABLE_PREFIX}_analytics_events`;
const ANALYTICS_SYNC_TABLE = `${TABLE_PREFIX}_analytics_sync_runs`;

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
  return getDatabasePool();
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
        session_id TEXT,
        page TEXT,
        country TEXT,
        channel TEXT,
        ip_hash TEXT,
        is_excluded BOOLEAN NOT NULL DEFAULT FALSE,
        exclusion_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_TABLE}_type_date_idx ON ${ANALYTICS_TABLE} (type, created_at DESC)`);
    await safeSchemaQuery(client, `ALTER TABLE ${ANALYTICS_TABLE} ADD COLUMN IF NOT EXISTS session_id TEXT`);
    await safeSchemaQuery(client, `ALTER TABLE ${ANALYTICS_TABLE} ADD COLUMN IF NOT EXISTS channel TEXT`);
    await safeSchemaQuery(client, `ALTER TABLE ${ANALYTICS_TABLE} ADD COLUMN IF NOT EXISTS ip_hash TEXT`);
    await safeSchemaQuery(client, `ALTER TABLE ${ANALYTICS_TABLE} ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN NOT NULL DEFAULT FALSE`);
    await safeSchemaQuery(client, `ALTER TABLE ${ANALYTICS_TABLE} ADD COLUMN IF NOT EXISTS exclusion_reason TEXT`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_TABLE}_active_date_idx ON ${ANALYTICS_TABLE} (is_excluded, created_at DESC)`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_TABLE}_visitor_date_idx ON ${ANALYTICS_TABLE} (visitor_id, created_at DESC)`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_TABLE}_active_visitor_date_idx ON ${ANALYTICS_TABLE} (is_excluded, visitor_id, created_at DESC)`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ANALYTICS_TABLE}_session_date_idx ON ${ANALYTICS_TABLE} (session_id, created_at DESC)`);
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
  const exclusion = payload.exclusion || classifyTraffic({
    userAgent: payload.userAgent,
    host: payload.host,
    referrer: payload.referrer,
    page: payload.page,
    isTest: payload.isTest
  });
  const ip = String(payload.ip || "");
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
    ipMasked: maskIp(ip),
    ipHash: hashIp(ip),
    verified: payload.verified !== false,
    isExcluded: Boolean(exclusion.excluded),
    exclusionReason: exclusion.reason || "",
    duration: Number(payload.duration || 0),
    timestamp: payload.timestamp || new Date().toISOString()
  };

  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await db.query(
      `INSERT INTO ${ANALYTICS_TABLE} (id, payload, type, visitor_id, session_id, page, country, channel, ip_hash, is_excluded, exclusion_reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [event.id, event, event.type, event.visitorId, event.sessionId, event.page, event.country, event.channel, event.ipHash, event.isExcluded, event.exclusionReason, event.timestamp]
      );
    }, { label: "analyticsStore.append" });
    return { ok: true, storageMode: "database", excluded: event.isExcluded, exclusionReason: event.exclusionReason };
  }

  const events = await readFileEvents();
  events.push(event);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(EVENT_FILE, JSON.stringify(events.slice(-5000), null, 2), "utf8");
  return { ok: true, storageMode: "local-file", excluded: event.isExcluded, exclusionReason: event.exclusionReason };
}

function normalizeEvent(event = {}) {
  const ip = event.ip || "";
  const hasStoredExclusionDecision = Object.prototype.hasOwnProperty.call(event, "isExcluded");
  const legacyExclusion = hasStoredExclusionDecision
    ? null
    : classifyTraffic({
        userAgent: event.userAgent,
        host: event.host,
        referrer: event.referrer,
        page: event.page,
        isTest: event.isTest
      });
  return {
    ...event,
    ipMasked: event.ipMasked || maskIp(ip),
    ipHash: event.ipHash || hashIp(ip),
    isExcluded: Boolean(event.isExcluded || legacyExclusion?.excluded),
    exclusionReason: event.exclusionReason || legacyExclusion?.reason || ""
  };
}

async function readAnalyticsEvents({ range, visitorId = "", includeExcluded = false } = {}) {
  const db = getPool();
  if (db) {
    const result = await withDatabaseRetry(async () => {
      await ensureSchema();
      const clauses = ["1 = 1"];
      const values = [];
      if (range?.startDate) { values.push(range.startDate); clauses.push(`created_at >= $${values.length}`); }
      if (range?.endDate) { values.push(range.endDate); clauses.push(`created_at <= $${values.length}`); }
      if (visitorId) { values.push(visitorId); clauses.push(`visitor_id = $${values.length}`); }
      if (!includeExcluded) clauses.push("is_excluded = FALSE");
      return db.query(`SELECT payload, is_excluded, exclusion_reason FROM ${ANALYTICS_TABLE} WHERE ${clauses.join(" AND ")} ORDER BY created_at ASC`, values);
    }, { label: "analyticsStore.read" });
    return result.rows
      .map((row) => normalizeEvent({ ...row.payload, isExcluded: row.payload?.isExcluded ?? row.is_excluded, exclusionReason: row.payload?.exclusionReason || row.exclusion_reason || "" }))
      .filter((event) => !isSampleEvent(event));
  }
  return (await readFileEvents()).map(normalizeEvent).filter((event) => {
    if (!includeExcluded && event.isExcluded) return false;
    if (visitorId && event.visitorId !== visitorId) return false;
    return !range || inRange(event, range);
  });
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

function eventMatchesFilters(event, filters) {
  if (filters.country && event.country !== filters.country) return false;
  if (filters.channel && event.channel !== filters.channel) return false;
  if (filters.device && event.device !== filters.device) return false;
  if (filters.query) {
    const haystack = [event.page, event.pageTitle, event.country, event.sourcePlatform, event.ipMasked].join(" ").toLowerCase();
    if (!haystack.includes(filters.query)) return false;
  }
  return true;
}

function paginate(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  return {
    rows: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    meta: { page: currentPage, pageSize, total, totalPages }
  };
}

function stableCustomerId(visitorId) {
  return `C-${createHash("sha256").update(String(visitorId || "anonymous")).digest("hex").slice(0, 8).toUpperCase()}`;
}

function visitorRows(events, allEvents, filters) {
  const grouped = new Map();
  const allSessions = visitorSessionStats(allEvents);
  events.filter((event) => event.type === "page_view" || event.type === "form_submit").forEach((event) => {
    const key = event.visitorId || event.id;
    const item = grouped.get(key) || {
      visitorId: key,
      sessions: new Set(),
      pages: new Set(),
      countries: new Set(),
      firstSeen: event.timestamp,
      lastSeen: event.timestamp,
      lastPage: event.page || "/",
      source: event.sourcePlatform || event.channel || "Direct",
      channel: event.channel || "Direct",
      device: event.device || "-",
      browser: event.browser || "-",
      ipMasked: event.ipMasked || "-",
      lead: false
    };
    item.sessions.add(event.sessionId || event.id);
    if (event.page) item.pages.add(event.page);
    if (event.country) item.countries.add(event.country);
    if (event.type === "form_submit") item.lead = true;
    if (new Date(event.timestamp) < new Date(item.firstSeen)) item.firstSeen = event.timestamp;
    if (new Date(event.timestamp) >= new Date(item.lastSeen)) {
      item.lastSeen = event.timestamp;
      item.lastPage = event.page || item.lastPage;
      item.source = event.sourcePlatform || event.channel || item.source;
      item.channel = event.channel || item.channel;
      item.device = event.device || item.device;
      item.browser = event.browser || item.browser;
      item.ipMasked = event.ipMasked || item.ipMasked;
    }
    grouped.set(key, item);
  });

  const rows = [...grouped.values()].map((item, index) => {
    const visits = allSessions.get(item.visitorId)?.size || item.sessions.size || 1;
    const type = classifyVisitor({ sessions: visits, pageCount: item.pages.size, isLead: item.lead, source: item.source });
    return {
      customerNumber: index + 1,
      customerId: stableCustomerId(item.visitorId),
      customerType: type,
      visitCount: visits,
      sessionCount: item.sessions.size,
      pageCount: item.pages.size,
      pages: [...item.pages],
      country: [...item.countries][0] || "Unknown",
      ...item
    };
  }).filter((item) => !filters.visitorType || item.customerType === filters.visitorType);

  const multiplier = filters.order === "asc" ? 1 : -1;
  rows.sort((a, b) => (new Date(a[filters.sort] || a.lastSeen).getTime() - new Date(b[filters.sort] || b.lastSeen).getTime()) * multiplier);
  return paginate(rows, filters.page, filters.pageSize);
}

export async function getAnalyticsSnapshot(range, filters = {}) {
  const active = await readAnalyticsEvents({ range, includeExcluded: Boolean(filters.includeExcluded) });
  const events = active.filter((event) => eventMatchesFilters(event, filters));
  const pageViews = events.filter((event) => event.type === "page_view");
  const formEvents = events.filter((event) => event.type === "form_submit");
  const visitorNumbers = new Map([...new Set(active.map((event) => event.visitorId).filter(Boolean))].map((id, index) => [id, index + 1]));
  const sessionsByVisitor = visitorSessionStats(active);
  const pagedVisitors = visitorRows(events, active, filters);
  const journeys = new Map();
  pageViews.forEach((event) => {
    if (!event.previousPage) return;
    const key = `${event.previousPage} -> ${event.page}`;
    journeys.set(key, (journeys.get(key) || 0) + 1);
  });
  const allPages = pageStats(events);
  const pagedPages = paginate(allPages, filters.page, filters.pageSize);
  const allJourneys = [...journeys.entries()].map(([route, value]) => ({ route, value })).sort((a, b) => b.value - a.value);
  const pagedJourneys = paginate(allJourneys, filters.page, filters.pageSize);
  const allAcquisition = acquisitionStats(events);
  const pagedAcquisition = paginate(allAcquisition.session, filters.page, filters.pageSize);

  return {
    rangeStart: range.startDate.toISOString(),
    rangeEnd: range.endDate.toISOString(),
    storageMode: getAnalyticsStorageMode(),
    timezone: ANALYTICS_TIMEZONE,
    filters,
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
    acquisition: { ...allAcquisition, session: pagedAcquisition.rows },
    acquisitionMeta: pagedAcquisition.meta,
    visitors: pagedVisitors.rows,
    visitorMeta: pagedVisitors.meta,
    pages: pagedPages.rows,
    pageMeta: pagedPages.meta,
    topPages: allPages.slice(0, 8),
    landingJourneys: pageViews.slice(0, 120).map((event) => ({
      ...event,
      customerNumber: visitorNumbers.get(event.visitorId) || 0,
      visitDayNumber: sessionsByVisitor.get(event.visitorId)?.size || 1,
      customerType: (sessionsByVisitor.get(event.visitorId)?.size || 1) > 1 ? "Returning Customer" : "New Customer"
    })),
    journeys: pagedJourneys.rows,
    journeyMeta: pagedJourneys.meta,
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

export async function getVisitorDetail(visitorId, range, { page = 1, pageSize = 25 } = {}) {
  const active = (await readAnalyticsEvents({ range, visitorId })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const sessions = new Map();
  active.forEach((event) => {
    const key = event.sessionId || event.id;
    const session = sessions.get(key) || { sessionId: key, startedAt: event.timestamp, endedAt: event.timestamp, source: event.sourcePlatform || event.channel || "Direct", channel: event.channel || "Direct", country: event.country || "Unknown", device: event.device || "-", events: [] };
    session.events.push(event);
    session.endedAt = event.timestamp;
    sessions.set(key, session);
  });
  const rows = [...sessions.values()].sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()).map((session) => ({
    ...session,
    pages: session.events.filter((event) => event.type === "page_view").map((event) => ({ page: event.page, title: event.pageTitle, timestamp: event.timestamp })),
    enquirySubmitted: session.events.some((event) => event.type === "form_submit")
  }));
  const paged = paginate(rows, page, pageSize);
  const first = active[0] || null;
  const last = active[active.length - 1] || null;
  return {
    customerId: stableCustomerId(visitorId),
    visitorId,
    firstSeen: first?.timestamp || null,
    lastSeen: last?.timestamp || null,
    sessionCount: rows.length,
    pageViewCount: active.filter((event) => event.type === "page_view").length,
    lead: active.some((event) => event.type === "form_submit"),
    sessions: paged.rows,
    meta: paged.meta
  };
}

export async function getSearchConsoleSnapshot(range) {
  return getGoogleSearchConsoleSnapshot(range);
}
