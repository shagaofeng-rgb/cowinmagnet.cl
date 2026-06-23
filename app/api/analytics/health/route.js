import { getAnalyticsStorageMode } from "@/lib/analyticsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    success: true,
    service: "analytics",
    storageMode: getAnalyticsStorageMode(),
    checkedAt: new Date().toISOString()
  });
}
