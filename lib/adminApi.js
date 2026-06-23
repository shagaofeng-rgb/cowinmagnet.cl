import { getAdminSession } from "@/lib/adminAuth";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot, getSearchConsoleSnapshot } from "@/lib/analyticsStore";

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function analyticsResponse(selector, request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const range = getAdminDateRange(params);
  const snapshot = await getAnalyticsSnapshot(range);
  const data = typeof selector === "function" ? selector(snapshot) : snapshot[selector];
  return Response.json(data ?? {});
}

export async function searchConsoleResponse(selector, request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const range = getAdminDateRange(params);
  const snapshot = await getSearchConsoleSnapshot(range);
  const data = typeof selector === "function" ? selector(snapshot) : snapshot[selector];
  return Response.json(data ?? {});
}
