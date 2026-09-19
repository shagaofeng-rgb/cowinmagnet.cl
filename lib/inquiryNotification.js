export const INQUIRY_NOTIFICATION_RECIPIENT = "info@cowinmagnet.com";
export const INQUIRY_NOTIFICATION_FROM = "Cowinmagnet.cl Website <info@cowinmagnet.com>";
export const INQUIRY_NOTIFICATION_SITE = "cowinmagnet.cl";

export function buildInquiryNotification(inquiry) {
  const source = inquiry.sourceUrl || inquiry.sourcePage || "Not provided";
  const name = String(inquiry.name || "Unknown contact").trim() || "Unknown contact";

  return {
    to: INQUIRY_NOTIFICATION_RECIPIENT,
    from: INQUIRY_NOTIFICATION_FROM,
    replyTo: inquiry.email || undefined,
    subject: `[${INQUIRY_NOTIFICATION_SITE} website] New form inquiry — ${name}`,
    text: [
      `Website: ${INQUIRY_NOTIFICATION_SITE}`,
      "Submission type: Customer form inquiry",
      `Source page: ${source}`,
      `Submitted at: ${inquiry.createdAt || inquiry.submittedAt || new Date().toISOString()}`,
      "",
      "Customer submission:",
      JSON.stringify(inquiry, null, 2)
    ].join("\n")
  };
}
