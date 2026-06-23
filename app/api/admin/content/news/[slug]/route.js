import { revalidatePath } from "next/cache";
import { deleteCmsItem, getCmsItem, saveCmsItem, updateCmsItemStatus } from "@/lib/cmsStore";
import { requireAdminApi } from "@/lib/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function slugFromContext(context) {
  const params = await context.params;
  return params.slug;
}

function revalidateNews(slug) {
  revalidatePath("/es-cl/blog");
  revalidatePath("/en/blog");
  revalidatePath(`/es-cl/blog/${slug}`);
  revalidatePath(`/en/blog/${slug}`);
  revalidatePath("/news-sitemap.xml");
  revalidatePath("/sitemap.xml");
}

export async function GET(request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const slug = await slugFromContext(context);
  const item = await getCmsItem("news", slug, { includeInactive: true });
  if (!item) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, item });
}

export async function PATCH(request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const slug = await slugFromContext(context);
  const body = await request.json().catch(() => ({}));
  const item = await getCmsItem("news", slug, { includeInactive: true });
  if (!item) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  if (body.status) {
    await updateCmsItemStatus("news", slug, String(body.status));
    revalidateNews(slug);
    return Response.json({ success: true });
  }

  const next = await saveCmsItem({ ...item, ...body, type: "news", slug: body.slug || slug });
  revalidateNews(next.slug);
  return Response.json({ success: true, item: next });
}

export async function PUT(request, context) {
  return PATCH(request, context);
}

export async function DELETE(request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const slug = await slugFromContext(context);
  await deleteCmsItem("news", slug);
  revalidateNews(slug);
  return Response.json({ success: true });
}
