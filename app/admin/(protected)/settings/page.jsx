import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

const t = {
  eyebrow: "\u7cfb\u7edf\u8bbe\u7f6e",
  title: "\u73af\u5883\u3001\u90ae\u4ef6\u3001\u6570\u636e\u6e90\u4e0e\u5b89\u5168\u914d\u7f6e",
  desc: "\u540e\u53f0\u53ea\u663e\u793a\u914d\u7f6e\u72b6\u6001\uff0c\u4e0d\u8fd4\u56de\u5b8c\u6574\u5bc6\u94a5\u6216\u5bc6\u7801\u3002",
  configured: "\u5df2\u914d\u7f6e",
  missing: "\u672a\u914d\u7f6e",
  database: "\u6570\u636e\u5e93",
  admin: "\u7ba1\u7406\u5458",
  email: "\u90ae\u4ef6\u901a\u77e5",
  seo: "SEO \u6570\u636e\u6e90",
  passwordSource: "\u5bc6\u7801\u6765\u6e90\uff1a\u73af\u5883\u53d8\u91cf\u6216\u6570\u636e\u5e93\u7ba1\u7406\u5458\u8d26\u53f7\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

function masked(value) {
  return value ? t.configured : t.missing;
}

export default function AdminSettingsPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
      </div>
      <div className="admin-grid">
        <article className="admin-panel">
          <h3>{t.database}</h3>
          <p>DATABASE_URL: {masked(process.env.DATABASE_URL)}</p>
          <p>CMS: {cmsStorageMode()}</p>
          <p>{t.email}: {enquiryStorageMode()}</p>
        </article>
        <article className="admin-panel">
          <h3>{t.admin}</h3>
          <p>ADMIN_EMAIL: {process.env.ADMIN_EMAIL || "davidsha@cowinmagnet.com"}</p>
          <p>{t.passwordSource}</p>
        </article>
        <article className="admin-panel">
          <h3>{t.email}</h3>
          <p>INQUIRY_TO_EMAIL: {masked(process.env.INQUIRY_TO_EMAIL)}</p>
          <p>SMTP_HOST: {masked(process.env.SMTP_HOST)}</p>
          <p>SMTP_USER: {masked(process.env.SMTP_USER)}</p>
        </article>
        <article className="admin-panel">
          <h3>{t.seo}</h3>
          <p>Search Console: {masked(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL)}</p>
          <p>Google Service Account: {masked(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || process.env.GOOGLE_SERVICE_ACCOUNT_JSON)}</p>
        </article>
      </div>
    </section>
  );
}
