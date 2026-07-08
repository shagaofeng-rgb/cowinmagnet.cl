import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "系统设置 | Cowinmagnet.cl 后台" };

function masked(value) {
  return value ? "已配置" : "未配置";
}

export default function AdminSettingsPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">系统设置</p>
          <h1>环境、邮件、数据源与安全配置</h1>
          <p>敏感配置通过 Vercel 环境变量管理，后台只显示配置状态，不返回完整密钥或密码。</p>
        </div>
      </div>
      <div className="admin-grid">
        <article className="admin-panel">
          <h3>数据库</h3>
          <p>DATABASE_URL：{masked(process.env.DATABASE_URL)}</p>
          <p>CMS 存储：{cmsStorageMode()}</p>
          <p>询盘存储：{enquiryStorageMode()}</p>
        </article>
        <article className="admin-panel">
          <h3>管理员</h3>
          <p>ADMIN_EMAIL：{process.env.ADMIN_EMAIL || "davidsha@cowinmagnet.com"}</p>
          <p>密码来源：环境变量或数据库中的管理员账号。</p>
        </article>
        <article className="admin-panel">
          <h3>邮件通知</h3>
          <p>INQUIRY_TO_EMAIL：{masked(process.env.INQUIRY_TO_EMAIL)}</p>
          <p>SMTP_HOST：{masked(process.env.SMTP_HOST)}</p>
          <p>SMTP_USER：{masked(process.env.SMTP_USER)}</p>
        </article>
        <article className="admin-panel">
          <h3>SEO 数据源</h3>
          <p>Search Console 站点：{masked(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL)}</p>
          <p>Google 服务账号：{masked(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || process.env.GOOGLE_SERVICE_ACCOUNT_JSON)}</p>
        </article>
      </div>
    </section>
  );
}
