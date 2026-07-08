"use client";

import { useEffect, useState } from "react";

function formatDate(value) {
  if (!value) return "尚未同步";
  try {
    return new Date(value).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  } catch {
    return value;
  }
}

function statusLabel(status) {
  if (status === "success") return "同步正常";
  if (status === "error") return "同步异常";
  return "等待首次同步";
}

export default function AdminSyncStatus({ initialStatus }) {
  const [status, setStatus] = useState(initialStatus || {});
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/admin/sync-status", { cache: "no-store" });
    if (!response.ok) throw new Error("sync status failed");
    const data = await response.json();
    setStatus(data.data || {});
  }

  async function runNow() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/sync-status", { method: "POST", cache: "no-store" });
      const data = await response.json();
      setStatus(data.data || {});
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {});
    const timer = window.setInterval(() => refresh().catch(() => {}), 30 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const state = status.status || "waiting";

  return (
    <section className="admin-panel admin-sync-panel">
      <div className="admin-panel-head">
        <div>
          <p className="eyebrow">数据同步</p>
          <h2>后台数据同步状态</h2>
        </div>
        <button type="button" onClick={runNow} disabled={busy}>
          {busy ? "同步中..." : "立即同步"}
        </button>
      </div>
      <div className="admin-sync-grid">
        <article>
          <span>当前状态</span>
          <strong className={`admin-sync-pill ${state}`}>{statusLabel(state)}</strong>
        </article>
        <article>
          <span>最近同步</span>
          <strong>{formatDate(status.finishedAt)}</strong>
        </article>
        <article>
          <span>本次处理</span>
          <strong>{Number(status.processedCount || 0)} 条</strong>
        </article>
        <article>
          <span>数据存储</span>
          <strong>{status.analytics || status.storageMode || "unknown"}</strong>
        </article>
      </div>
      <p className="admin-sync-note">
        Cron 每 {status.intervalMinutes || 30} 分钟自动同步一次；前台访问、来源渠道、UTM 和访问路径会写入 Analytics 数据库。
        {status.error ? ` 最近错误：${status.error}` : ""}
      </p>
    </section>
  );
}
