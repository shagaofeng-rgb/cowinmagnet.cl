import { runNewsSourceHealthCheck } from "@/lib/newsSourceHealth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const result = await runNewsSourceHealthCheck({
      siteId: url.searchParams.get("siteId") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      force: url.searchParams.get("force") === "1",
      trigger: "vercel-cron"
    });
    return Response.json(result);
  } catch (error) {
    console.error("[news-source-health]", error);
    return Response.json({ success: false, error: "News source health check failed" }, { status: 500 });
  }
}
