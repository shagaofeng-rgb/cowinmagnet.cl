export const VISITOR_KEY = "cowinmagnet_cl_visitor_id";
export const SESSION_KEY = "cowinmagnet_cl_session_id";
const TEST_KEY = "cowinmagnet_cl_test_session";
const SOURCE_KEY = "cowinmagnet_cl_session_source";
const temporaryIds = {};

export function makeTrackingId(prefix) {
  return prefix + "-" + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + "-" + Math.random().toString(16).slice(2));
}

function getId(storageName, key, prefix) {
  try {
    const storage = window[storageName];
    const current = storage.getItem(key);
    if (current && current.startsWith(prefix + "-")) return current;
    const next = makeTrackingId(prefix);
    storage.setItem(key, next);
    return next;
  } catch {
    temporaryIds[key] ||= makeTrackingId(prefix);
    return temporaryIds[key];
  }
}

export function visitorIdentity() {
  return {
    visitorId: getId("localStorage", VISITOR_KEY, "visitor"),
    sessionId: getId("sessionStorage", SESSION_KEY, "session")
  };
}

export function markTestSession(query) {
  const marked = query.has("test") || query.has("analytics_test");
  try {
    if (marked) window.sessionStorage.setItem(TEST_KEY, "1");
    return marked || window.sessionStorage.getItem(TEST_KEY) === "1";
  } catch {
    return marked;
  }
}

export function trackedPage(pathname, query) {
  const page = query.get("page");
  return page && /^(?:[2-9]|[1-9]\d{1,4})$/.test(page) ? pathname + "?page=" + page : pathname;
}

export function readSessionAttribution() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(SOURCE_KEY) || "null");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function saveSessionAttribution(source) {
  try {
    window.sessionStorage.setItem(SOURCE_KEY, JSON.stringify(source));
  } catch { /* The current page can still be attributed. */ }
}
