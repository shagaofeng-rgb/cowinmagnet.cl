import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { databaseSsl, databaseUrl, withDatabaseRetry } from "./database.js";

const { Pool } = pg;
const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-cms") : path.join(process.cwd(), ".data");
const ENQUIRY_FILE = path.join(DATA_DIR, "enquiries.json");
const SCHEMA_LOCK_ID = 52402002;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const ENQUIRIES_TABLE = `${TABLE_PREFIX}_enquiries`;

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
      console.warn("[enquiryStore] idle database connection error", error?.message || error);
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
      CREATE TABLE IF NOT EXISTS ${ENQUIRIES_TABLE} (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'New',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ENQUIRIES_TABLE}_status_date_idx ON ${ENQUIRIES_TABLE} (status, created_at DESC)`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${ENQUIRIES_TABLE}_visitor_date_idx ON ${ENQUIRIES_TABLE} ((payload->>'visitorId'), created_at DESC)`);
    schemaReady = true;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_ID]).catch(() => {});
    client.release();
  }
}

async function readFileItems() {
  try {
    const text = await fs.readFile(ENQUIRY_FILE, "utf8");
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeFileItems(items) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ENQUIRY_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function saveEnquiry(payload) {
  const now = new Date().toISOString();
  const item = { id: `INQ-${Date.now()}-${randomUUID().slice(0, 8)}`, status: "New", createdAt: now, updatedAt: now, ...payload };
  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await db.query(
      `INSERT INTO ${ENQUIRIES_TABLE} (id, payload, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [item.id, item, item.status, item.createdAt, item.updatedAt]
      );
    }, { label: "enquiryStore.save" });
    return item;
  }
  const items = await readFileItems();
  items.unshift(item);
  await writeFileItems(items);
  return item;
}

export async function getEnquiries() {
  const db = getPool();
  if (db) {
    const result = await withDatabaseRetry(async () => {
      await ensureSchema();
      return db.query(`SELECT payload FROM ${ENQUIRIES_TABLE} ORDER BY created_at DESC LIMIT 500`);
    }, { label: "enquiryStore.read" });
    return result.rows.map((row) => row.payload);
  }
  return readFileItems();
}

function normalizePage(value, fallback = 1) {
  const parsed = Number.parseInt(String(value || fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePageSize(value, fallback = 25) {
  const parsed = Number.parseInt(String(value || fallback), 10);
  return [25, 50, 100].includes(parsed) ? parsed : fallback;
}

function enquiryMatches(item, { status, query, range }) {
  if (status && item.status !== status) return false;
  if (query) {
    const haystack = [item.id, item.name, item.company, item.country, item.email, item.product, item.productRequirement]
      .filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(query.toLowerCase())) return false;
  }
  if (range?.startDate && range?.endDate) {
    const createdAt = new Date(item.createdAt || item.submittedAt || 0);
    if (Number.isNaN(createdAt.getTime()) || createdAt < range.startDate || createdAt > range.endDate) return false;
  }
  return true;
}

export async function getEnquiriesPage({ status = "", query = "", range, page = 1, pageSize = 25 } = {}) {
  const safePageSize = normalizePageSize(pageSize);
  const safePage = normalizePage(page);
  const normalizedStatus = String(status || "").trim().slice(0, 40);
  const normalizedQuery = String(query || "").trim().slice(0, 120);
  const db = getPool();

  if (db) {
    return withDatabaseRetry(async () => {
      await ensureSchema();
      const values = [];
      const clauses = [];
      if (normalizedStatus) {
        values.push(normalizedStatus);
        clauses.push(`status = $${values.length}`);
      }
      if (normalizedQuery) {
        values.push(`%${normalizedQuery}%`);
        clauses.push(`payload::text ILIKE $${values.length}`);
      }
      if (range?.startDate && range?.endDate) {
        values.push(range.startDate.toISOString(), range.endDate.toISOString());
        clauses.push(`created_at >= $${values.length - 1} AND created_at <= $${values.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const count = await db.query(`SELECT COUNT(*)::int AS total FROM ${ENQUIRIES_TABLE} ${where}`, values);
      const total = Number(count.rows[0]?.total || 0);
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const currentPage = Math.min(safePage, totalPages);
      values.push(safePageSize, (currentPage - 1) * safePageSize);
      const result = await db.query(`SELECT payload FROM ${ENQUIRIES_TABLE} ${where} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
      return { items: result.rows.map((row) => row.payload), meta: { page: currentPage, pageSize: safePageSize, total, totalPages } };
    }, { label: "enquiryStore.read-page" });
  }

  const items = (await readFileItems())
    .filter((item) => enquiryMatches(item, { status: normalizedStatus, query: normalizedQuery, range }))
    .sort((a, b) => new Date(b.createdAt || b.submittedAt || 0) - new Date(a.createdAt || a.submittedAt || 0));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  return { items: items.slice((currentPage - 1) * safePageSize, currentPage * safePageSize), meta: { page: currentPage, pageSize: safePageSize, total, totalPages } };
}

export async function getEnquiriesForVisitor(visitorId) {
  const normalizedVisitorId = String(visitorId || "").trim().slice(0, 80);
  if (!normalizedVisitorId) return [];
  const db = getPool();
  if (db) {
    const result = await withDatabaseRetry(async () => {
      await ensureSchema();
      return db.query(`SELECT payload FROM ${ENQUIRIES_TABLE} WHERE payload->>'visitorId' = $1 ORDER BY created_at DESC`, [normalizedVisitorId]);
    }, { label: "enquiryStore.read-visitor" });
    return result.rows.map((row) => row.payload);
  }
  return (await readFileItems()).filter((item) => item.visitorId === normalizedVisitorId);
}

export function enquiryStorageMode() {
  return process.env.DATABASE_URL ? "database" : "local-file";
}
