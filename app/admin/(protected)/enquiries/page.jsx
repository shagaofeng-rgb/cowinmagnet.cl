import Link from "next/link";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminListControls, AdminListPagination } from "@/components/admin/AdminListControls";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getEnquiriesPage } from "@/lib/enquiryStore";

const t = {
  eyebrow: "客户表单", title: "询盘与客户线索", saved: "当前保存", records: "条表单记录",
  desc: "表单数据持久化保存；支持按自然时间、状态与关键词查询。", id: "编号", name: "姓名", company: "公司",
  country: "国家", product: "产品", status: "状态", date: "提交时间", newLead: "新询盘", empty: "暂无询盘。"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminEnquiriesPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const enquiries = await getEnquiriesPage({
    range, page: params?.page, pageSize: params?.pageSize, query: params?.query, status: params?.status
  });

  return <section className="admin-panel">
    <div className="admin-page-head">
      <div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.saved} {enquiries.meta.total} {t.records}。{t.desc}</p></div>
      <AdminDateRangeFilter range={range} />
    </div>
    <AdminListControls searchLabel="搜索姓名、公司、国家、邮箱、产品或编号" statusOptions={[{ value: "New", label: "新询盘" }, { value: "In progress", label: "跟进中" }, { value: "Closed", label: "已关闭" }]} />
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t.id}</th><th>{t.name}</th><th>{t.company}</th><th>{t.country}</th><th>{t.product}</th><th>{t.status}</th><th>{t.date}</th><th>访问归属</th></tr></thead><tbody>
      {enquiries.items.map((item) => <tr key={item.id}>
        <td>{item.id}</td><td>{item.name || "-"}</td><td>{item.company || "-"}</td><td>{item.country || "-"}</td>
        <td>{item.product || item.productRequirement || "-"}</td><td>{item.status || t.newLead}</td><td>{item.createdAt || item.submittedAt || "-"}</td>
        <td>{item.visitorId ? <Link className="admin-visitor-link" href={`/admin/visitors/${encodeURIComponent(item.visitorId)}`}>查看路径</Link> : "未关联"}</td>
      </tr>)}
      {!enquiries.items.length ? <tr><td colSpan="8">{t.empty}</td></tr> : null}
    </tbody></table></div>
    <AdminListPagination meta={enquiries.meta} itemLabel="条询盘" />
  </section>;
}
