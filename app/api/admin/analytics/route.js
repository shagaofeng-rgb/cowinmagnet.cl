import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const range = getAdminDateRange(Object.fromEntries(searchParams.entries()));
  const data = await getAnalyticsSnapshot(range);
  return NextResponse.json({ success: true, data, range: { label: range.label, start: range.startInput, end: range.endInput } });
}
