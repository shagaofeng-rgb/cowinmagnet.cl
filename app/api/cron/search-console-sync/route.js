import { runSearchConsoleSync } from "@/lib/analyticsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (secret) return auth === `Bearer ${secret}`;
  return process.env.NODE_ENV !== "production";
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const result = await runSearchConsoleSync({ source: "vercel-cron" });
  return Response.json({ success: result.success, ...result.data }, { status: result.success ? 200 : 502 });
}

export async function POST(request) {
  return GET(request);
}
