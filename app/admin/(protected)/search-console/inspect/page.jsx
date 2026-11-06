import Link from "next/link";
import { requireAdminSession } from "@/lib/adminAuth";
import AdminCanonicalAudit from "@/components/admin/AdminCanonicalAudit";

export const metadata = { title: "网址检查 | Cowinmagnet.cl" };

export default async function AdminCanonicalAuditPage() {
  await requireAdminSession();
  return <>
    <section className="admin-page-head"><div>
      <Link className="admin-detail-link" href="/admin/search-console">返回搜索表现</Link>
      <h1>网址检查</h1>
      <p>查询 Google 已记录的规范页与最近抓取时间，每行输入一个网址。</p>
    </div></section>
    <AdminCanonicalAudit />
  </>;
}
