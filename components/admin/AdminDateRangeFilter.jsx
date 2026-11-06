"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const options = [
  ["day", "今日"],
  ["week", "本周"],
  ["month", "本月"],
  ["custom", "自定义"]
];

export default function AdminDateRangeFilter({ range }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [start, setStart] = useState(range?.startInput || "");
  const [end, setEnd] = useState(range?.endInput || "");
  const [error, setError] = useState("");
  const [custom, setCustom] = useState(range?.preset === "custom");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setStart(range?.startInput || "");
    setEnd(range?.endInput || "");
    setCustom(range?.preset === "custom");
  }, [range?.startInput, range?.endInput, range?.preset]);

  function pushRange(value) {
    setError("");
    if (value === "custom") {
      if (!start || !end || start > end) return setError("请选择正确的开始和结束日期。");
      if (Date.parse(end) - Date.parse(start) > 365 * 86400000) return setError("一次最多查询 366 天。");
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    params.set("page", "1");
    params.set("candidatePage", "1");
    if (params.has("catalogPage")) params.set("catalogPage", "1");
    if (value === "custom") {
      params.set("start", start);
      params.set("end", end);
    } else {
      params.delete("start");
      params.delete("end");
    }
    const next = `${pathname}?${params.toString()}`;
    startTransition(() => next === `${pathname}?${searchParams.toString()}` ? router.refresh() : router.push(next, { scroll: false }));
  }

  return (
    <form className="admin-date-filter" aria-busy={pending} onSubmit={(event) => { event.preventDefault(); pushRange("custom"); }}>
      <div className="admin-date-filter-head">
        <span>时间范围</span>
        <small>智利时间：{range?.startInput} 至 {range?.endInput}</small>
      </div>
      <div className="admin-date-presets" role="group" aria-label="选择时间范围">
        {options.map(([value, label]) => (
          <button type="button" className={(custom ? value === "custom" : range?.preset === value) ? "is-active" : ""}
            aria-pressed={custom ? value === "custom" : range?.preset === value} disabled={pending}
            onClick={() => { setCustom(value === "custom"); if (value !== "custom") pushRange(value); }} key={value}>
            {label}
          </button>
        ))}
      </div>
      {custom ? <>
        <div className="admin-date-custom">
          <label>开始日期<input type="date" required value={start} onChange={(event) => setStart(event.target.value)} /></label>
          <label>结束日期<input type="date" required value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        </div>
        {error ? <p className="admin-field-error" role="alert">{error}</p> : null}
        <button className="admin-date-submit" type="submit" disabled={pending}>{pending ? "正在查询…" : "应用范围"}</button>
      </> : pending ? <small role="status">正在查询…</small> : null}
    </form>
  );
}
