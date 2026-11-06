import { requireAdminApi } from "@/lib/adminApi";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsVisitors } from "@/lib/analyticsStore";
import { parseAnalyticsFilters } from "@/lib/analyticsPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = await getAnalyticsVisitors(getAdminDateRange(params), parseAnalyticsFilters(params));
  return Response.json(result.visitors);
}
