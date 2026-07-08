import Link from "next/link";
import AdminPasswordField from "@/components/admin/AdminPasswordField";
import { getConfiguredAdminEmail } from "@/lib/adminAccountStore";
import { isAdminAuthConfigured } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const metadata = { title: "后台登录 | Cowinmagnet.cl" };

const errorMessages = {
  invalid: "账号或密码不正确。",
  "not-configured": "后台密码尚未配置，请先配置 ADMIN_PASSWORD_HASH、ADMIN_PASSWORD 或 ADMIN_DEFAULT_PASSWORD。",
  "rate-limited": "登录失败次数过多，请稍后再试。"
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const configured = await isAdminAuthConfigured();

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link className="admin-login-brand" href="/es-cl">
          <span>CY</span>
          <strong>Cowinmagnet LATAM</strong>
        </Link>
        <p className="eyebrow">海外 B2B 网站管理后台</p>
        <h1>后台登录</h1>
        <p className="admin-login-copy">管理产品、新闻、询盘、访问数据、SEO 数据和南美站点设置。</p>
        {!configured ? <div className="admin-alert">后台登录尚未启用，请先配置管理员密码。</div> : null}
        {error ? <div className="admin-alert">{errorMessages[error] || "登录失败。"}</div> : null}
        {params?.reset === "success" ? <div className="admin-alert success">密码已更新，请重新登录。</div> : null}
        <form className="admin-login-form" action="/api/admin/login" method="post">
          <label>
            账号邮箱
            <input name="email" type="email" defaultValue={getConfiguredAdminEmail()} autoComplete="username" required />
          </label>
          <AdminPasswordField />
          <label className="admin-checkbox-row">
            <input name="remember" type="checkbox" defaultChecked />
            <span>记住登录状态</span>
          </label>
          <button type="submit" disabled={!configured}>
            登录
          </button>
        </form>
        <Link href="/admin/forgot-password">忘记密码？</Link>
      </section>
    </main>
  );
}
