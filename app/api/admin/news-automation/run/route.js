import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { runNewsAutomation } from "@/lib/newsAutomation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await request.json().catch(() => ({})) : {};
  const limit = Math.max(1, Math.min(4, Number(body.limit || 1)));
  const dryRun = Boolean(body.dryRun);
  const result = await runNewsAutomation({ limit, dryRun });

  if (!dryRun) {
    revalidatePath("/es-cl/blog");
    revalidatePath("/en/blog");
    revalidatePath("/news-sitemap.xml");
    revalidatePath("/sitemap.xml");
  }

  if (!isJson) {
    const published = Array.isArray(result.published) ? result.published.length : Number(result.publishedCount || 0);
    return NextResponse.redirect(new URL(`/admin/news?automation=${published ? "published" : "checked"}`, request.url), 303);
  }

  return Response.json({ success: true, ...result });
}
