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
  if (!title || !slug) redirect("/admin/blog?error=blog-required");

  const now = new Date().toISOString();
  await saveCmsItem({
    type: "blog",
    slug,
    title,
    categoryId: value(formData, "categoryId") || "blog",
    categoryTitle: value(formData, "categoryTitle") || "Blog",
    summary: value(formData, "summary"),
    body: value(formData, "body"),
    author: value(formData, "author") || "Cowinmagnet LATAM",
    image: value(formData, "image"),
    coverImage: value(formData, "image"),
    publishedAt: now,
    status: "published",
    href: `/blog/${slug}`
  });

  for (const locale of ["es-cl", "es", "pt-br", "en"]) revalidatePath(`/${locale}/blog`);
  revalidatePath("/sitemap.xml");
  queueSitemapRefresh("blog-created");
  redirect("/admin/blog?saved=blog");
}
