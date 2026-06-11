import { NextResponse } from "next/server";
import { appendAnalyticsEvent } from "@/lib/analyticsStore";

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
  const device = /mobile|android|iphone/i.test(userAgent) ? "Mobile" : "Desktop";
  const browser = /edg/i.test(userAgent) ? "Edge" : /firefox/i.test(userAgent) ? "Firefox" : /safari/i.test(userAgent) && !/chrome/i.test(userAgent) ? "Safari" : "Chrome";
  const os = /android/i.test(userAgent) ? "Android" : /iphone|ipad/i.test(userAgent) ? "iOS" : /mac/i.test(userAgent) ? "macOS" : "Windows";

  const result = await appendAnalyticsEvent({
    ...body,
    device: body.device || device,
    browser: body.browser || browser,
    os: body.os || os,
    ip: body.ip || clientIp(request)
  });

  return NextResponse.json({ success: true, data: result });
}
