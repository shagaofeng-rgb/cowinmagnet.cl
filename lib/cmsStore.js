import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-cms") : path.join(process.cwd(), ".data");
const CMS_FILE = path.join(DATA_DIR, "cms-items.json");
const SCHEMA_LOCK_ID = 52402000;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const CMS_TABLE = `${TABLE_PREFIX}_cms_items`;

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

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isDatabaseConfigured()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000,
      statement_timeout: 2500,
      query_timeout: 2500
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
      CREATE TABLE IF NOT EXISTS ${CMS_TABLE} (
        id TEXT PRIMARY KEY,
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
    await safeSchemaQuery(client, `CREATE UNIQUE INDEX IF NOT EXISTS ${CMS_TABLE}_type_slug_idx ON ${CMS_TABLE} (type, slug)`);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${CMS_TABLE}_type_date_idx ON ${CMS_TABLE} (type, published_at DESC)`);
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
  const normalized = {
    ...item,
    id: item.id || `${item.type}-${item.slug}`,
    status: item.status || "published",
    createdAt: item.createdAt || now,
    updatedAt: now
  };

  const db = getPool();
  if (db) {
    await ensureSchema();
    await db.query(
      `
        INSERT INTO ${CMS_TABLE} (id, type, slug, title, category_id, category_title, payload, published_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (type, slug) DO UPDATE SET
          title = EXCLUDED.title,
          category_id = EXCLUDED.category_id,
          category_title = EXCLUDED.category_title,
          payload = EXCLUDED.payload,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at
      `,
      [
        normalized.id,
        normalized.type,
        normalized.slug,
        normalized.title,
        normalized.categoryId || "",
        normalized.categoryTitle || "",
        normalized,
        normalized.publishedAt || now,
        normalized.createdAt,
        normalized.updatedAt
      ]
    );
    return normalized;
  }

  const items = await readFileItems();
  const nextItems = items.filter((existing) => !(existing.type === normalized.type && existing.slug === normalized.slug));
  nextItems.push(normalized);
  await writeFileItems(nextItems);
  return normalized;
}

function visibleItems(items, includeInactive) {
  return includeInactive ? items : items.filter((item) => !["offline", "draft"].includes(item.status));
}

export async function getCmsItems(type, { includeInactive = false } = {}) {
  const db = getPool();
  if (db) {
    try {
      await ensureSchema();
      const result = await db.query(
        `SELECT payload FROM ${CMS_TABLE} WHERE type = $1 ORDER BY published_at DESC, created_at DESC`,
        [type]
      );
      return visibleItems(result.rows.map((row) => row.payload), includeInactive);
    } catch (error) {
      console.warn(`[cmsStore] Falling back to local CMS items for ${type}: ${error?.message || error}`);
    }
  }

  const items = await readFileItems();
  return visibleItems(items.filter((item) => item.type === type), includeInactive)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
}

export async function getCmsItem(type, slug, { includeInactive = true } = {}) {
  const items = await getCmsItems(type, { includeInactive });
  return items.find((item) => item.slug === slug) || null;
}

export async function updateCmsItemStatus(type, slug, status) {
  const db = getPool();
  if (db) {
    await ensureSchema();
    await db.query(
      `UPDATE ${CMS_TABLE} SET payload = jsonb_set(payload, '{status}', to_jsonb($3::text), true), updated_at = NOW() WHERE type = $1 AND slug = $2`,
      [type, slug, status]
    );
    return;
  }

  const items = await readFileItems();
  await writeFileItems(items.map((item) => (item.type === type && item.slug === slug ? { ...item, status, updatedAt: new Date().toISOString() } : item)));
}

export async function deleteCmsItem(type, slug) {
  const db = getPool();
  if (db) {
    await ensureSchema();
    await db.query(`DELETE FROM ${CMS_TABLE} WHERE type = $1 AND slug = $2`, [type, slug]);
    return;
  }

  const items = await readFileItems();
  await writeFileItems(items.filter((item) => !(item.type === type && item.slug === slug)));
}

export function cmsStorageMode() {
  return isDatabaseConfigured() ? "database" : "local-file";
}
