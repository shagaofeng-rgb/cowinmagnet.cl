"use client";

import { useState } from "react";

const t = {
  never: "\u5c1a\u672a\u540c\u6b65",
  success: "\u540c\u6b65\u6b63\u5e38",
  error: "\u540c\u6b65\u5f02\u5e38",
  waiting: "\u7b49\u5f85\u9996\u6b21\u540c\u6b65",
  eyebrow: "\u6570\u636e\u72b6\u6001",
  title: "\u6700\u8fd1\u6570\u636e\u5904\u7406",
  running: "\u540c\u6b65\u4e2d...",
  runNow: "\u5237\u65b0\u72b6\u6001",
  current: "\u5f53\u524d\u72b6\u6001",
  latest: "\u6700\u8fd1\u540c\u6b65",
  processed: "\u672c\u6b21\u5904\u7406",
  rows: "\u6761",
  recentError: "\u9700\u8981\u5173\u6ce8"
};

function formatDate(value) {
  if (!value) return t.never;
  try {
    return new Date(value).toLocaleString("zh-CN", {
      timeZone: "America/Santiago",
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
  if (status === "success") return t.success;
  if (status === "error") return t.error;
  return t.waiting;
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
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const state = status.status || "waiting";

  return (
    <section className="admin-panel admin-sync-panel">
      <div className="admin-panel-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
        </div>
        <button type="button" onClick={runNow} disabled={busy}>
          {busy ? t.running : t.runNow}
        </button>
      </div>
      <div className="admin-sync-grid">
        <article>
          <span>{t.current}</span>
          <strong className={`admin-sync-pill ${state}`}>{statusLabel(state)}</strong>
        </article>
        <article>
          <span>{t.latest}</span>
          <strong>{formatDate(status.finishedAt)}</strong>
        </article>
        <article>
          <span>{t.processed}</span>
          <strong>{Number(status.processedCount || 0)} {t.rows}</strong>
        </article>
        <article>
          <span>更新方式</span>
          <strong>{status.source === "admin-manual" ? "手动更新" : "自动更新"}</strong>
        </article>
      </div>
      <p className="admin-sync-note">
        数据会在网站运营过程中持续更新。
        {status.error ? ` ${t.recentError}，请稍后刷新查看。` : ""}
      </p>
    </section>
  );
}
