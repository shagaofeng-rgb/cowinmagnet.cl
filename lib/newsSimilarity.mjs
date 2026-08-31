export const NEWS_DUPLICATION_THRESHOLD = 0.85;

function words(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]{3,}/g) || [];
}

function tokenSimilarity(left, right) {
  const a = new Set(words(left));
  const b = new Set(words(right));
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return common / (a.size + b.size - common);
}

function sourceFacts(item = {}) {
  return (item.sources || [])
    .flatMap((source) => [source?.title, source?.supportedFact])
    .filter(Boolean)
    .join(" ");
}

function editorialSignal(item = {}) {
  return [item.title, item.summary, item.sourceTitle, sourceFacts(item)].filter(Boolean).join(" ");
}

export function newsEventSimilarity(left = {}, right = {}) {
  if (left.sourceFingerprint && right.sourceFingerprint && left.sourceFingerprint === right.sourceFingerprint) return 1;
  if (left.eventFingerprint && right.eventFingerprint && left.eventFingerprint === right.eventFingerprint) return 1;

  const titleScore = tokenSimilarity(left.title, right.title);
  const signalScore = tokenSimilarity(editorialSignal(left), editorialSignal(right));
  return Math.max(titleScore, signalScore);
}

export function maxNewsDuplicationScore(candidate = {}, recentArticles = []) {
  return Math.max(0, ...recentArticles.map((article) => newsEventSimilarity(candidate, article)));
}
