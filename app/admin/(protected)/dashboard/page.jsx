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

const t = {
  title: "\u5357\u7f8e\u7ad9\u7f51\u7ad9\u6570\u636e\u540e\u53f0",
  eyebrow: "\u6570\u636e\u6982\u89c8",
  desc: "\u67e5\u770b\u8bbf\u95ee\u3001\u8be2\u76d8\u3001\u4ea7\u54c1\u3001\u65b0\u95fb\u3001SEO \u4e0e\u540c\u6b65\u72b6\u6001\u3002\u6570\u636e\u5747\u6765\u81ea\u7ad9\u5185\u91c7\u96c6\u3001CMS\u3001\u8be2\u76d8\u8868\u5355\u548c\u5df2\u914d\u7f6e\u7684\u5916\u90e8\u6570\u636e\u6e90\u3002",
  storage: "\u6570\u636e\u5b58\u50a8",
  online: "\u751f\u4ea7\u63a5\u5165",
  cms: "CMS",
  enquiries: "\u8be2\u76d8",
  account: "\u8d26\u53f7",
  onlineText: "\u7ebf\u4e0a\u73af\u5883\u901a\u8fc7 DATABASE_URL\u3001CMS_TABLE_PREFIX \u548c\u540e\u53f0\u73af\u5883\u53d8\u91cf\u8fde\u63a5\u6570\u636e\u5e93\u3001\u90ae\u4ef6\u3001Search Console \u548c\u5b9a\u65f6\u4efb\u52a1\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const [uploadedProducts, newsPosts, enquiries, analytics, syncStatus, blogPosts] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getEnquiries(),
    getAnalyticsSnapshot(range),
    getLatestSyncStatus(),
    getPublishedPosts("es-cl")
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
        <article className="admin-panel">
          <h3>{t.storage}</h3>
          <p>{t.cms}: {cmsStorageMode()}</p>
          <p>{t.enquiries}: {enquiryStorageMode()}</p>
          <p>{t.account}: {adminAccountStorageMode()}</p>
        </article>
        <article className="admin-panel">
          <h3>{t.online}</h3>
          <p>{t.onlineText}</p>
        </article>
      </section>
    </>
  );
}
