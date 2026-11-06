import { getPendingEnquiryNotifications, updateEnquiryNotification } from "@/lib/enquiryStore";
import { deliverInquiryNotification, isInquiryEmailConfigured } from "@/lib/inquiryEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 55;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isInquiryEmailConfigured()) {
    return Response.json({ success: false, processed: 0, failed: 0, status: "not_configured" });
  }
  const pending = await getPendingEnquiryNotifications({ limit: 8 });
  const outcomes = [];
  for (let start = 0; start < pending.length; start += 4) {
    outcomes.push(...await Promise.allSettled(pending.slice(start, start + 4).map(async (inquiry) => {
      const notification = await deliverInquiryNotification(inquiry);
      await updateEnquiryNotification(inquiry.id, notification);
      return notification.status;
    })));
  }
  const failed = outcomes.filter((item) => item.status !== "fulfilled" || item.value !== "delivered").length;
  console.log("[inquiry-notifications]", JSON.stringify({ processed: outcomes.length, failed }));
  return Response.json({ success: failed === 0, processed: outcomes.length, failed });
}
