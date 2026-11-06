import { getOperationsStatus } from "@/lib/operationsStatus";
import { requireAdminSession } from "@/lib/adminAuth";
import AdminSyncStatus from "@/components/admin/AdminSyncStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据状态 | Cowinmagnet.cl" };

export default async function AdminSyncPage() {
  await requireAdminSession();
  const syncStatus = await getOperationsStatus();
  return <>
    <section className="admin-page-head"><div><h1>数据与通知状态</h1><p>查看流量、Google、内容和询价邮件的更新时间。</p></div></section>
    <AdminSyncStatus initialStatus={syncStatus} />
  </>;
}
