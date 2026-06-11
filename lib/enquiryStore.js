import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-cms") : path.join(process.cwd(), ".data");
const ENQUIRY_FILE = path.join(DATA_DIR, "enquiries.json");
const SCHEMA_LOCK_ID = 52402002;

let pool;
let schemaReady = false;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'New',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query("CREATE INDEX IF NOT EXISTS enquiries_status_date_idx ON enquiries (status, created_at DESC)");
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
  const item = { id: `INQ-${Date.now()}`, status: "New", createdAt: now, updatedAt: now, ...payload };
  const db = getPool();
  if (db) {
    await ensureSchema();
    await db.query(
      `INSERT INTO enquiries (id, payload, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, status = EXCLUDED.status, updated_at = NOW()`,
      [item.id, item, item.status, item.createdAt, item.updatedAt]
    );
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
    await ensureSchema();
    const result = await db.query("SELECT payload FROM enquiries ORDER BY created_at DESC LIMIT 500");
    return result.rows.map((row) => row.payload);
  }
  return readFileItems();
}

export function enquiryStorageMode() {
  return process.env.DATABASE_URL ? "database" : "local-file";
}
