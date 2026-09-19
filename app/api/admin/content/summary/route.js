import { products, productCategories } from "@/data/catalog";
import { requireAdminApi } from "@/lib/adminApi";
import { cmsStorageMode, getCmsContentSummary } from "@/lib/cmsStore";
import { getEnquiriesPage } from "@/lib/enquiryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const [contentSummary, enquiries] = await Promise.all([
    getCmsContentSummary(),
    getEnquiriesPage({ pageSize: 25 })
  ]);

  return Response.json({
    products: products.length,
    categories: productCategories.length,
    cmsProducts: contentSummary.product,
    newsPosts: contentSummary.news,
    cmsNews: contentSummary.news,
    blogPosts: contentSummary.blog,
    enquiries: enquiries.meta.total,
    cmsStorageMode: cmsStorageMode()
  });
}
