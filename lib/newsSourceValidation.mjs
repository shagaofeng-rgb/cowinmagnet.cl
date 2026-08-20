import { canonicalDomain, sourceIsEligibleForPublishing } from "./newsSourceCatalog.mjs";

const DISCOVERY_ONLY_HOSTS = new Set(["reddit.com", "quora.com", "linkedin.com", "eng-tips.com", "bulk-online.com", "heavyequipmentforums.com"]);

export function classifySource({ name = "", requestedDomain = "", sourceGroup = "" } = {}) {
  const domain = canonicalDomain(requestedDomain);
  const text = `${name} ${sourceGroup} ${domain}`.toLowerCase();
  if (DISCOVERY_ONLY_HOSTS.has(domain) || /forum|community|directory|reddit|quora|linkedin/.test(text)) return "discovery-only";
  if (/government|regulator|association|chamber|institute|society|official|sernageomin|cochilco|sonami|iimp|ficem|asocem|abcp|ieee/.test(text)) return "A";
  if (/magazine|review|press|news|portal|mining|recycling|cement|bulk|food|chemical|plastics/.test(text)) return "B";
  return "C";
}

export function buildValidationResult(entry, result = {}) {
  const requestedDomain = canonicalDomain(entry?.requestedDomain || entry?.canonicalDomain || "");
  const canonical = canonicalDomain(result.finalUrl || requestedDomain);
  const robotsAllowed = result.robotsAllowed === true;
  const accessible = Number(result.status || 0) >= 200 && Number(result.status || 0) < 400;
  const discoverable = Array.isArray(result.discoveryMethod) && result.discoveryMethod.some((method) => ["rss", "atom", "json-feed", "api"].includes(method));
  const eligible = accessible && robotsAllowed && discoverable && sourceIsEligibleForPublishing({ ...entry, canonicalDomain: canonical, robotsAllowed, active: true, validationStatus: "verified" });
  return {
    sourceId: entry?.id || "",
    requestedDomain,
    canonicalDomain: canonical,
    checkedAt: new Date().toISOString(),
    httpStatus: Number(result.status || 0),
    finalUrl: result.finalUrl || "",
    robotsAllowed,
    discoveryMethod: result.discoveryMethod || [],
    contentLanguages: result.contentLanguages || [],
    rssOrApiUrl: result.rssOrApiUrl || "",
    validationStatus: eligible ? "verified" : robotsAllowed === false ? "robots-blocked" : accessible ? "needs_review" : "inactive",
    active: eligible,
    reason: result.reason || (eligible ? "verified_for_discovery" : "validation_requirements_not_met")
  };
}

export function canUseSourceForCandidate(entry, usage = {}) {
  if (!sourceIsEligibleForPublishing(entry)) return { eligible: false, reason: "source_not_verified" };
  if (Number(usage.domainUsesLast14Days || 0) >= 1) return { eligible: false, reason: "same_domain_cooldown_14d" };
  if (Number(usage.consecutiveGroupUses || 0) >= 2) return { eligible: false, reason: "source_group_consecutive_limit" };
  if (Number(usage.consecutiveRegionUses || 0) >= 2) return { eligible: false, reason: "region_consecutive_limit" };
  return { eligible: true, reason: "eligible" };
}
