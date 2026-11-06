import { requireAdminApi } from "@/lib/adminApi";
import { inspectGoogleSearchConsoleUrls } from "@/lib/googleSearchConsole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 50;

function validUrl(raw) {
  if (typeof raw !== "string" || raw.length > 500) return false;
  try {
    const url = new URL(raw);
    return ["https:", "http:"].includes(url.protocol) && ["cowinmagnet.cl", "www.cowinmagnet.cl"].includes(url.hostname)
      && !url.port && !url.username && !url.password && !url.hash && !/^\/(?:admin|api|_next)(?:\/|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

export async function POST(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ success: false }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.urls) || !body.urls.length || body.urls.length > 12 || !body.urls.every(validUrl)) {
    return Response.json({ success: false, error: "请提供最多 12 条智利站的公开网址。" }, { status: 400 });
  }
  const result = await inspectGoogleSearchConsoleUrls(body.urls, { concurrency: 4 });
  if (result.error) return Response.json({ success: false, error: "暂时无法读取 Google 的索引记录。" }, { status: 502 });
  return Response.json({ success: true, data: result.inspections, checkedAt: result.inspectedAt });
}
