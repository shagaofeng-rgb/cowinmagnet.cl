import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { databaseSsl, databaseUrl } from "./database.js";

const { Pool } = pg;

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-latam-admin") : path.join(process.cwd(), ".data");
const ADMIN_FILE = path.join(DATA_DIR, "admin-auth.json");
const HASH_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };
const SCHEMA_LOCK_ID = 52402001;
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const ADMIN_TABLE = `${TABLE_PREFIX}_admin_accounts`;
const RESET_TABLE = `${TABLE_PREFIX}_admin_password_resets`;

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
      max: 3
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
      CREATE TABLE IF NOT EXISTS ${ADMIN_TABLE} (
        email TEXT PRIMARY KEY,
        name TEXT,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `
      CREATE TABLE IF NOT EXISTS ${RESET_TABLE} (
        token_hash TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await safeSchemaQuery(client, `CREATE INDEX IF NOT EXISTS ${RESET_TABLE}_email_idx ON ${RESET_TABLE} (email, created_at DESC)`);
    schemaReady = true;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_ID]).catch(() => {});
    client.release();
  }
}

async function readFileState() {
  try {
    const text = await fs.readFile(ADMIN_FILE, "utf8");
    const data = JSON.parse(text);
    return {
      accounts: Array.isArray(data.accounts) ? data.accounts : [],
      passwordResets: Array.isArray(data.passwordResets) ? data.passwordResets : []
    };
  } catch {
    return { accounts: [], passwordResets: [] };
  }
}

async function writeFileState(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ADMIN_FILE, JSON.stringify(state, null, 2), "utf8");
}

export function normalizeAdminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function getConfiguredAdminEmail() {
  return normalizeAdminEmail(process.env.ADMIN_EMAIL || "davidsha@cowinmagnet.com");
}

export function isConfiguredAdminEmail(email) {
  return normalizeAdminEmail(email) === getConfiguredAdminEmail();
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(String(password), salt, HASH_PARAMS.keylen, HASH_PARAMS).toString("base64url");
  return `scrypt$${HASH_PARAMS.N}$${HASH_PARAMS.r}$${HASH_PARAMS.p}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.startsWith("scrypt$")) return false;
  const [, n, r, p, salt, expected] = storedHash.split("$");
  const actual = crypto.scryptSync(String(password), salt, Buffer.from(expected, "base64url").length, {
    N: Number(n),
    r: Number(r),
    p: Number(p)
  }).toString("base64url");
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function passwordMeetsPolicy(password) {
  const value = String(password || "");
  return value.length >= 10 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export async function getStoredAdminAccount(email = getConfiguredAdminEmail()) {
  const normalizedEmail = normalizeAdminEmail(email);
  const db = getPool();
  if (db) {
    await ensureSchema();
    const result = await db.query(`SELECT email, name, password_hash FROM ${ADMIN_TABLE} WHERE email = $1`, [normalizedEmail]);
    return result.rows[0] || null;
  }
  const state = await readFileState();
  return state.accounts.find((account) => normalizeAdminEmail(account.email) === normalizedEmail) || null;
}

export async function upsertStoredAdminPassword({ email = getConfiguredAdminEmail(), name = process.env.ADMIN_NAME || "Administrator", password }) {
  const normalizedEmail = normalizeAdminEmail(email);
  const passwordHash = hashPassword(password);
  const db = getPool();
  if (db) {
    await ensureSchema();
    await db.query(
      `INSERT INTO ${ADMIN_TABLE} (email, name, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
      [normalizedEmail, name, passwordHash]
    );
    return { email: normalizedEmail, name, passwordHash };
  }
  const state = await readFileState();
  const accounts = state.accounts.filter((account) => normalizeAdminEmail(account.email) !== normalizedEmail);
  accounts.push({ email: normalizedEmail, name, passwordHash, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  await writeFileState({ ...state, accounts });
  return { email: normalizedEmail, name, passwordHash };
}

export async function verifyStoredAdminPassword(email, password) {
  const account = await getStoredAdminAccount(email);
  if (!account) return false;
  return verifyPassword(password, account.password_hash || account.passwordHash);
}

export function adminAccountStorageMode() {
  return process.env.DATABASE_URL ? "database" : "local-file";
}

export async function createPasswordReset(email = getConfiguredAdminEmail()) {
  const normalizedEmail = normalizeAdminEmail(email);
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const db = getPool();

  if (db) {
    await ensureSchema();
    await db.query(
      `INSERT INTO ${RESET_TABLE} (token_hash, email, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [tokenHash, normalizedEmail, expiresAt]
    );
    return { token, email: normalizedEmail, expiresAt };
  }

  const state = await readFileState();
  const now = Date.now();
  const passwordResets = state.passwordResets
    .filter((item) => !item.usedAt && new Date(item.expiresAt).getTime() > now)
    .concat({ tokenHash, email: normalizedEmail, expiresAt, createdAt: new Date().toISOString() });
  await writeFileState({ ...state, passwordResets });
  return { token, email: normalizedEmail, expiresAt };
}

export async function consumePasswordResetToken(token) {
  const tokenHash = hashToken(token);
  const db = getPool();

  if (db) {
    await ensureSchema();
    const result = await db.query(
      `SELECT email, expires_at, used_at FROM ${RESET_TABLE} WHERE token_hash = $1`,
      [tokenHash]
    );
    const reset = result.rows[0];
    if (!reset || reset.used_at || new Date(reset.expires_at).getTime() <= Date.now()) return null;
    await db.query(`UPDATE ${RESET_TABLE} SET used_at = NOW() WHERE token_hash = $1`, [tokenHash]);
    return { email: normalizeAdminEmail(reset.email) };
  }

  const state = await readFileState();
  const reset = state.passwordResets.find((item) => item.tokenHash === tokenHash);
  if (!reset || reset.usedAt || new Date(reset.expiresAt).getTime() <= Date.now()) return null;
  await writeFileState({
    ...state,
    passwordResets: state.passwordResets.map((item) => item.tokenHash === tokenHash ? { ...item, usedAt: new Date().toISOString() } : item)
  });
  return { email: normalizeAdminEmail(reset.email) };
}
