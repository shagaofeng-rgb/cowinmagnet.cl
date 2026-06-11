const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value) {
  return String(value).padStart(2, "0");
}

function inputDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getAdminDateRange(params = {}) {
  const requestedPreset = String(params?.range || "week");
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  let startDate = new Date(endDate.getTime() - 6 * DAY_MS);
  let preset = requestedPreset;
  let label = "本周";

  if (requestedPreset === "day") {
    startDate = new Date(endDate);
    label = "今日";
  } else if (requestedPreset === "month") {
    startDate = new Date(endDate.getTime() - 29 * DAY_MS);
    label = "本月";
  } else if (requestedPreset === "custom" && params.start && params.end) {
    const customStart = new Date(`${params.start}T00:00:00`);
    const customEnd = new Date(`${params.end}T23:59:59`);
    if (!Number.isNaN(customStart.getTime()) && !Number.isNaN(customEnd.getTime()) && customStart <= customEnd) {
      startDate = customStart;
      endDate.setTime(customEnd.getTime());
      label = "自定义";
    } else {
      preset = "week";
    }
  } else {
    preset = "week";
  }

  startDate.setHours(0, 0, 0, 0);

  return {
    preset,
    label,
    startDate,
    endDate,
    startInput: inputDate(startDate),
    endInput: inputDate(endDate),
    maxCustomDays: 731
  };
}
