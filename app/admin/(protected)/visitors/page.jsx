import { getAdminDateRange } from "@/lib/adminDateRange";
import { requireAdminSession } from "@/lib/adminAuth";
import { getAnalyticsVisitors } from "@/lib/analyticsStore";
import { parseAnalyticsFilters } from "@/lib/analyticsPolicy";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminVisitorsRealtime } from "@/components/admin/AdminRealtimePanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "访客记录 | Cowinmagnet.cl Admin" };

export default async function AdminVisitorsPage({ searchParams }) {
  await requireAdminSession();
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const analytics = await getAnalyticsVisitors(range, parseAnalyticsFilters(params));

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">访客记录</p>
          <h1>近期客户访问记录</h1>
          <p>按访客查看来源、访问次数和完整路径。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminVisitorsRealtime initialData={analytics} />
    </>
  );
}
