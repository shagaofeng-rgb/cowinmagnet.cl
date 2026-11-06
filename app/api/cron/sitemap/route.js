import { runSitemapJob } from "@/lib/sitemapManager";
import { WEEKLY_SITEMAP_TRIGGER } from "@/lib/weeklySitemap";

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
    trigger: WEEKLY_SITEMAP_TRIGGER,
    dryRun: url.searchParams.get("dryRun") === "true",
    submit: true
  });
  const submission = result.run?.submissionResult;
  const expectedSkip = ["outside-weekly-window", "already-submitted-this-week"].includes(submission?.reason);
  const status = !result.success ? (result.locked ? 409 : 500) : submission && !submission.success && !expectedSkip ? 502 : 200;
  return Response.json(result, { status });
}

export async function GET(request) {
  return execute(request);
}

export async function POST(request) {
  return execute(request);
}
