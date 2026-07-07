import { getAdminDateRange } from "@/lib/adminDateRange";
import { getSearchConsoleSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import AdminSearchConsoleLivePanel from "@/components/admin/AdminSearchConsoleLivePanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "SEO 数据 | Cowinmagnet.cl Admin" };

export default async function AdminSearchConsolePage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const searchConsole = await getSearchConsoleSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">SEO 数据</p>
          <h1>搜索表现与收录状态</h1>
          <p>用于接入 Search Console 的点击、展示、CTR、排名和收录状态。未配置 GSC 时显示站内占位快照。</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminSearchConsoleLivePanel searchConsole={searchConsole} />
    </>
  );
}
