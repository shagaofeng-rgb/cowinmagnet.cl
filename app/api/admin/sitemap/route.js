import { requireAdminApi } from "@/lib/adminApi";
import { getSitemapStatus, runSitemapJob } from "@/lib/sitemapManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  return Response.json({ success: true, data: await getSitemapStatus() });
}

export async function POST(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => ({}));
  const result = await runSitemapJob({
    trigger: "admin-manual",
    force: Boolean(body.force),
    dryRun: Boolean(body.dryRun),
    submit: Boolean(body.submit)
  });
  return Response.json(result, { status: result.success ? 200 : result.locked ? 409 : 500 });
}
