import { getLatestSyncStatus } from "@/lib/analyticsStore";
import AdminSyncStatus from "@/components/admin/AdminSyncStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据状态 | Cowinmagnet.cl" };

export default async function AdminSyncPage() {
  const syncStatus = await getLatestSyncStatus();
  return <>
    <section className="admin-page-head"><div><p className="eyebrow">数据状态</p><h1>网站数据更新状态</h1><p>查看最近一次数据处理结果与更新时间。</p></div></section>
    <AdminSyncStatus initialStatus={syncStatus} />
  </>;
}
