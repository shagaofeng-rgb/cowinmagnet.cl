import { products, productCategories } from "@/data/catalog";
import { requireAdminApi } from "@/lib/adminApi";
import { cmsStorageMode, getCmsItems } from "@/lib/cmsStore";
import { getEnquiries } from "@/lib/enquiryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const [cmsProducts, cmsNews, cmsBlogs, enquiries] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getCmsItems("blog", { includeInactive: true }),
    getEnquiries()
  ]);

  return Response.json({
    products: products.length,
    categories: productCategories.length,
    cmsProducts: cmsProducts.length,
    newsPosts: cmsNews.length,
    cmsNews: cmsNews.length,
    blogPosts: cmsBlogs.length,
    enquiries: enquiries.length,
    cmsStorageMode: cmsStorageMode()
  });
}
