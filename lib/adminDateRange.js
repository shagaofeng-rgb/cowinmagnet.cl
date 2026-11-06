import { ANALYTICS_TIMEZONE } from "./analyticsPolicy.js";

const DAY = 86400000;
const formatters = new Map();

export function localDateKey(date, timeZone = ANALYTICS_TIMEZONE) {
  if (!formatters.has(timeZone)) {
    formatters.set(timeZone, new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit"
    }));
  }
  const parts = Object.fromEntries(formatters.get(timeZone).formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function dateMillis(key) {
  return Date.parse(`${key}T00:00:00Z`);
}

function validDate(key) {
  const ms = dateMillis(key);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isFinite(ms)
    && new Date(ms).toISOString().slice(0, 10) === key;
}

export function shiftCalendarDay(key, days) {
  return new Date(dateMillis(key) + days * DAY).toISOString().slice(0, 10);
}

export function calendarDayKeys(range) {
  const start = range.startInput || localDateKey(range.startDate);
  const end = range.endInput || localDateKey(range.endDate);
  return Array.from({ length: Math.max(0, Math.min(366, (dateMillis(end) - dateMillis(start)) / DAY + 1)) },
    (_, index) => shiftCalendarDay(start, index));
}

// A local day can start at 01:00 or last 25 hours at a Chile DST transition.
function startOfLocalDay(key) {
  const center = dateMillis(key);
  let low = center - DAY;
  let high = center + DAY;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (localDateKey(new Date(mid)) < key) low = mid + 1;
    else high = mid;
  }
  return low;
}

export function getAdminDateRange(params = {}, now = new Date()) {
  const requestedPreset = String(params?.range || "week");
  const today = localDateKey(now);
  const weekday = (new Date(dateMillis(today)).getUTCDay() + 6) % 7;
  let startInput = shiftCalendarDay(today, -weekday);
  let endInput = today;
  let preset = "week";
  let label = "本周";

  if (requestedPreset === "day") {
    preset = "day";
    startInput = today;
    label = "今日";
  } else if (requestedPreset === "month") {
    preset = "month";
    startInput = `${today.slice(0, 8)}01`;
    label = "本月";
  } else if (requestedPreset === "custom") {
    const start = String(params.start || "");
    const end = String(params.end || "");
    if (validDate(start) && validDate(end) && start <= end && dateMillis(end) - dateMillis(start) <= 365 * DAY) {
      preset = "custom";
      startInput = start;
      endInput = end;
      label = "自定义";
    }
  }

  return {
    preset, label,
    startDate: new Date(startOfLocalDay(startInput)),
    endDate: new Date(startOfLocalDay(shiftCalendarDay(endInput, 1)) - 1),
    startInput, endInput,
    timezone: ANALYTICS_TIMEZONE,
    maxCustomDays: 366
  };
}
