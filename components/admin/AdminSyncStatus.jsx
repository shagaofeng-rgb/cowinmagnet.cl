"use client";

import { useEffect, useState } from "react";

const t = {
  never: "\u5c1a\u672a\u540c\u6b65",
  success: "\u540c\u6b65\u6b63\u5e38",
  error: "\u540c\u6b65\u5f02\u5e38",
  waiting: "\u7b49\u5f85\u9996\u6b21\u540c\u6b65",
  eyebrow: "\u6570\u636e\u540c\u6b65",
  title: "\u540e\u53f0\u6570\u636e\u540c\u6b65\u72b6\u6001",
  running: "\u540c\u6b65\u4e2d...",
  runNow: "\u7acb\u5373\u540c\u6b65",
  current: "\u5f53\u524d\u72b6\u6001",
  latest: "\u6700\u8fd1\u540c\u6b65",
  processed: "\u672c\u6b21\u5904\u7406",
  rows: "\u6761",
  storage: "\u6570\u636e\u5b58\u50a8",
  notePrefix: "Cron \u6bcf",
  noteSuffix: "\u5206\u949f\u81ea\u52a8\u540c\u6b65\u4e00\u6b21\uff1b\u524d\u53f0\u8bbf\u95ee\u3001\u6765\u6e90\u6e20\u9053\u3001UTM \u548c\u8bbf\u95ee\u8def\u5f84\u4f1a\u5199\u5165 Analytics \u6570\u636e\u5e93\u3002",
  recentError: "\u6700\u8fd1\u9519\u8bef"
};

function formatDate(value) {
  if (!value) return t.never;
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
          <span>{t.storage}</span>
          <strong>{status.analytics || status.storageMode || "-"}</strong>
        </article>
      </div>
      <p className="admin-sync-note">
        {t.notePrefix} {status.intervalMinutes || 30} {t.noteSuffix}
        {status.error ? ` ${t.recentError}: ${status.error}` : ""}
      </p>
    </section>
  );
}
