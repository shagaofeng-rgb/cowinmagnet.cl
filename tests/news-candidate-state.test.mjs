import test from "node:test";
import assert from "node:assert/strict";
import {
  candidateCanBeRequeued,
  candidateCanBeSelected,
  mergeDiscoveredCandidate,
  NEWS_EDITORIAL_ALGORITHM_VERSION
} from "../lib/newsCandidateState.mjs";

test("an old false-positive duplicate rejection is requeued once after the algorithm upgrade", () => {
  const existing = {
    status: "rejected",
    sourceFingerprint: "source-1",
    qualityFailures: ["semantic_duplicate_recent_publication"],
    evaluationVersion: "2026-08-20-v1"
  };
  const discovered = { status: "candidate", sourceFingerprint: "source-1", title: "Fresh eligible event" };
  const merged = mergeDiscoveredCandidate(existing, discovered);

  assert.equal(candidateCanBeRequeued(existing), true);
  assert.equal(merged.action, "requeued");
  assert.equal(merged.item.status, "candidate");
  assert.equal(merged.item.evaluationVersion, NEWS_EDITORIAL_ALGORITHM_VERSION);
  assert.deepEqual(merged.item.qualityFailures, []);
});

test("permanent rejections, used candidates and current-version rejections are never revived", () => {
  assert.equal(candidateCanBeRequeued({ status: "used", qualityFailures: ["semantic_duplicate_recent_publication"] }), false);
  assert.equal(candidateCanBeRequeued({ status: "rejected", qualityFailures: ["incomplete_source_evidence"] }), false);
  assert.equal(candidateCanBeRequeued({ status: "rejected", qualityFailures: ["semantic_duplicate_recent_publication"], evaluationVersion: NEWS_EDITORIAL_ALGORITHM_VERSION }), false);
});

test("published source fingerprints cannot be selected again", () => {
  assert.equal(candidateCanBeSelected({ status: "candidate", sourceFingerprint: "published" }, new Set(["published"])), false);
  assert.equal(candidateCanBeSelected({ status: "retry_pending", sourceFingerprint: "new" }, new Set(["published"])), true);
});
