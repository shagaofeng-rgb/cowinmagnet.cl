import { getAdminDateRange } from "@/lib/adminDateRange";
import { getAnalyticsSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminSearchConsolePanel } from "@/components/admin/AdminAnalyticsPanels";

export const dynamic = "force-dynamic";
export const metadata = { title: "SEO 数据 | Cowinmagnet LATAM" };

export default async function AdminSearchConsolePage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const analytics = await getAnalyticsSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">SEO 数据</p>
          <h1>搜索表现与收录状态</h1>
          <p>用于接入 Search Console 的点击、展示、CTR、排名和收录状态。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminSearchConsolePanel data={analytics} />
    </>
  );
}
