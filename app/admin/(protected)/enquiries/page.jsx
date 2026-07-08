import { getEnquiries } from "@/lib/enquiryStore";

const t = {
  eyebrow: "\u5ba2\u6237\u8868\u5355",
  title: "\u8be2\u76d8\u4e0e\u5ba2\u6237\u7ebf\u7d22",
  saved: "\u5f53\u524d\u4fdd\u5b58",
  records: "\u6761\u8868\u5355\u8bb0\u5f55",
  desc: "\u8868\u5355\u6570\u636e\u6301\u4e45\u5316\u4fdd\u5b58\uff0c\u901a\u77e5\u5931\u8d25\u4e0d\u5f71\u54cd\u5165\u5e93\u3002",
  id: "\u7f16\u53f7",
  name: "\u59d3\u540d",
  company: "\u516c\u53f8",
  country: "\u56fd\u5bb6",
  product: "\u4ea7\u54c1",
  status: "\u72b6\u6001",
  date: "\u63d0\u4ea4\u65f6\u95f4",
  newLead: "\u65b0\u8be2\u76d8",
  empty: "\u6682\u65e0\u8be2\u76d8\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.saved} {enquiries.length} {t.records}。{t.desc}</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t.id}</th><th>{t.name}</th><th>{t.company}</th><th>{t.country}</th><th>{t.product}</th><th>{t.status}</th><th>{t.date}</th></tr></thead>
          <tbody>
            {enquiries.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.company}</td>
                <td>{item.country}</td>
                <td>{item.product || item.productRequirement}</td>
                <td>{item.status || t.newLead}</td>
                <td>{item.createdAt || item.submittedAt}</td>
              </tr>
            ))}
            {!enquiries.length ? <tr><td colSpan="7">{t.empty}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
