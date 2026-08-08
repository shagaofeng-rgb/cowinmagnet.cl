import { runEditorialPublication } from "@/lib/newsEditorial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const result = await runEditorialPublication({
      dryRun: url.searchParams.get("dryRun") === "1",
      force: url.searchParams.get("force") === "1",
      generateOnly: url.searchParams.get("preview") === "1"
    });
    console.log("[editorial-news]", JSON.stringify(result));
    return Response.json(result);
  } catch (error) {
    console.error("[editorial-news]", error);
    return Response.json({ success: false, error: "Editorial publication failed" }, { status: 500 });
  }
}
