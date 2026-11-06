import { NextResponse } from "next/server";
import { appendAnalyticsEvent } from "@/lib/analyticsStore";
import { classifyTraffic } from "@/lib/analyticsPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const text = (value, length) => typeof value === "string" ? value.slice(0, length) : "";
const publicPath = /^\/(?:es-cl|es|pt-br|en)(?:\/[a-z0-9-]+)*\/?(?:\?page=[1-9]\d{0,4})?$/;
const identifier = (value, prefix) => new RegExp("^" + prefix + "-[a-z0-9-]{6,70}$", "i").test(text(value, 81));

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "";
}

function isProductionRequest(request) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  if (host !== "cowinmagnet.cl" && host !== "www.cowinmagnet.cl") return false;
  const origin = request.headers.get("origin") || request.headers.get("referer");
  if (!origin) return true;
  try {
    const sourceHost = new URL(origin).hostname.toLowerCase();
    return sourceHost === "cowinmagnet.cl" || sourceHost === "www.cowinmagnet.cl";
  } catch {
    return false;
  }
}

export async function POST(request) {
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return Response.json({ success: false }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ success: false }, { status: 400 });
  }
  if (!body || body.type !== "page_view" || !identifier(body.id, "event")
      || !identifier(body.visitorId, "visitor") || !identifier(body.sessionId, "session")
      || !publicPath.test(text(body.page, 241)) || body.page.length > 240) {
    return Response.json({ success: false }, { status: 400 });
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ success: false }, { status: 403 });

  const userAgent = request.headers.get("user-agent") || "";
  const host = request.headers.get("host") || "";
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "Unknown";
  const city = request.headers.get("x-vercel-ip-city") || "";
  const device = /mobile|android|iphone/i.test(userAgent) ? "Mobile" : "Desktop";
  const browser = /edg/i.test(userAgent) ? "Edge" : /firefox/i.test(userAgent) ? "Firefox" : /safari/i.test(userAgent) && !/chrome/i.test(userAgent) ? "Safari" : "Chrome";
  const os = /android/i.test(userAgent) ? "Android" : /iphone|ipad/i.test(userAgent) ? "iOS" : /mac/i.test(userAgent) ? "macOS" : "Windows";

  try {
    let referrer = "";
    try {
      const url = new URL(text(body.referrer, 500));
      if (/^https?:$/.test(url.protocol)) referrer = url.origin;
    } catch { /* Direct session. */ }
    const classified = classifyTraffic({ userAgent, host, referrer, page: body.page, isTest: body.isTest === true });
    const exclusion = isProductionRequest(request) ? classified : { excluded: true, reason: "non-production-request" };
    const timestamp = Date.parse(text(body.timestamp, 35));
    const now = Date.now();
    await appendAnalyticsEvent({
      id: body.id, type: body.type, visitorId: body.visitorId, sessionId: body.sessionId, page: body.page,
      previousPage: publicPath.test(text(body.previousPage, 240)) ? text(body.previousPage, 240) : "",
      pageTitle: text(body.pageTitle, 180), language: text(body.language, 40), referrer,
      channel: text(body.channel, 80), sourcePlatform: text(body.sourcePlatform, 120),
      sourceDetail: text(body.utmCampaign, 160) || referrer,
      ...Object.fromEntries(["utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent"].map((key) => [key, text(body[key], 160)])),
      timestamp: new Date(timestamp >= now - 172800000 && timestamp <= now + 60000 ? timestamp : now).toISOString(),
      device, browser, os,
      country,
      city,
      userAgent,
      host,
      ip: clientIp(request),
      verified: !exclusion.excluded,
      exclusion
    });
    return NextResponse.json({ success: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[analytics/track] persistence failed", error?.message || error);
    return NextResponse.json({ success: false, error: "Analytics storage is temporarily unavailable." }, { status: 503 });
  }
}
