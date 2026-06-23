import { cmsStorageMode } from "@/lib/cmsStore";
import { getAnalyticsStorageMode } from "@/lib/analyticsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron) return true;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  return Boolean(secret && auth === `Bearer ${secret}`);
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return Response.json({
    success: true,
    status: "ok",
    checks: {
      cms: cmsStorageMode(),
      analytics: getAnalyticsStorageMode(),
      enquiries: enquiryStorageMode()
    },
    checkedAt: new Date().toISOString()
  });
}

export async function POST(request) {
  return GET(request);
}
