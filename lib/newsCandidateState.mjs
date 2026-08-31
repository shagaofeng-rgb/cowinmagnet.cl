export const NEWS_EDITORIAL_ALGORITHM_VERSION = "2026-08-31-v2";

const SELECTABLE_STATUSES = new Set(["candidate", "retry_pending", "reserved_for_cycle"]);
const RETRYABLE_QUALITY_FAILURES = new Set(["semantic_duplicate_recent_publication"]);

export function candidateCanBeSelected(candidate = {}, publishedFingerprints = new Set()) {
  return SELECTABLE_STATUSES.has(candidate.status) && !publishedFingerprints.has(candidate.sourceFingerprint);
}

export function candidateCanBeRequeued(candidate = {}) {
  if (candidate.status !== "rejected") return false;
  if (candidate.evaluationVersion === NEWS_EDITORIAL_ALGORITHM_VERSION) return false;
  const failures = Array.isArray(candidate.qualityFailures) ? candidate.qualityFailures : [];
  return failures.length > 0 && failures.every((failure) => RETRYABLE_QUALITY_FAILURES.has(failure));
}

export function mergeDiscoveredCandidate(existing, discovered) {
  if (!existing) return { action: "created", item: discovered };
  if (!candidateCanBeRequeued(existing)) return { action: "skipped", item: existing };

  return {
    action: "requeued",
    item: {
      ...existing,
      ...discovered,
      status: "candidate",
      candidateState: "candidate",
      qualityFailures: [],
      rejectReason: "",
      evaluationVersion: NEWS_EDITORIAL_ALGORITHM_VERSION,
      requeuedAt: new Date().toISOString(),
      requeueReason: "editorial_algorithm_upgrade"
    }
  };
}
