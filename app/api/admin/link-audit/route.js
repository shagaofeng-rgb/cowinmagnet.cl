import { products, productCategories } from "@/data/catalog";
import { getPublishedPosts } from "@/data/blog";
import { requireAdminApi } from "@/lib/adminApi";
import { getCmsItems } from "@/lib/cmsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const [posts, cmsNews] = await Promise.all([
    getPublishedPosts("es-cl"),
    getCmsItems("news", { includeInactive: false })
  ]);
  const internal = [
    { label: "Home", href: "/es-cl" },
    { label: "Products", href: "/es-cl/products" },
    { label: "Applications", href: "/es-cl/industries" },
    { label: "Markets", href: "/es-cl/markets" },
    { label: "News", href: "/es-cl/blog" },
    ...productCategories.map((category) => ({ label: category.title, href: `/es-cl/products/${category.id}` })),
    ...products.map((product) => ({ label: product.title, href: `/es-cl/products/${product.categoryId}/${product.slug}` })),
    ...posts.map((post) => ({ label: post.title, href: `/es-cl/blog/${post.slug}` })),
    ...cmsNews.map((post) => ({ label: post.title, href: `/es-cl/blog/${post.slug}` }))
  ];

  const domains = new Map();
  cmsNews.forEach((item) => {
    if (!item.sourceUrl) return;
    try {
      const host = new URL(item.sourceUrl).hostname.replace(/^www\./, "");
      domains.set(host, (domains.get(host) || 0) + 1);
    } catch {
      // Ignore malformed legacy source URLs in the audit response.
    }
  });

  return Response.json({
    success: true,
    internalLinks: internal,
    externalSourceDomains: [...domains.entries()].map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count),
    totals: {
      internal: internal.length,
      products: products.length,
      categories: productCategories.length,
      newsSources: domains.size
    },
    checkedAt: new Date().toISOString()
  });
}
