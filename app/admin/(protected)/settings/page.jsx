import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Settings | Cowinmagnet LATAM" };

export default function AdminSettingsPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <p className="eyebrow">System</p>
        <h1>Settings</h1>
        <p>Environment-driven settings, matching the main Cowinmagnet backend pattern.</p>
      </div>
      <div className="admin-grid">
        <article><h3>Database</h3><p>DATABASE_URL: {process.env.DATABASE_URL ? "configured" : "not configured"}</p><p>CMS mode: {cmsStorageMode()}</p><p>Enquiry mode: {enquiryStorageMode()}</p></article>
        <article><h3>Admin</h3><p>ADMIN_EMAIL: {process.env.ADMIN_EMAIL || "davidsha@cowinmagnet.com"}</p><p>Password source: environment variable or stored local account.</p></article>
        <article><h3>Email</h3><p>INQUIRY_TO_EMAIL: {process.env.INQUIRY_TO_EMAIL ? "configured" : "not configured"}</p><p>SMTP_HOST: {process.env.SMTP_HOST ? "configured" : "not configured"}</p></article>
      </div>
    </section>
  );
}
