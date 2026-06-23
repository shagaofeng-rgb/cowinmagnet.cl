"use client";

import { useEffect, useState } from "react";

const refreshMs = 30 * 60 * 1000;

export default function AdminLiveStatus() {
  const [status, setStatus] = useState({ loading: true, pageViews: 0, inquiries: 0, syncedAt: "" });

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/admin/analytics/overview?range=day", { cache: "no-store" });
        if (!response.ok) throw new Error("failed");
        const data = await response.json();
        if (!active) return;
        setStatus({
          loading: false,
          pageViews: Number(data.pageViews || 0),
          inquiries: Number(data.inquiries || 0),
          syncedAt: new Date().toLocaleTimeString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          })
        });
      } catch {
        if (!active) return;
        setStatus((current) => ({ ...current, loading: false, syncedAt: "同步失败" }));
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
      <small>最近同步：{status.syncedAt || "-"} 北京时间</small>
    </div>
  );
}
