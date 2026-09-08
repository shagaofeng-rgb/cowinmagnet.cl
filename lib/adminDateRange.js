import { ANALYTICS_TIMEZONE } from "./analyticsPolicy.js";

function parts(date) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date).filter((item) => item.type !== "literal").map((item) => [item.type, item.value]));
}

function inputDate(date) {
  const value = parts(date);
  return `${value.year}-${value.month}-${value.day}`;
}

function timeZoneOffset(date) {
  const value = new Intl.DateTimeFormat("en-US", {
    timeZone: ANALYTICS_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(date).filter((item) => item.type !== "literal").reduce((result, item) => ({ ...result, [item.type]: item.value }), {});
  return Date.UTC(value.year, Number(value.month) - 1, value.day, value.hour === "24" ? 0 : value.hour, value.minute, value.second) - date.getTime();
}

function zonedBoundary(dateInput, end = false) {
  const time = end ? "23:59:59.999" : "00:00:00.000";
  const naive = new Date(`${dateInput}T${time}Z`);
  return new Date(naive.getTime() - timeZoneOffset(naive));
}

function subtractCalendarDays(dateInput, days) {
  const date = new Date(`${dateInput}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function startOfCalendarWeek(dateInput) {
  const date = new Date(`${dateInput}T12:00:00Z`);
  // Chilean admin reporting follows a Monday-Sunday calendar week.
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return subtractCalendarDays(dateInput, daysSinceMonday);
}

function startOfCalendarMonth(dateInput) {
  return `${dateInput.slice(0, 8)}01`;
}

export function getAdminDateRange(params = {}) {
  const requestedPreset = String(params?.range || "week");
  const today = inputDate(new Date());
  let startInput = startOfCalendarWeek(today);
  let endInput = today;
  let preset = requestedPreset;
  let label = "本周";

  if (requestedPreset === "day") {
    startInput = today;
    label = "今日";
  } else if (requestedPreset === "month") {
    startInput = startOfCalendarMonth(today);
    label = "本月";
  } else if (requestedPreset === "custom" && params.start && params.end && params.start <= params.end) {
    startInput = String(params.start);
    endInput = String(params.end);
    label = "自定义";
  } else if (requestedPreset !== "week") {
    preset = "week";
  }

  return {
    preset,
    label,
    startDate: zonedBoundary(startInput),
    endDate: zonedBoundary(endInput, true),
    startInput,
    endInput,
    timezone: ANALYTICS_TIMEZONE,
    maxCustomDays: 731
  };
}
