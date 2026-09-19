import { NextResponse } from "next/server";
import { appendAnalyticsEvent } from "@/lib/analyticsStore";
import { classifyTraffic } from "@/lib/analyticsPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const userAgent = request.headers.get("user-agent") || "";
  const host = request.headers.get("host") || "";
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || body.country || "Unknown";
  const city = request.headers.get("x-vercel-ip-city") || body.city || "";
  const device = /mobile|android|iphone/i.test(userAgent) ? "Mobile" : "Desktop";
  const browser = /edg/i.test(userAgent) ? "Edge" : /firefox/i.test(userAgent) ? "Firefox" : /safari/i.test(userAgent) && !/chrome/i.test(userAgent) ? "Safari" : "Chrome";
  const os = /android/i.test(userAgent) ? "Android" : /iphone|ipad/i.test(userAgent) ? "iOS" : /mac/i.test(userAgent) ? "macOS" : "Windows";

  try {
    const classified = classifyTraffic({ userAgent, host, referrer: body.referrer, page: body.page, isTest: body.isTest });
    const exclusion = isProductionRequest(request) ? classified : { excluded: true, reason: "non-production-request" };
    const result = await appendAnalyticsEvent({
      ...body,
      device: body.device || device,
      browser: body.browser || browser,
      os: body.os || os,
      country,
      city,
      userAgent,
      host,
      ip: clientIp(request),
      verified: !exclusion.excluded,
      exclusion
    });
    return NextResponse.json({ success: true, data: result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[analytics/track] persistence failed", error?.message || error);
    return NextResponse.json({ success: false, error: "Analytics storage is temporarily unavailable." }, { status: 503 });
  }
}
