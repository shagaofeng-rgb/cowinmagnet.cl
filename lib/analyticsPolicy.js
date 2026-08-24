import { createHash } from "node:crypto";

export const ANALYTICS_TIMEZONE = "America/Santiago";

const BOT_PATTERNS = [
  /bot\b/i, /crawler/i, /spider/i, /lighthouse/i, /headless/i, /playwright/i,
  /puppeteer/i, /codex/i, /curl\//i, /wget\//i, /postman/i, /uptimerobot/i,
  /healthcheck/i, /pingdom/i
];

function list(value) {
  return String(value || "").split(/[\n,;]/).map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function matchesList(value, configured) {
  const normalized = String(value || "").toLowerCase();
  return list(configured).some((item) => normalized.includes(item));
}

export function maskIp(ip) {
  const value = String(ip || "").trim();
  if (!value) return "-";
  if (value.includes(":")) {
    const parts = value.split(":").filter(Boolean);
    return `${parts.slice(0, 3).join(":")}::`;
  }
  const parts = value.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.*` : "-";
}

export function hashIp(ip) {
  const value = String(ip || "").trim();
  if (!value) return "";
  const salt = process.env.ANALYTICS_IP_SALT || process.env.CRON_SECRET || "cowinmagnet-cl-analytics";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export function classifyTraffic({ userAgent = "", host = "", referrer = "", page = "", isTest = false } = {}) {
  const normalizedHost = String(host || "").toLowerCase();
  const configured = {
    userAgents: process.env.ANALYTICS_EXCLUDED_USER_AGENTS,
    referrers: process.env.ANALYTICS_EXCLUDED_REFERRERS,
    ips: process.env.ANALYTICS_EXCLUDED_IPS
  };

  if (isTest || /[?&](analytics_)?test(?:=|&|$)/i.test(page)) return { excluded: true, reason: "explicit-test" };
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return { excluded: true, reason: "non-production" };
  if (/localhost|127\.0\.0\.1|\.vercel\.app$/i.test(normalizedHost)) return { excluded: true, reason: "internal-or-preview-host" };
  if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) return { excluded: true, reason: "automated-agent" };
  if (matchesList(userAgent, configured.userAgents)) return { excluded: true, reason: "configured-user-agent" };
  if (matchesList(referrer, configured.referrers)) return { excluded: true, reason: "configured-referrer" };
  // "Collects" traffic is retained for audit but never contributes to business metrics.
  if (/\bcollects?\b|analytics[-_ ]?collector/i.test(`${referrer} ${userAgent}`)) return { excluded: true, reason: "collector-traffic" };
  return { excluded: false, reason: "" };
}

export function classifyVisitor({ sessions = 0, pageCount = 0, isLead = false, source = "" } = {}) {
  if (isLead) return "Lead";
  if (sessions >= 3 || pageCount >= 5) return "High intent";
  if (sessions > 1) return "Returning";
  if (/bot|collector/i.test(source)) return "Excluded";
  return "New";
}

export function parseAnalyticsFilters(params = {}) {
  const page = Math.max(1, Number(params.page || 1) || 1);
  const pageSize = [25, 50, 100].includes(Number(params.pageSize)) ? Number(params.pageSize) : 25;
  return {
    page,
    pageSize,
    country: String(params.country || "").trim(),
    channel: String(params.channel || "").trim(),
    device: String(params.device || "").trim(),
    visitorType: String(params.visitorType || "").trim(),
    query: String(params.query || "").trim().toLowerCase(),
    sort: String(params.sort || "lastSeen"),
    order: String(params.order || "desc") === "asc" ? "asc" : "desc",
    includeExcluded: String(params.includeExcluded || "") === "1"
  };
}
