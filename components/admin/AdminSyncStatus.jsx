"use client";

import { useState } from "react";

const items = [
  ["traffic", "网站流量", "最近汇总"],
  ["search", "Google 搜索数据", "最近同步"],
  ["sitemap", "Google 站点地图", "最近提交尝试"],
  ["content", "博客发布", "最近更新"],
  ["mail", "询价邮件", "最近记录"]
];
const statusLabels = {
  success: "正常", error: "需要关注", waiting: "等待更新", unavailable: "未接通"
};
const dateFormat = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "America/Santiago", dateStyle: "medium", timeStyle: "short"
});
const countFormat = new Intl.NumberFormat("zh-CN");

function DateValue({ value }) {
  const date = new Date(value || "");
  return Number.isFinite(date.getTime()) ? <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time> : <>暂无记录</>;
}

export default function AdminSyncStatus({ initialStatus }) {
  const [systems, setSystems] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/sync-status", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.data?.systems) throw new Error();
      setSystems(result.data.systems);
    } catch {
      setError("暂时无法刷新，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return <section className="admin-panel admin-sync-panel" aria-busy={busy}>
    <div className="admin-panel-head">
      <div><h2>服务状态</h2><small>记录时间为智利当地时间</small></div>
      <button type="button" onClick={refresh} disabled={busy}>{busy ? "正在刷新…" : "刷新状态"}</button>
    </div>
    {error ? <p className="admin-alert" role="alert">{error}</p> : null}
    <div className="admin-sync-grid admin-operations-grid">
      {items.map(([key, title, label]) => {
        const item = systems[key] || {};
        const state = item.state || "waiting";
        return <article key={key}>
          <h3>{title}</h3>
          <strong className={"admin-sync-pill " + state}>{statusLabels[state] || statusLabels.waiting}</strong>
          <p>{label}：<DateValue value={item.at} /></p>
          {key === "traffic" && item.count != null ? <p>已汇总 {countFormat.format(item.count)} 条记录</p> : null}
          {key === "search" ? <p>Google 最近读取地图：<DateValue value={item.sitemapLastRead} /></p> : null}
          {key === "search" && item.dataThrough ? <p>搜索数据截至 {item.dataThrough}（Google 报告日期）</p> : null}
          {key === "sitemap" ? <p>每周一 09:00（北京时间）提交</p> : null}
          {key === "content" && item.count != null ? <p>{countFormat.format(item.count)} 篇在站文章</p> : null}
          {key === "mail" && item.pending != null ? <p>已发 {item.delivered} · 待发 {item.pending} · 失败 {item.failed}</p> : null}
        </article>;
      })}
    </div>
  </section>;
}
