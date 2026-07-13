import { runNewsAutomation } from "@/lib/newsAutomation";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  const vercelCron = request.headers.get("x-vercel-cron");
  if (secret) return auth === `Bearer ${secret}`;
  if (vercelCron) return true;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  return false;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(4, Math.max(1, Number(url.searchParams.get("limit") || 4)));
  const dryRun = url.searchParams.get("dryRun") === "1";
  const slot = url.searchParams.get("slot") || "";
  const trigger = url.searchParams.get("catchup") === "1" ? "scheduled-catchup" : "scheduled";
  try {
    const result = await runNewsAutomation({ limit, dryRun, trigger, slot });
    if (!dryRun) {
      if (result.success && result.data?.published?.length) {
        queueSitemapRefresh("news-automation-published");
      }
      const log = result.data?.log || {};
      return Response.json({
        success: result.success,
        publishedCount: result.data?.published?.length || 0,
        skipped: Boolean(result.skipped),
        selected_source: log.selected_source || [],
        rejectedCount: log.rejected_sources?.length || 0,
        daily_quota: log.daily_quota,
        published_today: log.published_today,
        remaining_today: log.remaining_today,
        time_zone: log.time_zone
      }, { status: result.skipped ? 202 : 200 });
    }
    return Response.json(result);
  } catch (error) {
    console.error("[cron/news] failed", error);
    return Response.json({
      success: false,
      error: error?.message || "News automation failed",
      name: error?.name || "Error"
    }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
