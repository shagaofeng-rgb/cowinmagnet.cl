import { runEditorialPublication } from "@/lib/newsEditorial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runEditorialPublication();
    console.log("[editorial-news]", JSON.stringify(result));
    return Response.json(result);
  } catch (error) {
    console.error("[editorial-news]", error);
    return Response.json({ success: false, error: "Editorial publication failed" }, { status: 500 });
  }
}
