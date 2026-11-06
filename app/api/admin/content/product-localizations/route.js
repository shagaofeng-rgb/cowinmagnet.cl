import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminApi } from "@/lib/adminApi";
import { getCmsItem, saveCmsItem, updateCmsItemStatus } from "@/lib/cmsStore";
import { products } from "@/data/catalog";
import { EDITABLE_PRODUCT_LOCALES, PRODUCT_LOCALIZATION_TAG, PRODUCT_LOCALIZATION_TYPE, productLocalizationKey, readProductLocalization } from "@/lib/productLocalization";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && new URL(request.url).origin !== origin)) {
    return Response.json({ success: false }, { status: 403 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ success: false }, { status: 400 });
  const locale = form.get("locale");
  const product = products.find((item) => item.slug === form.get("product"));
  const action = form.get("action");
  const next = new URL("/admin/products", request.url);
  function finish(key, value) {
    next.searchParams.set(key, value);
    return Response.redirect(next, 303);
  }
  if (!product || !EDITABLE_PRODUCT_LOCALES.includes(locale) || !["draft", "publish", "restore"].includes(action)) {
    return finish("error", "product-invalid");
  }
  next.searchParams.set("product", product.slug);
  next.searchParams.set("locale", locale);
  const fields = action === "restore" ? null : readProductLocalization(form);
  if (!fields && action !== "restore") return finish("error", "content-required");
  const liveKey = productLocalizationKey(locale, product.slug);
  if (action === "restore") {
    await updateCmsItemStatus(PRODUCT_LOCALIZATION_TYPE, liveKey, "offline");
  } else {
    const slug = action === "publish" ? liveKey : productLocalizationKey(locale, product.slug, "draft");
    const previous = await getCmsItem(PRODUCT_LOCALIZATION_TYPE, slug);
    await saveCmsItem({
      ...fields, slug, type: PRODUCT_LOCALIZATION_TYPE, locale, productSlug: product.slug, categoryId: product.category,
      status: action === "publish" ? "published" : "draft", createdAt: previous?.createdAt
    });
  }
  if (action !== "draft") {
    revalidateTag(PRODUCT_LOCALIZATION_TAG, { expire: 0 });
    revalidatePath("/sitemap.xml");
    queueSitemapRefresh("product-copy-" + action);
  }
  return finish("saved", action);
}
