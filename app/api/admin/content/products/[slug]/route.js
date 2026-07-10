import { revalidatePath, revalidateTag } from "next/cache";
import { deleteCmsItem, getCmsItem, saveCmsItem, updateCmsItemStatus } from "@/lib/cmsStore";
import { requireAdminApi } from "@/lib/adminApi";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function slugFromContext(context) {
  const params = await context.params;
  return params.slug;
}

function revalidateProduct(item, slug) {
  const categoryId = item?.categoryId || "products";
  revalidatePath("/es-cl/products");
  revalidatePath("/en/products");
  revalidatePath(`/es-cl/products/${categoryId}/${slug}`);
  revalidatePath(`/en/products/${categoryId}/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidateTag("public-products", { expire: 0 });
}

export async function GET(request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const slug = await slugFromContext(context);
  const item = await getCmsItem("product", slug, { includeInactive: true });
  if (!item) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, item });
}

export async function PATCH(request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const slug = await slugFromContext(context);
  const body = await request.json().catch(() => ({}));
  const item = await getCmsItem("product", slug, { includeInactive: true });
  if (!item) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  if (body.status) {
    await updateCmsItemStatus("product", slug, String(body.status));
    revalidateProduct(item, slug);
    queueSitemapRefresh("product-status-changed");
    return Response.json({ success: true });
  }

  const next = await saveCmsItem({ ...item, ...body, type: "product", slug: body.slug || slug });
  revalidateProduct(next, next.slug);
  queueSitemapRefresh("product-updated");
  return Response.json({ success: true, item: next });
}

export async function PUT(request, context) {
  return PATCH(request, context);
}

export async function DELETE(request, context) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const slug = await slugFromContext(context);
  const item = await getCmsItem("product", slug, { includeInactive: true });
  await deleteCmsItem("product", slug);
  revalidateProduct(item, slug);
  queueSitemapRefresh("product-deleted");
  return Response.json({ success: true });
}
