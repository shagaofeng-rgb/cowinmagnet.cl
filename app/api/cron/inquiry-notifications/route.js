import { getPendingEnquiryNotifications, updateEnquiryNotification } from "@/lib/enquiryStore";
import { deliverInquiryNotification } from "@/lib/inquiryEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 55;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const pending = await getPendingEnquiryNotifications({ limit: 10 });
  const outcomes = [];
  for (const inquiry of pending) {
    const notification = await deliverInquiryNotification(inquiry);
    await updateEnquiryNotification(inquiry.id, notification);
    outcomes.push({ id: inquiry.id, status: notification.status });
  }
  const failed = outcomes.filter((item) => item.status === "failed" || item.status === "not_configured").length;
  console.log("[inquiry-notifications]", JSON.stringify({ processed: outcomes.length, failed }));
  return Response.json({ success: failed === 0, processed: outcomes.length, failed });
}
