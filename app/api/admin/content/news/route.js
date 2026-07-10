import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/adminApi";
import { saveCmsItem, slugify } from "@/lib/cmsStore";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function value(formData, key) {
  return String(formData.get(key) || "").trim();
}

export async function POST(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);
  if (!title || !slug) redirect("/admin/news?error=news-required");

  await saveCmsItem({
    type: "news",
    slug,
    title,
    categoryTitle: value(formData, "categoryTitle") || "Industry News",
    summary: value(formData, "summary"),
    body: value(formData, "body"),
    sourceUrl: value(formData, "sourceUrl"),
    publishedAt: new Date().toISOString(),
    status: "published",
    href: `/news/${slug}`
  });

  revalidatePath("/admin/news");
  revalidatePath("/es-cl/news");
  revalidatePath("/news-sitemap.xml");
  revalidatePath("/sitemap.xml");
  queueSitemapRefresh("news-created");
  redirect("/admin/news?saved=news");
}
