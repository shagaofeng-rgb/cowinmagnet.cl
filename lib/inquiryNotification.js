export const INQUIRY_NOTIFICATION_RECIPIENT = "info@cowinmagnet.com";
export const INQUIRY_NOTIFICATION_FROM = "Cowinmagnet.cl Website <info@cowinmagnet.com>";
export const INQUIRY_NOTIFICATION_SITE = "cowinmagnet.cl";

const contactFields = [
  ["name", "Name"], ["company", "Company"], ["country", "Country"], ["region", "Region"],
  ["email", "Email"], ["whatsapp", "Phone / WhatsApp"], ["language", "Language"],
  ["product", "Product"], ["model", "Model"], ["industry", "Industry"], ["material", "Material"],
  ["capacity", "Capacity"], ["maxSize", "Particle size"], ["beltWidth", "Belt width"],
  ["beltSpeed", "Belt speed"], ["layerThickness", "Material depth"], ["suspensionHeight", "Suspension height"],
  ["installation", "Installation"], ["cleaning", "Cleaning"], ["altitude", "Altitude"],
  ["temperature", "Temperature"], ["voltage", "Voltage"], ["frequency", "Frequency"], ["phases", "Phases"],
  ["projectDescription", "Project details"]
];

export function buildInquiryNotification(inquiry) {
  const source = inquiry.sourceUrl || inquiry.sourcePage || "Not provided";
  const name = String(inquiry.name || "Unknown contact").replace(/[\r\n]+/g, " ").trim() || "Unknown contact";
  const messageId = /^[A-Za-z0-9-]+$/.test(inquiry.id || "") ? "<" + inquiry.id + "@cowinmagnet.cl>" : undefined;

  return {
    to: INQUIRY_NOTIFICATION_RECIPIENT,
    from: INQUIRY_NOTIFICATION_FROM,
    replyTo: inquiry.email || undefined,
    messageId,
    subject: `[${INQUIRY_NOTIFICATION_SITE} website] New form inquiry — ${name}`,
    text: [
      `Website: ${INQUIRY_NOTIFICATION_SITE}`,
      "Submission type: Customer form inquiry",
      `Source page: ${source}`,
      `Submitted at: ${inquiry.createdAt || inquiry.submittedAt || new Date().toISOString()}`,
      "Reference: " + (inquiry.id || "-"),
      "",
      "Customer submission:",
      ...contactFields.filter(([field]) => inquiry[field]).map(([field, label]) => label + ": " + inquiry[field])
    ].join("\n")
  };
}
