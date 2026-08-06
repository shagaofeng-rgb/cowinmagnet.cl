import { getAnalyticsSnapshot, getLatestSyncStatus } from "@/lib/analyticsStore";
import { getCmsItems } from "@/lib/cmsStore";
import { getEnquiries } from "@/lib/enquiryStore";
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
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getCmsItems("news-run-log", { includeInactive: true }),
    getEnquiries(),
    getLatestSyncStatus(),
    getAnalyticsSnapshot(analyticsRange),
    getSitemapStatus()
  ]);
  const names = ["cmsProducts", "cmsNews", "newsAutomation", "enquiries", "analyticsSync", "analyticsSnapshot", "sitemap"];
  const failures = checks.flatMap((result, index) => result.status === "rejected" ? [{
    check: names[index],
    error: String(result.reason?.message || result.reason || "Unknown error").slice(0, 240)
  }] : []);
  const [products, news, newsRuns, enquiries, sync, analytics, sitemap] = checks.map((result) => result.status === "fulfilled" ? result.value : null);
  const latestNewsRun = Array.isArray(newsRuns) ? newsRuns[0] : null;
  const payload = {
    success: failures.length === 0,
    status: failures.length ? "degraded" : "ok",
    checks: {
      cmsProducts: Array.isArray(products) ? products.length : null,
      cmsNews: Array.isArray(news) ? news.length : null,
      newsAutomation: latestNewsRun ? {
        publishedAt: latestNewsRun.publishedAt || latestNewsRun.createdAt || "",
        publishedCount: Array.isArray(latestNewsRun.selected_source) ? latestNewsRun.selected_source.length : 0,
        trigger: latestNewsRun.trigger || ""
      } : null,
      enquiries: Array.isArray(enquiries) ? enquiries.length : null,
      analyticsSync: sync?.status || null,
      analyticsLast24Hours: analytics?.overview ? {
        pageViews: analytics.overview.pageViews,
        uniqueVisitors: analytics.overview.uniqueVisitors,
        sessions: analytics.overview.sessions,
        inquiries: analytics.overview.inquiries
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
