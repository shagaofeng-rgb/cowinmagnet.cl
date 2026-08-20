function clean(value = "") {
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&#8230;/g, "...")
    .replace(/\s+/g, " ").trim();
}

function tag(item, name) {
  return item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || "";
}

function normalizeUrl(value = "") {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function domain(value = "") {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function baseItem(raw, source, values) {
  return {
    ...values,
    accessedAt: new Date().toISOString(),
    sourceName: source.name,
    sourceGroup: source.group,
    sourceTrustScore: source.sourceTrustScore,
    tier: source.tier,
    country: source.country,
    domain: domain(values.url || source.rssOrApiUrl)
  };
}

function parseRssFeed(xml, source) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 15).map((match) => {
    const raw = match[1];
    const url = normalizeUrl(clean(tag(raw, "link")));
    const published = new Date(clean(tag(raw, "pubDate")) || 0);
    return baseItem(raw, source, { title: clean(tag(raw, "title")), url, excerpt: clean(tag(raw, "description")).slice(0, 1800), publishedAt: Number.isNaN(published.getTime()) ? "" : published.toISOString() });
  }).filter((item) => item.title && item.url && item.excerpt && item.publishedAt);
}

function attribute(value = "", name) {
  return String(value).match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || "";
}

function parseAtomFeed(xml, source) {
  return [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].slice(0, 15).map((match) => {
    const raw = match[1];
    const linkTag = raw.match(/<link(?:\s[^>]*)?\/?>(?:<\/link>)?/i)?.[0] || "";
    const url = normalizeUrl(attribute(linkTag, "href"));
    const published = new Date(clean(tag(raw, "published")) || clean(tag(raw, "updated")) || 0);
    return baseItem(raw, source, { title: clean(tag(raw, "title")), url, excerpt: clean(tag(raw, "summary") || tag(raw, "content")).slice(0, 1800), publishedAt: Number.isNaN(published.getTime()) ? "" : published.toISOString() });
  }).filter((item) => item.title && item.url && item.excerpt && item.publishedAt);
}

function parseJsonFeed(text, source) {
  try {
    const feed = JSON.parse(text);
    return (feed.items || []).slice(0, 15).map((item) => {
      const url = normalizeUrl(item.url || item.external_url || "");
      const published = new Date(item.date_published || item.date_modified || 0);
      return baseItem(item, source, { title: clean(item.title), url, excerpt: clean(item.summary || item.content_text || item.content_html).slice(0, 1800), publishedAt: Number.isNaN(published.getTime()) ? "" : published.toISOString() });
    }).filter((item) => item.title && item.url && item.excerpt && item.publishedAt);
  } catch {
    return [];
  }
}

export function parseNewsFeed(text, source) {
  const feedFormat = source.feedFormat || "";
  if (feedFormat === "json-feed" || /^\s*[{[]/.test(text)) return parseJsonFeed(text, source);
  if (feedFormat === "atom" || /<feed(?:\s|>)/i.test(text)) return parseAtomFeed(text, source);
  return parseRssFeed(text, source);
}
