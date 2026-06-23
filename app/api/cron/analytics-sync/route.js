import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron) return true;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  return Boolean(secret && auth === `Bearer ${secret}`);
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const range = getAdminDateRange({ range: "day" });
  const snapshot = await getAnalyticsSnapshot(range);
  return Response.json({
    success: true,
    processedCount: snapshot.overview.pageViews,
    storageMode: snapshot.storageMode,
    finishedAt: new Date().toISOString()
  });
}

export async function POST(request) {
  return GET(request);
}
