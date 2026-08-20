import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const rawPath = path.join(root, "data", "news", "cowinmagnet-cl-south-america-sources.raw.md");
const jsonPath = path.join(root, "data", "news", "cowinmagnet-cl-source-catalog.seed.json");
const csvPath = path.join(root, "data", "news", "cowinmagnet-cl-source-catalog.seed.csv");
const modulePath = path.join(root, "data", "news", "cowinmagnet-cl-source-catalog.mjs");
const reportPath = path.join(root, "data", "news", "cowinmagnet-cl-source-normalization-report.md");

const groupByHeading = {
  "Mining & Mineral Processing": "mining-mineral-processing",
  "Recycling & Waste Processing": "recycling-waste",
  "Bulk Handling & Machinery": "bulk-machinery",
  "Cement, Concrete & Aggregates": "cement-aggregates",
  "Food Processing, Grain & Agriculture": "food-agriculture",
  "Chemicals, Plastics & Polymers": "chemicals-plastics",
  "Magnetics & Separation Technology": "magnetics-separation",
  "Industrial B2B, Trade Shows & Communities": "industrial-trade-community"
};

const verifiedFeeds = new Map([
  ["sernageomin.cl", "https://www.sernageomin.cl/feed/"],
  ["cochilco.cl", "https://www.cochilco.cl/web/feed/"],
  ["minmineria.cl", "https://www.minmineria.cl/feed/"],
  ["portalminero.com", "https://www.portalminero.com/wp/feed/"],
  ["mineria-pa.com", "https://www.mineria-pa.com/feed/"],
  ["canadianminingjournal.com", "https://www.canadianminingjournal.com/feed/"],
  ["mining-technology.com", "https://www.mining-technology.com/feed/"],
  ["northernminer.com", "https://www.northernminer.com/feed/"]
]);

const discoveryOnly = new Set(["reddit.com", "quora.com", "linkedin.com", "eng-tips.com", "bulk-online.com", "heavyequipmentforums.com", "mineralsforum.com", "powderforum.com", "plantoperations.com", "bulkmaterialhandling.net"]);
const tierA = /cochilco|sernageomin|sonami|iimp|snmpe|ficem|ich\.cl|asocem|abcp|anir|cempre|asiquim|abiquim|ieee|smenet|cemanet|expomin|fida|cchc|chilealimentos|abia|global-reia|asminternational|safety/;
const compoundSuffixes = new Set(["co.uk", "org.uk", "ac.uk", "com.au", "com.br", "com.ar", "com.pe", "com.mx", "co.za", "co.nz"]);

function canonicalDomain(value = "") {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  const parts = hostname.split(".").filter(Boolean);
  const suffix = parts.slice(-2).join(".");
  return parts.length > 3 && compoundSuffixes.has(suffix) ? parts.slice(-3).join(".") : parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
}

function regionFor(domain, name) {
  if (domain.endsWith(".cl") || /chile/i.test(name)) return "chile";
  if (domain.endsWith(".br") || /brasil|brazil/i.test(name)) return "brazil";
  if (domain.endsWith(".pe") || /per[uú]/i.test(name)) return "peru";
  if (domain.endsWith(".ar") || /argentina/i.test(name)) return "argentina";
  if (/latam|latin|pan-americana|south america/i.test(name)) return "latam";
  return "global";
}

function languagesFor(domain, region) {
  if (region === "brazil" || domain.endsWith(".br")) return ["pt-BR"];
  if (["chile", "peru", "argentina", "latam"].includes(region)) return ["es"];
  return ["en"];
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const raw = await fs.readFile(rawPath, "utf8");
let heading = "";
let ordinal = 0;
const catalog = [];
for (const line of raw.split(/\r?\n/)) {
  const headingMatch = line.match(/^##\s+(.+)$/);
  if (headingMatch) {
    heading = headingMatch[1].trim();
    continue;
  }
  const entryMatch = line.match(/^[-*]\s+(.+?)\s+\|\s+(https?:\/\/\S+)\s*$/);
  if (!entryMatch || !groupByHeading[heading]) continue;
  ordinal += 1;
  const name = entryMatch[1].trim();
  const requestedUrl = entryMatch[2].trim().replace(/[),.]+$/, "");
  const domain = canonicalDomain(requestedUrl);
  const region = regionFor(domain, name);
  const verifiedFeed = verifiedFeeds.get(domain);
  const tier = discoveryOnly.has(domain) ? "discovery-only" : tierA.test(`${name} ${domain}`.toLowerCase()) ? "A" : "B";
  catalog.push({
    id: `cowinmagnet-cl-${String(ordinal).padStart(3, "0")}-${domain.replace(/[^a-z0-9]+/g, "-")}`,
    sourceOrdinal: ordinal,
    rawEntry: `${name} | ${requestedUrl}`,
    name,
    requestedDomain: domain,
    canonicalDomain: domain,
    sourceGroup: groupByHeading[heading],
    industryTags: groupByHeading[heading].split("-"),
    region,
    contentLanguages: languagesFor(domain, region),
    discoveryMethod: verifiedFeed ? ["rss"] : ["public-page"],
    tier,
    active: false,
    validationStatus: "pending",
    robotsAllowed: null,
    rssOrApiUrl: verifiedFeed || "",
    useCount: 0,
    notes: verifiedFeed ? "Legacy feed endpoint retained for source-health verification; inactive until validation succeeds." : "Imported from the user directory; inactive until validation succeeds."
  });
}

const duplicateDomains = catalog.filter((entry, index) => catalog.findIndex((candidate) => candidate.canonicalDomain === entry.canonicalDomain) !== index).length;
const grouped = Object.groupBy(catalog, ({ sourceGroup }) => sourceGroup);
const csvColumns = ["id", "sourceOrdinal", "rawEntry", "name", "requestedDomain", "canonicalDomain", "sourceGroup", "industryTags", "region", "contentLanguages", "discoveryMethod", "tier", "active", "validationStatus", "robotsAllowed", "rssOrApiUrl", "useCount", "notes"];
const csv = [csvColumns.join(","), ...catalog.map((entry) => csvColumns.map((column) => csvCell(Array.isArray(entry[column]) ? entry[column].join("|") : entry[column])).join(","))].join("\n");
const report = `# CowinMagnet CL source normalization report\n\n- Imported raw entries: ${catalog.length}\n- Canonical-domain duplicates retained in raw catalog: ${duplicateDomains}\n- Bootstrap verified RSS sources: ${catalog.filter((entry) => entry.active).length}\n- Pending validation sources: ${catalog.filter((entry) => entry.validationStatus === "pending").length}\n- Discovery-only sources: ${catalog.filter((entry) => entry.tier === "discovery-only").length}\n\n## Section counts\n\n${Object.entries(grouped).map(([group, entries]) => `- ${group}: ${entries.length}`).join("\n")}\n\nAll pending sources remain inactive until a source-health validation run records robots permission, an accessible public discovery method, canonical domain, language, and a safe use classification.\n`;

await fs.writeFile(jsonPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
await fs.writeFile(csvPath, `${csv}\n`, "utf8");
await fs.writeFile(modulePath, `// Generated from cowinmagnet-cl-south-america-sources.raw.md.\nexport const sourceCatalog = ${JSON.stringify(catalog, null, 2)};\n`, "utf8");
await fs.writeFile(reportPath, report, "utf8");
console.log(JSON.stringify({ imported: catalog.length, active: catalog.filter((entry) => entry.active).length, duplicates: duplicateDomains }));
