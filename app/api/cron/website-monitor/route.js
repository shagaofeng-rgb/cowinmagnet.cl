import { getAnalyticsHealthSummary, getLatestSyncStatus } from "@/lib/analyticsStore";
import { getCmsContentSummary } from "@/lib/cmsStore";
import { getEnquiriesPage } from "@/lib/enquiryStore";
import { getSitemapStatus } from "@/lib/sitemapManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (secret) return auth === `Bearer ${secret}`;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  return false;
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const analyticsRange = { startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), endDate: now };
  const checks = await Promise.allSettled([
    getCmsContentSummary(),
    getEnquiriesPage({ page: 1, pageSize: 25 }),
    getLatestSyncStatus(),
    getAnalyticsHealthSummary(analyticsRange),
    getSitemapStatus()
  ]);
  const names = ["cmsSummary", "enquiries", "analyticsSync", "analyticsSummary", "sitemap"];
  const failures = checks.flatMap((result, index) => result.status === "rejected" ? [{
    check: names[index],
    error: String(result.reason?.message || result.reason || "Unknown error").slice(0, 240)
  }] : []);
  const [contentSummary, enquiries, sync, analytics, sitemap] = checks.map((result) => result.status === "fulfilled" ? result.value : null);
  const payload = {
    success: failures.length === 0,
    status: failures.length ? "degraded" : "ok",
    checks: {
      cmsProducts: contentSummary?.product ?? null,
      cmsNews: contentSummary?.news ?? null,
      cmsBlogs: contentSummary?.blog ?? null,
      enquiries: enquiries?.meta?.total ?? null,
      analyticsSync: sync?.status || null,
      analyticsLast24Hours: analytics ? {
        pageViews: analytics.pageViews,
        uniqueVisitors: analytics.uniqueVisitors,
        sessions: analytics.sessions,
        inquiries: analytics.inquiries
      } : null,
      sitemapStorage: sitemap?.storage || null,
      sitemapLastRun: sitemap?.runs?.[0]?.finished_at || sitemap?.runs?.[0]?.finishedAt || null
    },
    failures,
    checkedAt: new Date().toISOString()
  };
  console.log("[website-monitor]", JSON.stringify(payload));
  return Response.json(payload, { status: failures.length ? 503 : 200 });
}

export async function POST(request) {
  return GET(request);
}
