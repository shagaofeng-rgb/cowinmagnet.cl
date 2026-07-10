"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSitemapActions() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  async function run(options) {
    setRunning(true);
    setMessage("正在检查 Sitemap...");
    try {
      const response = await fetch("/api/admin/sitemap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(options)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "执行失败");
      const run = result.run;
      setMessage(`执行成功：处理 ${run.processedCount} 个 URL，新增 ${run.added.length}，修改 ${run.modified.length}，删除 ${run.deleted.length}${run.submitted ? "，已提交 Search Console" : ""}。`);
      router.refresh();
    } catch (error) {
      setMessage(error?.message || "执行失败");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="admin-actions sitemap-actions">
      <button type="button" disabled={running} onClick={() => run({ dryRun: true })}>仅检查</button>
      <button type="button" disabled={running} onClick={() => run({ force: true })}>强制生成</button>
      <button type="button" disabled={running} onClick={() => run({ force: true, submit: true })}>生成并提交 Google</button>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
