import pg from "pg";

const { Pool } = pg;

const GLOBAL_POOL_KEY = "__cowinmagnetLatamDatabasePool";
const poolMax = Math.max(1, Math.min(Number.parseInt(process.env.DATABASE_POOL_MAX || "1", 10) || 1, 2));

export function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return "";
  if (raw.includes("localhost")) return raw;

  try {
    const url = new URL(raw);
    const mode = url.searchParams.get("sslmode");
    if (["prefer", "require", "verify-ca"].includes(String(mode).toLowerCase())) {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return raw.replace(/([?&]sslmode=)(prefer|require|verify-ca)\b/i, "$1verify-full");
  }
}

export function databaseSsl() {
  const raw = process.env.DATABASE_URL || "";
  return raw.includes("localhost") ? false : { rejectUnauthorized: false };
}

// A serverless instance can load the CMS, analytics and enquiry modules in one
// request. Keeping a separate pool in every module multiplied connections and
// caused the database's connection limit to be reached under normal dashboard
// traffic. Keep one deliberately small shared pool per instance. Serverless
// concurrency is already the outer pool; allowing every instance several idle
// sockets caused connection pressure to cascade into admin timeouts.
export function getDatabasePool() {
  if (!process.env.DATABASE_URL) return null;
  if (!globalThis[GLOBAL_POOL_KEY]) {
    const pool = new Pool({
      connectionString: databaseUrl(),
      ssl: databaseSsl(),
      max: poolMax,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
      maxLifetimeSeconds: 120,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      statement_timeout: 8000,
      query_timeout: 8000
    });
    pool.on("error", (error) => {
      console.warn("[database] idle connection error", error?.message || error);
    });
    globalThis[GLOBAL_POOL_KEY] = pool;
  }
  return globalThis[GLOBAL_POOL_KEY];
}

export function isTransientDatabaseError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || error || "").toLowerCase();
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "57P01", "57P02", "57P03", "08000", "08003", "08006"].includes(code)
    || /(connection terminated|connection reset|connection timeout|timeout exceeded when trying to connect|socket hang up|server closed the connection|query read timeout)/.test(message);
}

export async function withDatabaseRetry(task, { label = "database", attempts = 2 } = {}) {
  let failure;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      failure = error;
      if (attempt === attempts || !isTransientDatabaseError(error)) throw error;
      console.warn(`[${label}] transient database error; retrying once`, error?.message || error);
      // Jitter stops several cold-started functions from retrying the same
      // unavailable database connection at exactly the same instant.
      await new Promise((resolve) => setTimeout(resolve, 160 * attempt + Math.floor(Math.random() * 140)));
    }
  }
  throw failure;
}
