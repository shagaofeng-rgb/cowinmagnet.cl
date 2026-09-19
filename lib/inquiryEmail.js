import nodemailer from "nodemailer";
import { buildInquiryNotification } from "@/lib/inquiryNotification";

function configured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASSWORD || process.env.SMTP_PASS));
}

function safeError(error) {
  const message = String(error?.message || "").replace(/[\r\n]+/g, " ").slice(0, 180);
  return message || "Mail delivery was not accepted by the mail server.";
}

export async function deliverInquiryNotification(inquiry) {
  const attempts = Number(inquiry.notification?.attempts || 0) + 1;
  if (!configured()) {
    return { status: "not_configured", attempts, deliveredAt: "", error: "Email notification is not configured." };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS }
    });
    const notification = buildInquiryNotification(inquiry);
    const result = await transporter.sendMail({
      ...notification,
      from: process.env.INQUIRY_FROM_EMAIL || notification.from
    });
    return {
      status: "delivered",
      attempts,
      deliveredAt: new Date().toISOString(),
      error: "",
      messageId: String(result.messageId || "").slice(0, 180)
    };
  } catch (error) {
    return { status: "failed", attempts, deliveredAt: "", error: safeError(error) };
  }
}
