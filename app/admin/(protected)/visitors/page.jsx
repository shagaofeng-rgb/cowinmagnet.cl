import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminVisitorsRealtime } from "@/components/admin/AdminRealtimePanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "访客记录 | Cowinmagnet.cl Admin" };

export default async function AdminVisitorsPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const analytics = await getAnalyticsSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">访客记录</p>
          <h1>近期客户访问记录</h1>
          <p>系统默认匿名化 IP，同时保留国家地区、设备、浏览器、来源渠道和页面路径等运营信号。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminVisitorsRealtime initialData={analytics} />
    </>
  );
}
