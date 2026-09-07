import { getGoogleSearchConsoleSitemapStatus } from "@/lib/googleSearchConsole";
import { getSitemapStatus } from "@/lib/sitemapManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const [google, sitemap] = await Promise.all([
    getGoogleSearchConsoleSitemapStatus(),
    getSitemapStatus()
  ]);
  const latestRun = sitemap?.runs?.[0] || null;
  const payload = {
    success: Boolean(google.success && google.errors === 0),
    google,
    sitemap: {
      storage: sitemap?.storage || null,
      generatedAt: sitemap?.snapshots?.find((item) => item.file_name === "sitemap.xml")?.generated_at || null,
      latestRun: latestRun ? {
        finishedAt: latestRun.finished_at || latestRun.finishedAt || null,
        submitted: Boolean(latestRun.submitted),
        submissionResult: latestRun.submission_result || latestRun.submissionResult || null
      } : null
    },
    checkedAt: new Date().toISOString()
  };
  console.log("[search-console-health]", JSON.stringify(payload));
  return Response.json(payload, { status: payload.success ? 200 : 502 });
}
