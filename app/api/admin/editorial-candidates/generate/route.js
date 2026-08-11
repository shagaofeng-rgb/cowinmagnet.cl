import { redirect } from "next/navigation";
import { requireAdminApi } from "@/lib/adminApi";
import { runNewsIngest } from "@/lib/newsEditorial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const result = await runNewsIngest({ force: true, trigger: "admin-candidate-ingest" });
  redirect(`/admin/news?candidate=${encodeURIComponent(result.status || "unknown")}`);
}
