import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDatabasePool, withDatabaseRetry } from "./database.js";
const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-cms") : path.join(process.cwd(), ".data");
const ENQUIRY_FILE = path.join(DATA_DIR, "enquiries.json");
const SCHEMA_LOCK_ID = 52402002;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const ENQUIRIES_TABLE = `${TABLE_PREFIX}_enquiries`;
const ALLOW_RUNTIME_SCHEMA_MIGRATIONS = process.env.ALLOW_RUNTIME_SCHEMA_MIGRATIONS === "true";

let schemaReady = false;
let localWrites = Promise.resolve();

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
  if (!ALLOW_RUNTIME_SCHEMA_MIGRATIONS) {
    schemaReady = true;
    return;
  }
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
  const temporary = ENQUIRY_FILE + "." + randomUUID();
  await fs.writeFile(temporary, JSON.stringify(items, null, 2), "utf8");
  await fs.rename(temporary, ENQUIRY_FILE);
}

function withLocalEnquiryWrite(task) {
  const next = localWrites.then(task);
  localWrites = next.catch(() => {});
  return next;
}

export async function saveEnquiry(payload, { submissionId = "", rateKey = "", sendNow = false } = {}) {
  const now = new Date().toISOString();
  const notification = sendNow
    ? { status: "processing", attempts: 0, updatedAt: now, processingAt: now }
    : { status: "not_configured", attempts: 0, updatedAt: now };
  const id = submissionId ? "INQ-" + submissionId : "INQ-" + Date.now() + "-" + randomUUID().slice(0, 8);
  const item = { ...payload, rateKey, id, status: "New", createdAt: now, updatedAt: now, notification };
  const db = getPool();
  if (db) {
    return withDatabaseRetry(async () => {
      await ensureSchema();
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        if (rateKey) await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))", [rateKey]);
        const result = await client.query(
          `INSERT INTO ${ENQUIRIES_TABLE} (id, payload, status, created_at, updated_at)
           SELECT $1, $2::jsonb, $3, $4::timestamptz, $4::timestamptz
           WHERE $5::text = '' OR (
             SELECT count(*) FROM ${ENQUIRIES_TABLE}
             WHERE created_at >= $4::timestamptz - INTERVAL '15 minutes' AND payload->>'rateKey' = $5::text
           ) < 5
           ON CONFLICT (id) DO NOTHING
           RETURNING id`,
          [item.id, item, item.status, now, rateKey]
        );
        let outcome = { item, inserted: true, limited: false };
        if (!result.rowCount) {
          const existing = await client.query(
            `SELECT id, status, created_at FROM ${ENQUIRIES_TABLE} WHERE id = $1`,
            [item.id]
          );
          const row = existing.rows[0];
          outcome = row
            ? { item: { id: row.id, status: row.status, createdAt: new Date(row.created_at).toISOString() }, inserted: false, limited: false }
            : { item: null, inserted: false, limited: true };
        }
        await client.query("COMMIT");
        return outcome;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    }, { label: "enquiryStore.save" });
  }
  if (process.env.VERCEL_ENV === "production") throw new Error("Persistent enquiry storage is required.");
  return withLocalEnquiryWrite(async () => {
    const items = await readFileItems();
    const existing = items.find((row) => row.id === id);
    if (existing) return { item: existing, inserted: false, limited: false };
    const cutoff = Date.parse(now) - 15 * 60 * 1000;
    if (rateKey && items.filter((row) => row.rateKey === rateKey && Date.parse(row.createdAt) >= cutoff).length >= 5) {
      return { item: null, inserted: false, limited: true };
    }
    await writeFileItems([item, ...items]);
    return { item, inserted: true, limited: false };
  });
}

export async function updateEnquiryNotification(id, notification) {
  const now = new Date().toISOString();
  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await writeEnquiryNotification(db, id, { ...notification, updatedAt: now }, now);
    }, { label: "enquiryStore.notification" });
    return;
  }
  await withLocalEnquiryWrite(async () => {
    await writeFileItems((await readFileItems()).map((item) => item.id === id ? { ...item, notification: { ...notification, updatedAt: now }, updatedAt: now } : item));
  });
}

async function writeEnquiryNotification(db, id, notification, updatedAt) {
  await db.query(
    `UPDATE ${ENQUIRIES_TABLE}
     SET payload = jsonb_set(jsonb_set(payload, '{notification}', $2::jsonb, true), '{updatedAt}', to_jsonb($3::text), true),
         updated_at = $3::timestamptz
     WHERE id = $1`,
    [id, JSON.stringify(notification), updatedAt]
  );
}

export async function getPendingEnquiryNotifications({ limit = 10 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 25));
  const db = getPool();
  if (db) {
    // Claim records before sending. Without this transaction, overlapping cron
    // invocations can both read a pending enquiry and send duplicate emails.
    return withDatabaseRetry(async () => {
      await ensureSchema();
      const client = await db.connect();
      const now = new Date().toISOString();
      const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          `SELECT id, payload FROM ${ENQUIRIES_TABLE}
           WHERE COALESCE((payload->'notification'->>'attempts')::int, 0) < 5
             AND (
               COALESCE(payload->'notification'->>'status', 'pending') IN ('pending', 'failed', 'not_configured')
               OR (
                 payload->'notification'->>'status' = 'processing'
                 AND COALESCE(NULLIF(payload->'notification'->>'processingAt', '')::timestamptz, 'epoch'::timestamptz) < $2
               )
             )
           ORDER BY created_at ASC
           LIMIT $1
           FOR UPDATE SKIP LOCKED`,
          [safeLimit, staleBefore]
        );
        const claimed = [];
        for (const row of result.rows) {
          const notification = {
            ...(row.payload?.notification || {}),
            status: "processing",
            processingAt: now,
            updatedAt: now
          };
          await writeEnquiryNotification(client, row.id, notification, now);
          claimed.push({ ...row.payload, notification });
        }
        await client.query("COMMIT");
        return claimed;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    }, { label: "enquiryStore.notification-pending" });
  }
  return withLocalEnquiryWrite(async () => {
    const now = new Date().toISOString();
    const staleBefore = Date.parse(now) - 15 * 60 * 1000;
    const items = await readFileItems();
    const claimed = items.filter((item) => {
      const { status = "pending", attempts = 0, processingAt } = item.notification || {};
      return Number(attempts) < 5 && (
        ["pending", "failed", "not_configured"].includes(status) ||
        (status === "processing" && (Date.parse(processingAt) || 0) < staleBefore)
      );
    }).slice(0, safeLimit).map((item) => ({
      ...item, updatedAt: now,
      notification: { ...item.notification, status: "processing", processingAt: now, updatedAt: now }
    }));
    if (claimed.length) {
      const byId = new Map(claimed.map((item) => [item.id, item]));
      await writeFileItems(items.map((item) => byId.get(item.id) || item));
    }
    return claimed;
  });
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

export async function getEnquiryNotificationSummary() {
  const db = getPool();
  const rows = db ? (await withDatabaseRetry(async () => {
    await ensureSchema();
    return db.query(`
      SELECT COALESCE(payload #>> '{notification,status}', 'pending') AS status,
             COUNT(*)::int AS count, MAX(updated_at) AS latest
      FROM ${ENQUIRIES_TABLE}
      WHERE payload->>'isTest' IS DISTINCT FROM 'true'
      GROUP BY 1
    `);
  }, { label: "enquiryStore.notification-summary" })).rows
    : (await readFileItems()).filter((item) => !item.isTest).map((item) => ({
      status: item.notification?.status || "pending", count: 1, latest: item.notification?.updatedAt || item.createdAt
    }));
  const summary = { pending: 0, failed: 0, delivered: 0, latest: null };
  for (const row of rows) {
    const key = row.status === "delivered" ? "delivered" : row.status === "failed" ? "failed" : "pending";
    summary[key] += Number(row.count);
    if (row.latest && (!summary.latest || new Date(row.latest) > new Date(summary.latest))) summary.latest = new Date(row.latest).toISOString();
  }
  return summary;
}

export async function getEnquiryById(id) {
  if (typeof id !== "string" || !/^INQ-[a-z0-9-]{8,60}$/i.test(id)) return null;
  const db = getPool();
  if (!db) return (await readFileItems()).find((item) => item.id === id) || null;
  return withDatabaseRetry(async () => {
    await ensureSchema();
    const result = await db.query(`SELECT payload FROM ${ENQUIRIES_TABLE} WHERE id = $1`, [id]);
    return result.rows[0]?.payload || null;
  }, { label: "enquiryStore.detail" });
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
  const exactReceipt = /^INQ-[a-f0-9-]{36}$/i.test(normalizedQuery);
  const db = getPool();

  if (db) {
    return withDatabaseRetry(async () => {
      await ensureSchema();
      const values = [];
      const clauses = exactReceipt ? [] : ["payload->>'isTest' IS DISTINCT FROM 'true'"];
      if (normalizedStatus) {
        values.push(normalizedStatus);
        clauses.push(`status = $${values.length}`);
      }
      if (normalizedQuery) {
        values.push(`%${normalizedQuery}%`);
        clauses.push(exactReceipt ? `id ILIKE $${values.length}` : `payload::text ILIKE $${values.length}`);
        if (exactReceipt) values[values.length - 1] = normalizedQuery;
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
    .filter((item) => !item.isTest || (exactReceipt && item.id.toLowerCase() === normalizedQuery.toLowerCase()))
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
