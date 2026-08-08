import { redirect } from "next/navigation";
import { requireAdminApi } from "@/lib/adminApi";
import { runEditorialPublication } from "@/lib/newsEditorial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const result = await runEditorialPublication({ force: true, generateOnly: true });
  redirect(`/admin/news?candidate=${encodeURIComponent(result.status || "unknown")}`);
}
