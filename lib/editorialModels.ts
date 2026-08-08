export type EditorialStatus = "discovery" | "verified" | "eligible" | "planned" | "generating" | "evidence_review" | "quality_review" | "scheduled" | "published" | "monitored";
export type NewsSource = { url: string; domain: string; title: string; publishedAt: string; accessedAt: string; supportedFact: string; evidenceLocation: string };
export type NewsCandidate = { id: string; topic: string; country: string; productSlug: string; sources: NewsSource[]; status: EditorialStatus; rejectionReasons: string[] };
export type EditorialPlan = { id: string; candidateId: string; angle: string; searchIntent: string; outline: string[]; targetProduct: string; status: EditorialStatus };
export type GeneratedArticle = { slug: string; title: string; summary: string; body: string; image: string; imageRightsRecord: string; status: EditorialStatus; idempotencyKey: string };
export type ArticleSource = NewsSource & { articleSlug: string };
export type PublicationRun = { id: string; candidateSlug: string; startedAt: string; finishedAt?: string; status: "passed" | "rejected" | "failed" | "dry_run"; failures: string[] };
export type IndexingObservation = { url: string; observedAt: string; source: "search-console" | "manual"; state: "submitted" | "discovered" | "crawled" | "indexed" | "not-indexed" | "unknown"; evidence: string };
