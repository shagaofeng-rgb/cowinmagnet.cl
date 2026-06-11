import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminTrafficPanel } from "@/components/admin/AdminAnalyticsPanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "流量分析 | Cowinmagnet LATAM" };

export default async function AdminAnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const analytics = await getAnalyticsSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">流量分析</p>
          <h1>访问来源与设备分布</h1>
          <p>按时间范围查看渠道、来源平台、国家地区、浏览器和设备表现。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminTrafficPanel data={analytics} />
    </>
  );
}
