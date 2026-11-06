const limits = {
  name: 140, company: 180, country: 80, region: 120, email: 254, whatsapp: 24,
  language: 40, product: 240, model: 100, industry: 150, material: 240,
  maxSize: 80, capacity: 80, beltWidth: 80, beltSpeed: 80, layerThickness: 80,
  suspensionHeight: 80, installation: 120, cleaning: 120, altitude: 80,
  temperature: 80, voltage: 80, frequency: 80, phases: 80,
  projectDescription: 4000, sourcePage: 300, sourceUrl: 700,
  visitorId: 80, sessionId: 80, channel: 80, sourcePlatform: 120, utmCampaign: 160, submissionId: 36, website: 200
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,24}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const publicOrigin = "https://cowinmagnet.cl";

export function normalizeInquiry(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { errors: { form: "Expected a form object." }, payload: {} };
  }
  const errors = {};
  const payload = {};
  for (const [field, max] of Object.entries(limits)) {
    const value = raw[field];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      errors[field] = "Expected text.";
      continue;
    }
    const trimmed = value.trim();
    if (trimmed.length > max) {
      errors[field] = "Value is too long.";
      continue;
    }
    if (trimmed) payload[field] = trimmed;
  }
  for (const field of ["name", "country", "product", "projectDescription"]) {
    if (!payload[field]) errors[field] ||= "Required.";
  }
  if (!payload.email && !payload.whatsapp) errors.contact = "Email or phone is required.";
  if (payload.email && !emailPattern.test(payload.email)) errors.email = "Valid email is required.";
  if (payload.whatsapp && (!phonePattern.test(payload.whatsapp) || payload.whatsapp.replace(/\D/g, "").length < 7)) {
    errors.whatsapp = "Valid phone number is required.";
  }
  if (payload.website) errors.website = "Spam submission blocked.";
  if (payload.submissionId && !uuid.test(payload.submissionId)) errors.submissionId = "Invalid submission ID.";

  const testQuery = typeof payload.sourceUrl === "string" &&
    /[?&](?:analytics_)?test(?:=|&|$)/i.test(payload.sourceUrl);
  const testMarker = testQuery && /^TEST-CL-[A-Z0-9-]{8,60}$/.test(payload.name || "");
  const submissionId = payload.submissionId?.toLowerCase() || "";
  delete payload.submissionId;
  delete payload.website;
  if (!/^visitor-[a-z0-9-]+$/i.test(payload.visitorId || "")) delete payload.visitorId;
  if (!/^session-[a-z0-9-]+$/i.test(payload.sessionId || "")) delete payload.sessionId;
  try {
    const candidate = new URL(payload.sourceUrl || payload.sourcePage || "/", publicOrigin);
    if (!["cowinmagnet.cl", "www.cowinmagnet.cl", "localhost", "127.0.0.1"].includes(candidate.hostname) ||
        !/^\/(?:es-cl|es|en|pt-br)(?:\/|$)/.test(candidate.pathname)) throw Error("Unrecognized source");
    payload.sourcePage = candidate.pathname;
    payload.sourceUrl = publicOrigin + candidate.pathname;
    for (const key of ["model", "utm_source", "utm_medium", "utm_campaign"]) {
      if (!candidate.searchParams.has(key)) continue;
      const safe = new URL(payload.sourceUrl);
      safe.searchParams.set(key, candidate.searchParams.get(key).slice(0, 160));
      payload.sourceUrl = safe.href;
    }
  } catch {
    delete payload.sourcePage;
    delete payload.sourceUrl;
  }
  if (testMarker) payload.isTest = true;
  return { errors, payload, submissionId };
}
