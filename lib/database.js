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

export function isTransientDatabaseError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || error || "").toLowerCase();
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "57P01", "57P02", "57P03", "08000", "08003", "08006"].includes(code)
    || /(connection terminated|connection reset|connection timeout|timeout exceeded when trying to connect|socket hang up|server closed the connection|query read timeout)/.test(message);
}

export async function withDatabaseRetry(task, { label = "database", attempts = 3 } = {}) {
  let failure;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      failure = error;
      if (attempt === attempts || !isTransientDatabaseError(error)) throw error;
      console.warn(`[${label}] transient database error; retrying once`, error?.message || error);
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
  throw failure;
}
