import nodemailer from "nodemailer";

function smtpPassword() {
  return process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";
}

function smtpFrom() {
  return process.env.SMTP_FROM || process.env.INQUIRY_FROM_EMAIL || "";
}

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && smtpPassword() && smtpFrom());
}

export function createSmtpTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE || "true") !== "false",
    auth: { user: process.env.SMTP_USER, pass: smtpPassword() }
  });
}

export async function sendAdminPasswordResetEmail({ to, resetUrl }) {
  if (!isSmtpConfigured()) {
    console.warn("Admin password reset email skipped because SMTP is not configured.");
    return { sent: false, reason: "smtp-not-configured" };
  }

  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from: smtpFrom(),
    to,
    subject: "Reset Cowinmagnet.cl Admin Password",
    text: [
      "Hello,",
      "",
      "We received a request to reset your Cowinmagnet.cl admin password.",
      "Open this link within 60 minutes:",
      resetUrl,
      "",
      "If you did not request this, please ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.65">
        <h2>Reset Cowinmagnet.cl Admin Password</h2>
        <p>We received a request to reset your admin password.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#facc15;color:#0f172a;font-weight:700;text-decoration:none">Reset Password</a></p>
        <p style="word-break:break-all;color:#475569">${resetUrl}</p>
        <p>This link expires in 60 minutes.</p>
      </div>
    `
  });

  return { sent: true };
}
