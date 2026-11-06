import { after } from "next/server";
import { saveEnquiry, updateEnquiryNotification } from "@/lib/enquiryStore";
import { appendAnalyticsEvent } from "@/lib/analyticsStore";
import { hashIp } from "@/lib/analyticsPolicy";
import { deliverInquiryNotification, isInquiryEmailConfigured } from "@/lib/inquiryEmail";
import { normalizeInquiry } from "@/lib/inquiryInput";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const MAX_BYTES = 32_768;

function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

async function readInquiry(request) {
  const type = request.headers.get("content-type") || "";
  if (/^(?:multipart\/form-data|application\/x-www-form-urlencoded)\b/i.test(type)) {
    return Object.fromEntries(await request.formData());
  }
  const body = await request.text();
  if (Buffer.byteLength(body) > MAX_BYTES) return null;
  return JSON.parse(body);
}

export async function POST(request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ success: false }, { status: 403 });
  if (Number(request.headers.get("content-length")) > MAX_BYTES) {
    return Response.json({ success: false, error: "Form is too large." }, { status: 413 });
  }
  const raw = await readInquiry(request).catch(() => null);
  const { payload, errors, submissionId } = normalizeInquiry(raw);
  if (Object.keys(errors).length) return Response.json({ success: false, error: "Validation failed", errors }, { status: 400 });

  const contact = (payload.email || payload.whatsapp).toLowerCase();
  const rateKey = hashIp(clientIp(request) + ":" + contact);
  const sendNow = isInquiryEmailConfigured();
  let saved;
  try {
    saved = await saveEnquiry(payload, { submissionId, rateKey, sendNow });
  } catch (error) {
    console.error("[inquiry] persistence failed", error?.message || error);
    return Response.json({ success: false, error: "The inquiry service is temporarily unavailable. Please try again." }, { status: 503 });
  }
  if (saved.limited) return Response.json({ success: false, error: "Too many submissions." }, { status: 429 });

  const { id, status, createdAt } = saved.item;
  if (saved.inserted) {
    await appendAnalyticsEvent({
      id: "inquiry-" + id,
      type: "form_submit",
      visitorId: payload.visitorId || "lead-" + id,
      sessionId: payload.sessionId || "lead-" + id,
      page: payload.sourcePage || "/",
      pageTitle: "Inquiry submission",
      country: payload.country,
      channel: payload.channel, sourcePlatform: payload.sourcePlatform, utmCampaign: payload.utmCampaign,
      language: payload.language || "",
      userAgent: request.headers.get("user-agent") || "",
      device: /mobile|android|iphone/i.test(request.headers.get("user-agent") || "") ? "Mobile" : "Desktop",
      host: request.headers.get("host") || "",
      isTest: Boolean(payload.isTest),
      timestamp: createdAt
    }).catch((error) => console.error("[inquiry] analytics event failed", error?.message || error));

    if (sendNow) {
      after(async () => {
        const notification = await deliverInquiryNotification(saved.item);
        await updateEnquiryNotification(id, notification).catch((error) => console.error("[inquiry] notification status persistence failed", error?.message || error));
        if (notification.status === "failed") console.error("[inquiry] notification email requires retry", notification.error);
      });
    }
  }

  return Response.json({ success: true, data: { id, status, createdAt } });
}
