import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminJourneysRealtime } from "@/components/admin/AdminRealtimePanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "访问路径 | Cowinmagnet.cl Admin" };

export default async function AdminJourneysPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const analytics = await getAnalyticsSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">访问路径</p>
          <h1>客户浏览路径</h1>
          <p>统计客户从入口页到产品页、报价页等关键页面的流转路径。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminJourneysRealtime initialData={analytics} />
    </>
  );
}
