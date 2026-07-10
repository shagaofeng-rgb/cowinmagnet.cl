import { runSitemapJob } from "@/lib/sitemapManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret && process.env.NODE_ENV !== "production") return true;
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function execute(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const result = await runSitemapJob({
    trigger: url.searchParams.get("trigger") || "daily-cron",
    force: url.searchParams.get("force") === "true",
    dryRun: url.searchParams.get("dryRun") === "true",
    submit: url.searchParams.get("submit") !== "false"
  });
  return Response.json(result, { status: result.success ? 200 : result.locked ? 409 : 500 });
}

export async function GET(request) {
  return execute(request);
}

export async function POST(request) {
  return execute(request);
}
