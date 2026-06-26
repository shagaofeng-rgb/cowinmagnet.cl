import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { getAnalyticsStorageMode, getLatestSyncStatus, runAnalyticsSync } from "@/lib/analyticsStore";
import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const sync = await getLatestSyncStatus();

  return NextResponse.json({
    success: true,
    data: {
      intervalMinutes: 30,
      ...sync,
      status: sync.status || "waiting",
      analytics: getAnalyticsStorageMode(),
      cms: cmsStorageMode(),
      enquiries: enquiryStorageMode(),
      checkedAt: new Date().toISOString()
    }
  });
}

export async function POST() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const result = await runAnalyticsSync({ source: "admin-manual" });

  return NextResponse.json({
    success: result.success,
    data: {
      intervalMinutes: 30,
      ...result.data,
      analytics: getAnalyticsStorageMode(),
      cms: cmsStorageMode(),
      enquiries: enquiryStorageMode(),
      checkedAt: new Date().toISOString()
    }
  }, { status: result.success ? 200 : 500 });
}
