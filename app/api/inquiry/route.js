import nodemailer from "nodemailer";
import { saveEnquiry } from "@/lib/enquiryStore";
import { appendAnalyticsEvent } from "@/lib/analyticsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,24}$/;
const rateLimit = globalThis.__cowinLatamInquiryRateLimit || new Map();
globalThis.__cowinLatamInquiryRateLimit = rateLimit;

function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function validate(payload) {
  const errors = {};
  const email = payload.email?.trim() || "";
  const whatsapp = payload.whatsapp?.trim() || "";
  if (!payload.name?.trim()) errors.name = "Name is required.";
  if (!payload.country?.trim()) errors.country = "Country is required.";
  if (!email && !whatsapp) errors.contact = "Email or WhatsApp is required.";
  if (email && !emailPattern.test(email)) errors.email = "Valid email is required.";
  if (whatsapp && !phonePattern.test(whatsapp)) errors.whatsapp = "Valid WhatsApp or phone is required.";
  if (!payload.product?.trim()) errors.product = "Product or requirement is required.";
  if (!payload.projectDescription?.trim()) errors.projectDescription = "Project description is required.";
  if (payload.website?.trim()) errors.website = "Spam submission blocked.";
  return errors;
}

function checkRateLimit(key) {
  const now = Date.now();
  const recent = (rateLimit.get(key) || []).filter((timestamp) => now - timestamp < 15 * 60 * 1000);
  recent.push(now);
  rateLimit.set(key, recent);
  return recent.length <= 5;
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    const formData = await request.formData().catch(() => null);
    payload = formData ? Object.fromEntries(formData.entries()) : null;
  }

  const ip = clientIp(request);
  payload = { ...(payload || {}), clientIp: ip, userAgent: request.headers.get("user-agent") || "-", submittedAt: new Date().toISOString() };
  const errors = validate(payload);
  if (Object.keys(errors).length) return Response.json({ success: false, error: "Validation failed", errors }, { status: 400 });

  const key = `${ip}:${(payload.email || payload.whatsapp || "unknown").trim().toLowerCase()}`;
  if (!checkRateLimit(key)) return Response.json({ success: false, error: "Too many submissions" }, { status: 429 });

  let saved;
  try {
    saved = await saveEnquiry(payload);
  } catch (error) {
    console.error("[inquiry] persistence failed", error?.message || error);
    return Response.json({ success: false, error: "The inquiry service is temporarily unavailable. Please try again." }, { status: 503 });
  }

  // Lead storage is authoritative. Notification and analytics failures should not
  // discard a successfully stored inquiry or tell the visitor that it was lost.
  await appendAnalyticsEvent({
    id: `inquiry-${saved.id}`,
    type: "form_submit",
    visitorId: `lead-${saved.id}`,
    sessionId: `lead-${saved.id}`,
    page: payload.sourcePage || "/",
    pageTitle: "Inquiry submission",
    country: payload.country || "Unknown",
    language: payload.language || "",
    timestamp: saved.createdAt
  }).catch((error) => console.error("[inquiry] analytics event failed", error?.message || error));

  if (process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASSWORD || process.env.SMTP_PASS) && process.env.INQUIRY_TO_EMAIL) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE !== "false",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: process.env.INQUIRY_FROM_EMAIL || "Cowinmagnet LATAM <davidsha@cowinmagnet.com>",
        to: process.env.INQUIRY_TO_EMAIL,
        replyTo: payload.email || undefined,
        subject: `New LATAM inquiry from ${payload.name}`,
        text: JSON.stringify(saved, null, 2)
      });
    } catch (error) {
      console.error("[inquiry] notification email failed after persistence", error?.message || error);
    }
  }

  return Response.json({ success: true, data: saved });
}
