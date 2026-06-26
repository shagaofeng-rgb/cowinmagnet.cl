"use client";

import { useEffect, useState } from "react";

const refreshMs = 30 * 60 * 1000;

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export default function AdminLiveStatus() {
  const [status, setStatus] = useState({ loading: true, pageViews: 0, inquiries: 0, syncedAt: "", state: "waiting" });

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const [overviewResponse, syncResponse] = await Promise.all([
          fetch("/api/admin/analytics/overview?range=day", { cache: "no-store" }),
          fetch("/api/admin/sync-status", { cache: "no-store" })
        ]);
        if (!overviewResponse.ok || !syncResponse.ok) throw new Error("failed");
        const overview = await overviewResponse.json();
        const sync = await syncResponse.json();
        if (!active) return;
        setStatus({
          loading: false,
          pageViews: Number(overview.pageViews || 0),
          inquiries: Number(overview.inquiries || 0),
          syncedAt: sync.data?.finishedAt || "",
          state: sync.data?.status || "waiting"
        });
      } catch {
        if (!active) return;
        setStatus((current) => ({ ...current, loading: false, state: "error" }));
      }
    }

    refresh();
    const timer = window.setInterval(refresh, refreshMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="admin-live-status">
      <span>半小时自动同步</span>
      <strong>{status.loading ? "连接中..." : `${status.pageViews} PV / ${status.inquiries} 询盘`}</strong>
      <small>{status.state === "error" ? "同步状态异常" : `最近同步：${formatTime(status.syncedAt)} 北京时间`}</small>
    </div>
  );
}
