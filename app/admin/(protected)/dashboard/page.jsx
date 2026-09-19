import { products, productCategories } from "@/data/catalog";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import { getCmsItemsPage } from "@/lib/cmsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminOverviewRealtime } from "@/components/admin/AdminRealtimePanels";

const t = {
  title: "\u5357\u7f8e\u7ad9\u7f51\u7ad9\u6570\u636e\u540e\u53f0",
  eyebrow: "\u6570\u636e\u6982\u89c8",
  desc: "\u67e5\u770b\u8bbf\u95ee\u3001\u5ba2\u6237\u7ebf\u7d22\u3001\u5185\u5bb9\u4e0e SEO \u8868\u73b0\u3002",
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const [uploadedProducts, newsPosts, blogPosts, analytics] = await Promise.all([
    getCmsItemsPage("product", { includeInactive: true, pageSize: 1 }),
    getCmsItemsPage("news", { includeInactive: true, pageSize: 1 }),
    getCmsItemsPage("blog", { includeInactive: true, pageSize: 1 }),
    getAnalyticsSnapshot(range),
  ]);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminOverviewRealtime
        initialData={analytics}
        contentStats={{
          products: products.length,
          categories: productCategories.length,
          cmsProducts: uploadedProducts.meta.total,
          newsPosts: newsPosts.meta.total,
          cmsNews: newsPosts.meta.total,
          blogPosts: blogPosts.meta.total
        }}
      />
    </>
  );
}
