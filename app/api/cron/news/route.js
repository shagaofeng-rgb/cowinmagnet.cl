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
  const limit = Math.min(4, Math.max(1, Number(url.searchParams.get("limit") || 4)));
  const dryRun = url.searchParams.get("dryRun") === "1";
  try {
    const result = await runNewsAutomation({ limit, dryRun });
    return Response.json(result);
  } catch (error) {
    console.error("[cron/news] failed", error);
    return Response.json({
      success: false,
      error: error?.message || "News automation failed",
      name: error?.name || "Error"
    }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
