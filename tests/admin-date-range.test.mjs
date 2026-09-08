import assert from "node:assert/strict";
import test from "node:test";
import { getAdminDateRange } from "../lib/adminDateRange.js";

test("admin reporting presets use Chile calendar periods", () => {
  const week = getAdminDateRange({ range: "week" });
  const month = getAdminDateRange({ range: "month" });
  const day = getAdminDateRange({ range: "day" });

  assert.equal(new Date(`${week.startInput}T12:00:00Z`).getUTCDay(), 1);
  assert.equal(month.startInput.slice(-2), "01");
  assert.equal(day.startInput, day.endInput);
});

test("admin reporting accepts a valid custom range and falls back safely", () => {
  const custom = getAdminDateRange({ range: "custom", start: "2026-08-01", end: "2026-08-31" });
  const invalid = getAdminDateRange({ range: "custom", start: "2026-08-31", end: "2026-08-01" });

  assert.equal(custom.preset, "custom");
  assert.equal(custom.startInput, "2026-08-01");
  assert.equal(invalid.preset, "week");
});
