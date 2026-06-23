import Link from "next/link";
import AdminPasswordField from "@/components/admin/AdminPasswordField";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reset Password | Cowinmagnet.cl Admin" };

const messages = {
  weak: "Password must be at least 10 characters and include uppercase, lowercase and a number.",
  mismatch: "Passwords do not match.",
  invalid: "The reset link is invalid or expired."
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = String(params?.token || "");

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link className="admin-login-brand" href="/es-cl"><span>CY</span><strong>Cowinmagnet.cl</strong></Link>
        <p className="eyebrow">Admin security</p>
        <h1>Set a new password</h1>
        {params?.error ? <div className="admin-alert">{messages[params.error] || "Reset failed."}</div> : null}
        <form className="admin-login-form" action="/api/admin/reset-password" method="post">
          <input name="token" type="hidden" value={token} />
          <AdminPasswordField label="New password" />
          <label>
            Confirm password
            <input name="confirmPassword" type="password" autoComplete="new-password" required />
          </label>
          <button type="submit" disabled={!token}>Update password</button>
        </form>
        <Link href="/admin/login">Back to login</Link>
      </section>
    </main>
  );
}
