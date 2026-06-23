import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminPagesRealtime } from "@/components/admin/AdminRealtimePanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "页面表现 | Cowinmagnet.cl Admin" };

export default async function AdminPagesPerformancePage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const analytics = await getAnalyticsSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">页面表现</p>
          <h1>页面访问与转化表现</h1>
          <p>查看每个落地页的浏览量、访客数、平均停留和询盘转化。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminPagesRealtime initialData={analytics} />
    </>
  );
}
