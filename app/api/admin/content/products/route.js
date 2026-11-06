import { requireAdminApi } from "@/lib/adminApi";
import { fileToDataUrl, parseLines, parseSpecifications, saveCmsItem, slugify } from "@/lib/cmsStore";

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
  if (!title || !slug) return Response.redirect(new URL("/admin/products?error=product-required", request.url), 303);

  const [selectedCategoryId = "", selectedCategoryTitle = ""] = value(formData, "categoryBundle").split("|||");
  const categoryId = slugify(value(formData, "newCategoryTitle") || selectedCategoryId || "uploaded-products");
  const categoryTitle = value(formData, "newCategoryTitle") || selectedCategoryTitle || "Uploaded Products";
  const image = await fileToDataUrl(formData.get("image"));

  await saveCmsItem({
    type: "product",
    slug,
    title,
    shortTitle: value(formData, "shortTitle") || title,
    categoryId,
    categoryTitle,
    summary: value(formData, "summary"),
    overview: value(formData, "overview"),
    application: value(formData, "application"),
    image,
    imageAlt: value(formData, "imageAlt") || `${title} product image`,
    features: parseLines(value(formData, "features")),
    specifications: parseSpecifications(value(formData, "specifications")),
    publishedAt: new Date().toISOString(),
    status: "draft"
  });

  return Response.redirect(new URL("/admin/products?saved=draft", request.url), 303);
}
