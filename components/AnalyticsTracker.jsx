"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_KEY = "cowinmagnet_cl_visitor_id";
const SESSION_KEY = "cowinmagnet_cl_session_id";
const PREVIOUS_PAGE_KEY = "cowinmagnet_cl_previous_page";
const PENDING_EVENTS_KEY = "cowinmagnet_cl_pending_analytics";
const MAX_PENDING_EVENTS = 20;

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}

function getStoredId(storage, key, prefix) {
  try {
    const current = storage.getItem(key);
    if (current) return current;
    const next = makeId(prefix);
    storage.setItem(key, next);
    return next;
  } catch {
    return makeId(prefix);
  }
}

function readSource(params, referrer) {
  const utmSource = params.get("utm_source") || "";
  const utmMedium = params.get("utm_medium") || "";
  const utmCampaign = params.get("utm_campaign") || "";
  const utmTerm = params.get("utm_term") || "";
  const utmContent = params.get("utm_content") || "";

  if (utmSource || utmMedium || utmCampaign) {
    return {
      channel: utmMedium || "Campaign",
      sourcePlatform: utmSource || "UTM",
      sourceDetail: utmCampaign || "UTM campaign",
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
  }

  if (!referrer) {
    return { channel: "Direct", sourcePlatform: "Direct", sourceDetail: "No referrer or UTM", utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
  }

  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    host = referrer;
  }

  const aiHosts = ["chatgpt", "perplexity", "gemini", "copilot", "claude", "poe.com"];
  if (/(google|bing|yahoo|duckduckgo|baidu|yandex)/i.test(host)) {
    return { channel: "Organic Search", sourcePlatform: host, sourceDetail: referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
  }
  if (aiHosts.some((item) => host.includes(item))) {
    return { channel: "AI Search", sourcePlatform: host, sourceDetail: referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
  }
  if (/(linkedin|facebook|instagram|tiktok|twitter|x\.com|youtube)/i.test(host)) {
    return { channel: "Social", sourcePlatform: host, sourceDetail: referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
  }
  return { channel: "Referral", sourcePlatform: host || "Referral", sourceDetail: referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
}

function pendingEvents() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(PENDING_EVENTS_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function savePendingEvents(events) {
  try {
    window.sessionStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(events.slice(-MAX_PENDING_EVENTS)));
  } catch {
    // Analytics must never affect the public page when browser storage is blocked.
  }
}

async function send(payload) {
  const response = await fetch("/api/analytics/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  });
  if (!response.ok) throw new Error(`analytics ${response.status}`);
}

function queueEvent(payload) {
  savePendingEvents([...pendingEvents(), payload]);
}

async function flushPendingEvents() {
  const queued = pendingEvents();
  if (!queued.length) return;
  const remaining = [];
  for (const event of queued) {
    try {
      await send(event);
    } catch {
      remaining.push(event);
    }
  }
  savePendingEvents(remaining);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const query = searchParams.toString();
    const page = query ? `${pathname}?${query}` : pathname;
    if (lastTracked.current === page) return;
    lastTracked.current = page;

    const params = new URLSearchParams(query);
    const visitorId = getStoredId(window.localStorage, VISITOR_KEY, "visitor");
    const sessionId = getStoredId(window.sessionStorage, SESSION_KEY, "session");
    const previousPage = window.sessionStorage.getItem(PREVIOUS_PAGE_KEY) || "";
    const source = readSource(params, document.referrer);

    const event = {
      id: makeId("event"),
      type: "page_view",
      visitorId,
      sessionId,
      page,
      previousPage,
      pageTitle: document.title,
      referrer: document.referrer,
      language: navigator.language || "",
      timestamp: new Date().toISOString(),
      ...source
    };
    void (async () => {
      await flushPendingEvents();
      try {
        await send(event);
      } catch {
        queueEvent(event);
      }
    })();

    window.sessionStorage.setItem(PREVIOUS_PAGE_KEY, page);
  }, [pathname, searchParams]);

  return null;
}
