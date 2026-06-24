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
