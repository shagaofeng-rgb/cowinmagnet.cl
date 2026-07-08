"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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

  function pushRange(value) {
    setError("");
    if (value === "custom" && start && end && start > end) {
      setError("开始日期不能晚于结束日期。");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    if (value === "custom") {
      params.set("start", start);
      params.set("end", end);
    } else {
      params.delete("start");
      params.delete("end");
    }
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  return (
    <form className="admin-date-filter" onSubmit={(event) => { event.preventDefault(); pushRange("custom"); }}>
      <div className="admin-date-filter-head">
        <span>时间范围</span>
        <small>当前查看：{range?.label}，{range?.startInput} 至 {range?.endInput}</small>
      </div>
      <div className="admin-date-presets" role="group" aria-label="选择时间范围">
        {options.map(([value, label]) => (
          <button type="button" className={range?.preset === value ? "is-active" : ""} onClick={() => pushRange(value)} key={value}>
            {label}
          </button>
        ))}
      </div>
      <div className="admin-date-custom">
        <input aria-label="开始日期" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        <input aria-label="结束日期" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
      </div>
      {error ? <p className="admin-field-error">{error}</p> : null}
      <button className="admin-date-submit" type="submit">刷新当前范围</button>
    </form>
  );
}
