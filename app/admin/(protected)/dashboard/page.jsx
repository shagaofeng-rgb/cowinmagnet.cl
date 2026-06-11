import { products, productCategories } from "@/data/catalog";
import { adminAccountStorageMode } from "@/lib/adminAccountStore";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import { cmsStorageMode, getCmsItems } from "@/lib/cmsStore";
import { enquiryStorageMode, getEnquiries } from "@/lib/enquiryStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminOverviewPanel } from "@/components/admin/AdminAnalyticsPanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据总览 | Cowinmagnet LATAM" };

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const [uploadedProducts, enquiries, analytics] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getEnquiries(),
    getAnalyticsSnapshot(range)
  ]);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">数据总览</p>
          <h1>南美网站数据后台</h1>
          <p>同步产品、询盘、访客、页面表现和来源渠道，功能结构对齐主站后台。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminOverviewPanel
        data={analytics}
        contentStats={{
          products: products.length,
          categories: productCategories.length,
          cmsProducts: uploadedProducts.length,
          enquiries: enquiries.length
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
          <p>部署到 Vercel 后配置 DATABASE_URL，即可切换为 PostgreSQL 数据库持久化。</p>
        </article>
      </section>
    </>
  );
}
