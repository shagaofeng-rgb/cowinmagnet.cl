import { markTestSession, readSessionAttribution, visitorIdentity } from "./visitorIdentity.js";

export type InquiryAttempt = { fingerprint: string; id: string };
type InquiryResult = { ok: boolean; id?: string; limited: boolean };

export async function submitInquiry(payload: Record<string, string>, attempt: { current: InquiryAttempt | null }): Promise<InquiryResult> {
  const location = new URL(window.location.href);
  const source = readSessionAttribution();
  const fields = { ...payload, ...visitorIdentity(), channel: source?.channel, sourcePlatform: source?.sourcePlatform, utmCampaign: source?.utmCampaign };
  if (markTestSession(location.searchParams)) location.searchParams.set("test", "1");
  const fingerprint = JSON.stringify(payload);
  if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
    attempt.current = { fingerprint, id: globalThis.crypto?.randomUUID?.() || "" };
  }
  const response = await fetch("/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ ...fields, sourceUrl: location.href, submissionId: attempt.current.id })
  });
  const result = await response.json();
  const ok = response.ok && result.success === true;
  if (ok) attempt.current = null;
  return { ok, id: ok ? result.data?.id : undefined, limited: response.status === 429 };
}
