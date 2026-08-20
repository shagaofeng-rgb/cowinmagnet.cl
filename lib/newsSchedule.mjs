function localParts(date, timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  });
  return Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

export function localPublicationDayKey(site, date = new Date()) {
  const parts = localParts(date, site.timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function publicationWindow(site, date = new Date()) {
  const parts = localParts(date, site.timezone);
  const earliestHour = Number(site?.news?.publishEarliestLocalHour ?? 9);
  return {
    dayKey: `${parts.year}-${parts.month}-${parts.day}`,
    localHour: Number(parts.hour),
    isOpen: Number(parts.hour) >= earliestHour,
    timezone: site.timezone,
    earliestHour
  };
}

export function alreadyPublishedToday(site, articles = [], date = new Date()) {
  const today = localPublicationDayKey(site, date);
  return articles.some((article) => article.status === "published" && localPublicationDayKey(site, new Date(article.publishedAt || article.createdAt)) === today);
}
