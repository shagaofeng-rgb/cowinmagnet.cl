import { products, productCategories } from "@/data/catalog";
import { getPublishedPosts } from "@/data/blog";
import { adminAccountStorageMode } from "@/lib/adminAccountStore";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import { cmsStorageMode, getCmsItems } from "@/lib/cmsStore";
import { enquiryStorageMode, getEnquiries } from "@/lib/enquiryStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminOverviewRealtime } from "@/components/admin/AdminRealtimePanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据总览 | Cowinmagnet.cl Admin" };

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const [uploadedProducts, newsPosts, enquiries, analytics] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getEnquiries(),
    getAnalyticsSnapshot(range)
  ]);
  const blogPosts = await getPublishedPosts("es-cl");

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">数据总览</p>
          <h1>南美网站数据后台</h1>
          <p>同步产品、新闻、询盘、访客、页面表现和来源渠道，功能结构对齐主站后台。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminOverviewRealtime
        initialData={analytics}
        contentStats={{
          products: products.length,
          categories: productCategories.length,
          cmsProducts: uploadedProducts.length,
          newsPosts: newsPosts.length,
          cmsNews: newsPosts.length,
          blogPosts: blogPosts.length,
          enquiries: enquiries.length,
          cmsStorageMode: cmsStorageMode()
        }}
      />
      <section className="admin-grid">
        <article>
          <h3>存储连接</h3>
          <p>CMS：{cmsStorageMode()}</p>
          <p>询盘：{enquiryStorageMode()}</p>
          <p>账号：{adminAccountStorageMode()}</p>
        </article>
        <article>
          <h3>上线接入</h3>
          <p>部署到 Vercel 后使用 DATABASE_URL、CMS_TABLE_PREFIX 和后台环境变量，线上数据会持久化到 PostgreSQL。</p>
        </article>
      </section>
    </>
  );
}
