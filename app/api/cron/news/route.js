import { runNewsAutomation } from "@/lib/newsAutomation";

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
  if (!isAuthorized(request)) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(3, Math.max(1, Number(url.searchParams.get("limit") || 3)));
  const dryRun = url.searchParams.get("dryRun") === "1";
  const result = await runNewsAutomation({ limit, dryRun });
  return Response.json(result);
}

export async function POST(request) {
  return GET(request);
}
