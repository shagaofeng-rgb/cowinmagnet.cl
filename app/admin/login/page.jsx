import Link from "next/link";
import AdminPasswordField from "@/components/admin/AdminPasswordField";
import { getConfiguredAdminEmail } from "@/lib/adminAccountStore";
import { isAdminAuthConfigured } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Login | Cowinmagnet LATAM" };

const errorMessages = {
  invalid: "Email or password is incorrect.",
  "not-configured": "Admin password is not configured. Set ADMIN_PASSWORD_HASH, ADMIN_PASSWORD or ADMIN_DEFAULT_PASSWORD.",
  "rate-limited": "Too many login attempts. Please try again later."
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
        <p className="eyebrow">Website data backend</p>
        <h1>Admin Login</h1>
        <p className="admin-login-copy">
          Manage products, uploaded content, enquiries and South America site settings.
        </p>
        {!configured ? <div className="admin-alert">Admin login is not enabled yet. Configure an admin password first.</div> : null}
        {error ? <div className="admin-alert">{errorMessages[error] || "Login failed."}</div> : null}
        {params?.reset === "success" ? <div className="admin-alert success">Password updated. Please sign in again.</div> : null}
        <form className="admin-login-form" action="/api/admin/login" method="post">
          <label>
            Email
            <input name="email" type="email" defaultValue={getConfiguredAdminEmail()} required />
          </label>
          <AdminPasswordField />
          <button type="submit" disabled={!configured}>
            Login
          </button>
        </form>
        <Link href="/admin/forgot-password">Forgot password?</Link>
      </section>
    </main>
  );
}
