import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { databaseSsl, databaseUrl, withDatabaseRetry } from "./database.js";

const { Pool } = pg;

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-cms") : path.join(process.cwd(), ".data");
const CMS_FILE = path.join(DATA_DIR, "cms-items.json");
const SCHEMA_LOCK_ID = 52402000;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const CMS_TABLE = `${TABLE_PREFIX}_cms_items`;
const DEFAULT_SITE_ID = process.env.DEFAULT_SITE_ID || "cowinmagnet_latam";
const CMS_SCHEMA_VERSION = "2026-08-news-id-v1";
const CMS_SYSTEM_SITE_ID = "__system__";

let pool;
let schemaReady = false;
const localLocks = new Set();

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

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isDatabaseConfigured()) return null;
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
      console.warn("[cmsStore] idle database connection error", error?.message || error);
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
    const marker = await client.query(
      `SELECT 1 FROM ${CMS_TABLE} WHERE site_id = $1 AND type = 'system-schema' AND slug = $2 LIMIT 1`,
      [CMS_SYSTEM_SITE_ID, CMS_SCHEMA_VERSION]
    ).catch((error) => {
      if (error?.code === "42P01") return { rows: [] };
      throw error;
    });
    if (marker.rows.length) {
      schemaReady = true;
      return;
    }
    await safeSchemaQuery(client, `
      CREATE TABLE IF NOT EXISTS ${CMS_TABLE} (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL DEFAULT '${DEFAULT_SITE_ID}',
        type TEXT NOT NULL,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        category_id TEXT,
        category_title TEXT,
        payload JSONB NOT NULL,
        published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `ALTER TABLE ${CMS_TABLE} ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT '${DEFAULT_SITE_ID}'`);
    // The original unique index made the same slug collide across independent sites.
    await safeSchemaQuery(client, `DROP INDEX IF EXISTS ${CMS_TABLE}_type_slug_idx`);
    await safeSchemaQuery(client, `CREATE UNIQUE INDEX IF NOT EXISTS ${CMS_TABLE}_site_type_slug_idx ON ${CMS_TABLE} (site_id, type, slug)`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${CMS_TABLE}_site_type_date_idx ON ${CMS_TABLE} (site_id, type, published_at DESC)`);
    // A legacy News publication could retain its candidate id after changing
    // content type. Repair only that malformed internal id pattern so future
    // candidate upserts do not collide with a published article.
    await client.query(`
      UPDATE ${CMS_TABLE} AS item
      SET id = item.site_id || '-news-' || item.slug,
          updated_at = NOW()
      WHERE item.type = 'news'
        AND item.id LIKE item.site_id || '-news-candidate-%'
        AND NOT EXISTS (
          SELECT 1 FROM ${CMS_TABLE} AS existing
          WHERE existing.id = item.site_id || '-news-' || item.slug
      )
    `);
    await client.query(
      `INSERT INTO ${CMS_TABLE} (id, site_id, type, slug, title, category_id, category_title, payload, published_at, created_at, updated_at)
       VALUES ($1, $2, 'system-schema', $3, 'CMS schema marker', '', '', $4, NOW(), NOW(), NOW())
       ON CONFLICT (site_id, type, slug) DO UPDATE SET updated_at = NOW()`,
      [`${CMS_SYSTEM_SITE_ID}-system-schema-${CMS_SCHEMA_VERSION}`, CMS_SYSTEM_SITE_ID, CMS_SCHEMA_VERSION, { schemaVersion: CMS_SCHEMA_VERSION }]
    );
    schemaReady = true;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_ID]).catch(() => {});
    client.release();
  }
}

async function readFileItems() {
  try {
    const text = await fs.readFile(CMS_FILE, "utf8");
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeFileItems(items) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CMS_FILE, JSON.stringify(items, null, 2), "utf8");
}

export function slugify(value = "") {
  return String(value).toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

export function parseLines(value = "") {
  return String(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function parseSpecifications(value = "") {
  return parseLines(value).map((line) => {
    const parts = line.split(/[:：]/);
    if (parts.length < 2) return { label: "Specification", value: line.trim(), unit: "", group: "General" };
    return { label: parts.shift().trim(), value: parts.join(":").trim(), unit: "", group: "General" };
  });
}

export async function fileToDataUrl(file) {
  if (!file || !file.size) return "";
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

export async function saveCmsItem(item) {
  const now = new Date().toISOString();
  const siteId = item.siteId || DEFAULT_SITE_ID;
  const expectedIdPrefix = `${siteId}-${item.type}-`;
  const normalized = {
    ...item,
    siteId,
    // Preserve an id only when it belongs to this site and this content type.
    // A News article composed from a candidate must receive a News id, not the
    // candidate id it inherited in memory.
    id: String(item.id || "").startsWith(expectedIdPrefix) ? item.id : `${siteId}-${item.type}-${item.slug}`,
    status: item.status || "published",
    createdAt: item.createdAt || now,
    updatedAt: now
  };

  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      const values = [
        normalized.id,
        normalized.siteId,
        normalized.type,
        normalized.slug,
        normalized.title,
        normalized.categoryId || "",
        normalized.categoryTitle || "",
        normalized,
        normalized.publishedAt || now,
        normalized.createdAt,
        normalized.updatedAt
      ];
      const updateValues = [
        normalized.id,
        normalized.siteId,
        normalized.type,
        normalized.slug,
        normalized.title,
        normalized.categoryId || "",
        normalized.categoryTitle || "",
        normalized,
        normalized.publishedAt || now,
        normalized.updatedAt
      ];
      const existing = await db.query(
        `
          UPDATE ${CMS_TABLE}
          SET title = $5,
              category_id = $6,
              category_title = $7,
              payload = $8,
              published_at = $9,
              updated_at = $10
          WHERE (id = $1 AND site_id = $2 AND type = $3)
             OR (site_id = $2 AND type = $3 AND slug = $4)
          RETURNING id
        `,
        updateValues
      );
      if (existing.rowCount) return;
      await db.query(
        `
        INSERT INTO ${CMS_TABLE} (id, site_id, type, slug, title, category_id, category_title, payload, published_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (site_id, type, slug) DO UPDATE SET
          title = EXCLUDED.title,
          category_id = EXCLUDED.category_id,
          category_title = EXCLUDED.category_title,
          payload = EXCLUDED.payload,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at
      `,
      values
      );
    }, { label: "cmsStore.save" });
    return normalized;
  }

  const items = await readFileItems();
  const nextItems = items.filter((existing) => !((existing.siteId || DEFAULT_SITE_ID) === normalized.siteId && existing.type === normalized.type && existing.slug === normalized.slug));
  nextItems.push(normalized);
  await writeFileItems(nextItems);
  return normalized;
}

function visibleItems(items, includeInactive) {
  return includeInactive ? items : items.filter((item) => !["offline", "draft"].includes(item.status));
}

export async function getCmsItems(type, { includeInactive = false, siteId = DEFAULT_SITE_ID } = {}) {
  const db = getPool();
  if (db) {
    try {
      const result = await withDatabaseRetry(async () => {
        await ensureSchema();
        return db.query(
          `SELECT payload FROM ${CMS_TABLE} WHERE type = $1 AND site_id = $2 ORDER BY published_at DESC, created_at DESC`,
          [type, siteId]
        );
      }, { label: `cmsStore.read.${type}` });
      return visibleItems(result.rows.map((row) => row.payload), includeInactive);
    } catch (error) {
      if (process.env.NODE_ENV === "production" || process.env.VERCEL) throw error;
      console.warn(`[cmsStore] Falling back to local CMS items for ${type}: ${error?.message || error}`);
    }
  }

  const items = await readFileItems();
  return visibleItems(items.filter((item) => item.type === type && (item.siteId || DEFAULT_SITE_ID) === siteId), includeInactive)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
}

export async function getCmsItem(type, slug, { includeInactive = true, siteId = DEFAULT_SITE_ID } = {}) {
  const items = await getCmsItems(type, { includeInactive, siteId });
  return items.find((item) => item.slug === slug) || null;
}

export async function updateCmsItemStatus(type, slug, status, { siteId = DEFAULT_SITE_ID } = {}) {
  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await db.query(
        `UPDATE ${CMS_TABLE} SET payload = jsonb_set(payload, '{status}', to_jsonb($3::text), true), updated_at = NOW() WHERE type = $1 AND slug = $2 AND site_id = $4`,
        [type, slug, status, siteId]
      );
    }, { label: "cmsStore.status" });
    return;
  }

  const items = await readFileItems();
  await writeFileItems(items.map((item) => (item.type === type && item.slug === slug && (item.siteId || DEFAULT_SITE_ID) === siteId ? { ...item, status, updatedAt: new Date().toISOString() } : item)));
}

export async function deleteCmsItem(type, slug, { siteId = DEFAULT_SITE_ID } = {}) {
  const db = getPool();
  if (db) {
    await withDatabaseRetry(async () => {
      await ensureSchema();
      await db.query(`DELETE FROM ${CMS_TABLE} WHERE type = $1 AND slug = $2 AND site_id = $3`, [type, slug, siteId]);
    }, { label: "cmsStore.delete" });
    return;
  }

  const items = await readFileItems();
  await writeFileItems(items.filter((item) => !(item.type === type && item.slug === slug && (item.siteId || DEFAULT_SITE_ID) === siteId)));
}

export async function withCmsAdvisoryLock(name, task) {
  const db = getPool();
  if (!db) {
    if (localLocks.has(name)) return { locked: true };
    localLocks.add(name);
    try {
      return await task();
    } finally {
      localLocks.delete(name);
    }
  }

  return withDatabaseRetry(async () => {
    await ensureSchema();
    const client = await db.connect();
    let acquired = false;
    try {
      const lock = await client.query("SELECT pg_try_advisory_lock(hashtext($1)) AS locked", [name]);
      acquired = Boolean(lock.rows[0]?.locked);
      if (!acquired) return { locked: true };
      return await task();
    } finally {
      if (acquired) await client.query("SELECT pg_advisory_unlock(hashtext($1))", [name]).catch(() => {});
      client.release();
    }
  }, { label: `cmsStore.lock.${name}` });
}

export function cmsStorageMode() {
  return isDatabaseConfigured() ? "database" : "local-file";
}
