import Link from "next/link";
import { getConfiguredAdminEmail } from "@/lib/adminAccountStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "Forgot Password | Cowinmagnet.cl Admin" };

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link className="admin-login-brand" href="/es-cl"><span>CY</span><strong>Cowinmagnet.cl</strong></Link>
        <p className="eyebrow">Admin security</p>
        <h1>Reset admin password</h1>
        <p className="admin-login-copy">Enter the configured admin email. If SMTP is configured, a reset link will be sent.</p>
        {params?.sent ? <div className="admin-alert success">If this email is configured, a reset link has been sent.</div> : null}
        <form className="admin-login-form" action="/api/admin/forgot-password" method="post">
          <label>Email<input name="email" type="email" defaultValue={getConfiguredAdminEmail()} required /></label>
          <button type="submit">Send reset link</button>
        </form>
        <Link href="/admin/login">Back to login</Link>
      </section>
    </main>
  );
}
