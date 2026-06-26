import { products, productCategories } from "@/data/catalog";
import { getPublishedPosts } from "@/data/blog";
import { adminAccountStorageMode } from "@/lib/adminAccountStore";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot, getLatestSyncStatus } from "@/lib/analyticsStore";
import { cmsStorageMode, getCmsItems } from "@/lib/cmsStore";
import { enquiryStorageMode, getEnquiries } from "@/lib/enquiryStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminOverviewRealtime } from "@/components/admin/AdminRealtimePanels";
import AdminSyncStatus from "@/components/admin/AdminSyncStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据总览 | Cowinmagnet.cl Admin" };

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const [uploadedProducts, newsPosts, enquiries, analytics, syncStatus] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getEnquiries(),
    getAnalyticsSnapshot(range),
    getLatestSyncStatus()
  ]);
  const blogPosts = await getPublishedPosts("es-cl");

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">数据总览</p>
          <h1>南美网站数据后台</h1>
          <p>同步产品、新闻、询盘、访客、页面表现和来源渠道，后台功能结构对齐主站。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminSyncStatus
        initialStatus={{
          ...syncStatus,
          intervalMinutes: 30,
          analytics: analytics.storageMode,
          cms: cmsStorageMode(),
          enquiries: enquiryStorageMode()
        }}
      />
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
          <p>生产环境使用 DATABASE_URL、CMS_TABLE_PREFIX 和后台环境变量，内容、询盘、访客数据都会持久化到 PostgreSQL。</p>
        </article>
      </section>
    </>
  );
}
