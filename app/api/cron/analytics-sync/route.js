import { runAnalyticsSync } from "@/lib/analyticsStore";

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
  const result = await runAnalyticsSync({ source: "vercel-cron" });
  return Response.json({
    success: result.success,
    ...result.data
  }, { status: result.success ? 200 : 500 });
}

export async function POST(request) {
  return GET(request);
}
