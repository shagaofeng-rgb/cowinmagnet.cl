import { getEnquiries } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "客户表单 | Cowinmagnet.cl 后台" };

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">客户表单</p>
          <h1>询盘与客户线索</h1>
          <p>当前保存 {enquiries.length} 条表单记录。表单数据持久化保存，通知失败不会影响入库。</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>编号</th><th>姓名</th><th>公司</th><th>国家</th><th>产品</th><th>状态</th><th>提交时间</th></tr></thead>
          <tbody>
            {enquiries.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.company}</td>
                <td>{item.country}</td>
                <td>{item.product || item.productRequirement}</td>
                <td>{item.status || "新询盘"}</td>
                <td>{item.createdAt || item.submittedAt}</td>
              </tr>
            ))}
            {!enquiries.length ? <tr><td colSpan="7">暂无询盘。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
