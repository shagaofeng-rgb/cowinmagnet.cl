export const WEEKLY_SITEMAP_TRIGGER = "weekly-google-cron";

export function weeklySubmissionWindow(date = new Date()) {
  const start = new Date(date);
  const weekday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - weekday);
  start.setUTCHours(0, 0, 0, 0);
  return { start, due: weekday === 0 && date.getUTCHours() >= 1 };
}

export function weeklySubmissionSkip(lastSuccessfulAt, now = new Date()) {
  const { start, due } = weeklySubmissionWindow(now);
  if (!due) return { success: false, skipped: true, reason: "outside-weekly-window" };
  if (lastSuccessfulAt && new Date(lastSuccessfulAt) >= start) {
    return { success: false, skipped: true, reason: "already-submitted-this-week", lastSubmittedAt: new Date(lastSuccessfulAt).toISOString() };
  }
  return null;
}
