import crypto from "node:crypto";
import fs from "node:fs";
import { submitSitemapRequest } from "./searchConsoleSitemap.mjs";

const SCOPES = ["https://www.googleapis.com/auth/webmasters"];
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_ANALYTICS_URL = "https://searchconsole.googleapis.com/webmasters/v3/sites";
const URL_INSPECTION_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

let cachedToken = null;

function base64Url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizePrivateKey(key = "") {
  return key.replace(/\\n/g, "\n");
}

function getServiceAccount() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH) {
    return JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH, "utf8"));
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8"));
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      token_uri: process.env.GOOGLE_TOKEN_URI || TOKEN_URL
    };
  }

  return null;
}

function isSitemapSubmissionEnabled() {
  return String(process.env.GOOGLE_SEARCH_CONSOLE_ENABLED || "false").toLowerCase() === "true";
}

function getSiteUrl() {
  return process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "sc-domain:cowinmagnet.cl";
}

function toDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function buildJwt(account) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: account.client_email,
    scope: SCOPES.join(" "),
    aud: account.token_uri || TOKEN_URL,
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(normalizePrivateKey(account.private_key));
  return `${unsigned}.${base64Url(signature)}`;
}

async function getAccessToken() {
  let account;
  try {
    account = getServiceAccount();
  } catch {
    return { ok: false, error: "Google service account credentials are not valid JSON." };
  }
  if (!account?.client_email || !account?.private_key) {
    return { ok: false, error: "Google service account is not configured." };
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return { ok: true, token: cachedToken.token };
  }

  const assertion = buildJwt(account);
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    response = await fetch(account.token_uri || TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion
      }),
      signal: controller.signal
    });
  } catch (error) {
    return { ok: false, error: error?.name === "AbortError" ? "Google token request timed out." : `Token request failed: ${error.message}` };
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: body.error_description || body.error || `Token request failed: ${response.status}` };
  }

  cachedToken = {
    token: body.access_token,
    expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000
  };
  return { ok: true, token: cachedToken.token };
}

export async function submitSitemapToSearchConsole(sitemapUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL || "https://cowinmagnet.cl/sitemap.xml") {
  if (!isSitemapSubmissionEnabled()) {
    return { success: false, skipped: true, reason: "GOOGLE_SEARCH_CONSOLE_ENABLED is not true." };
  }
  const tokenResult = await getAccessToken();
  if (!tokenResult.ok) return { success: false, error: tokenResult.error };
  return submitSitemapRequest({
    accessToken: tokenResult.token,
    siteUrl: getSiteUrl(),
    sitemapUrl
  });
}

async function querySearchAnalytics(token, range, dimensions = [], rowLimit = 10) {
  const siteUrl = encodeURIComponent(getSiteUrl());
  const response = await fetch(`${SEARCH_ANALYTICS_URL}/${siteUrl}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      startDate: toDateOnly(range.startDate),
      endDate: toDateOnly(range.endDate),
      dimensions,
      rowLimit,
      searchType: "web",
      dataState: "final"
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error?.message || `Search Analytics request failed: ${response.status}`);
  }
  return body.rows || [];
}

function summarize(rows) {
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
  const weightedPosition = rows.reduce((sum, row) => sum + Number(row.position || 0) * Number(row.impressions || 0), 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    position: impressions ? Number((weightedPosition / impressions).toFixed(1)) : 0
  };
}

function mapRows(rows, keyName) {
  return rows.map((row) => ({
    [keyName]: row.keys?.[0] || "",
    clicks: Math.round(Number(row.clicks || 0)),
    impressions: Math.round(Number(row.impressions || 0)),
    ctr: Number((Number(row.ctr || 0) * 100).toFixed(2)),
    position: Number(Number(row.position || 0).toFixed(1))
  }));
}

async function inspectUrl(token, inspectionUrl) {
  const response = await fetch(URL_INSPECTION_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      inspectionUrl,
      siteUrl: getSiteUrl(),
      languageCode: "es-CL"
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      url: inspectionUrl,
      verdict: "UNKNOWN",
      coverageState: body.error?.message || `Inspection failed: ${response.status}`,
      lastCrawlTime: null
    };
  }
  const result = body.inspectionResult?.indexStatusResult || {};
  return {
    url: inspectionUrl,
    verdict: result.verdict || "UNKNOWN",
    coverageState: result.coverageState || "",
    lastCrawlTime: result.lastCrawlTime || null
  };
}

export async function getGoogleSearchConsoleSnapshot(range) {
  const tokenResult = await getAccessToken();
  const configured = Boolean(getServiceAccount() && getSiteUrl());
  if (!tokenResult.ok) {
    return {
      configured,
      error: tokenResult.error,
      overview: { clicks: 0, impressions: 0, ctr: 0, position: 0, indexedPages: 0, notIndexedPages: 0 },
      queries: [],
      pages: [],
      countries: [],
      devices: [],
      indexingStatus: []
    };
  }

  try {
    const [overviewRows, queryRows, pageRows, countryRows, deviceRows] = await Promise.all([
      querySearchAnalytics(tokenResult.token, range, [], 1),
      querySearchAnalytics(tokenResult.token, range, ["query"], 25),
      querySearchAnalytics(tokenResult.token, range, ["page"], 25),
      querySearchAnalytics(tokenResult.token, range, ["country"], 15),
      querySearchAnalytics(tokenResult.token, range, ["device"], 10)
    ]);

    const coreUrls = [
      "https://cowinmagnet.cl/es-cl",
      "https://cowinmagnet.cl/es-cl/products",
      "https://cowinmagnet.cl/es-cl/news",
      "https://cowinmagnet.cl/sitemap.xml"
    ];
    const indexingStatus = await Promise.all(coreUrls.map((url) => inspectUrl(tokenResult.token, url)));
    const indexedPages = indexingStatus.filter((item) => item.verdict === "PASS").length;

    return {
      configured: true,
      siteUrl: getSiteUrl(),
      overview: {
        ...summarize(overviewRows),
        indexedPages,
        notIndexedPages: Math.max(indexingStatus.length - indexedPages, 0)
      },
      queries: mapRows(queryRows, "query"),
      pages: mapRows(pageRows, "page"),
      countries: mapRows(countryRows, "country"),
      devices: mapRows(deviceRows, "device"),
      indexingStatus
    };
  } catch (error) {
    return {
      configured: true,
      siteUrl: getSiteUrl(),
      error: error.message,
      overview: { clicks: 0, impressions: 0, ctr: 0, position: 0, indexedPages: 0, notIndexedPages: 0 },
      queries: [],
      pages: [],
      countries: [],
      devices: [],
      indexingStatus: []
    };
  }
}
