import { redirect } from "next/navigation";
import { requireAdminApi } from "@/lib/adminApi";
import { getCmsItem, saveCmsItem } from "@/lib/cmsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { slug } = await context.params;
  const candidate = await getCmsItem("news-candidate", slug, { includeInactive: true });
  if (!candidate || candidate.status === "rejected") redirect("/admin/news?candidate=not-eligible");

  await saveCmsItem({ ...candidate, type: "news-candidate", status: "quality_review", editorialApproved: true, editorialApprovedAt: new Date().toISOString() });
  redirect("/admin/news?candidate=approved");
}
