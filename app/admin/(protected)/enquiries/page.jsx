import { getEnquiries } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries Admin | Cowinmagnet LATAM" };

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <p className="eyebrow">Sales</p>
        <h1>Enquiries</h1>
        <p>{enquiries.length} saved records.</p>
      </div>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Company</th><th>Country</th><th>Product</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {enquiries.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.company}</td>
              <td>{item.country}</td>
              <td>{item.product || item.productRequirement}</td>
              <td>{item.status}</td>
              <td>{item.createdAt || item.submittedAt}</td>
            </tr>
          ))}
          {!enquiries.length ? <tr><td colSpan="7">No enquiries yet.</td></tr> : null}
        </tbody>
      </table>
    </section>
  );
}
