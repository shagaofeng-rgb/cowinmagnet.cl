import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import { parseAnalyticsFilters } from "@/lib/analyticsPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const range = getAdminDateRange(params);
  const data = await getAnalyticsSnapshot(range, parseAnalyticsFilters(params));
  return NextResponse.json({ success: true, data, range: { label: range.label, start: range.startInput, end: range.endInput } });
}
