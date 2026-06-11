import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { getAnalyticsStorageMode } from "@/lib/analyticsStore";
import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    success: true,
    data: {
      intervalMinutes: 30,
      status: "success",
      analytics: getAnalyticsStorageMode(),
      cms: cmsStorageMode(),
      enquiries: enquiryStorageMode(),
      checkedAt: new Date().toISOString()
    }
  });
}
