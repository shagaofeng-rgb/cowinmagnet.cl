import { getAnalyticsStorageMode, getLatestSyncStatus } from "@/lib/analyticsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latestSync = await getLatestSyncStatus();
    return Response.json({
      success: true,
      service: "analytics",
      storageMode: getAnalyticsStorageMode(),
      latestSyncStatus: latestSync.status || "waiting",
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[analytics-health] database check failed", error);
    return Response.json({
      success: false,
      service: "analytics",
      storageMode: getAnalyticsStorageMode(),
      error: "Analytics storage is unavailable.",
      checkedAt: new Date().toISOString()
    }, { status: 503 });
  }
}
