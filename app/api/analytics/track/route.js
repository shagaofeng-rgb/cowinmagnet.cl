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
      exclusion: classifyTraffic({ userAgent, host, referrer: body.referrer, page: body.page, isTest: body.isTest })
    });
    return NextResponse.json({ success: true, data: result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[analytics/track] persistence failed", error?.message || error);
    return NextResponse.json({ success: false, error: "Analytics storage is temporarily unavailable." }, { status: 503 });
  }
}
