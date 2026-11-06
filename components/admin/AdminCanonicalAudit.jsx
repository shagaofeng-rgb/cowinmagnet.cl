"use client";

import { useState } from "react";

const fields = [
  ["url", "检查网址"], ["verdict", "索引状态"], ["coverageState", "Google 说明"],
  ["lastCrawlTime", "最近抓取"], ["userCanonical", "网站指定规范页"], ["googleCanonical", "Google 选定规范页"],
  ["pageFetchState", "抓取结果"]
];
const quote = (value) => '"' + String(value ?? "").replace(/^[=+\-@\t\r]/, "'$&").replaceAll('"', '""') + '"';

export default function AdminCanonicalAudit() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function inspect(event) {
    event.preventDefault();
    if (busy) return;
    const input = new FormData(event.currentTarget).get("urls");
    const urls = [...new Set(String(input).split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
    if (!urls.length || urls.length > 100) { setError("每次可查询 1 至 100 条网址。"); return; }
    setRows([]);
    setPage(1);
    setTotal(urls.length);
    setError("");
    setBusy(true);
    try {
      for (let start = 0; start < urls.length; start += 12) {
        const response = await fetch("/api/admin/search-console/inspect", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ urls: urls.slice(start, start + 12) })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "暂时无法读取，请稍后重试。");
        setRows((previous) => [...previous, ...result.data]);
      }
    } catch (failure) {
      setError(failure.message || "暂时无法读取，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const content = [fields.map(([key]) => quote(key)).join(","),
      ...rows.map((row) => fields.map(([key]) => quote(row[key])).join(","))].join("\r\n");
    const href = URL.createObjectURL(new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = "cowin-cl-google-url-inspection-" + new Date().toISOString().slice(0, 10) + ".csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  return <section className="admin-panel" aria-busy={busy}>
    <form className="admin-form" onSubmit={inspect}>
      <label>智利站网址<textarea name="urls" rows={5} maxLength={50100} required /></label>
      <div className="admin-product-actions"><button type="submit" disabled={busy}>{busy ? "正在检查…" : "检查网址"}</button>
        {rows.length ? <button type="button" onClick={download} disabled={busy}>下载结果 CSV</button> : null}</div>
    </form>
    {error ? <p className="admin-alert" role="alert">{error}</p> : null}
    {total ? <p role="status">已检查 {rows.length} / {total} 条。</p> : null}
    {rows.length ? <>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr>{fields.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
        <tbody>{rows.slice((page - 1) * 20, page * 20).map((row) => <tr key={row.url}>{fields.map(([key]) => <td key={key}>{row[key] || "—"}</td>)}</tr>)}</tbody>
      </table></div>
      <div className="admin-pagination"><span>第 {page}/{Math.ceil(rows.length / 20)} 页</span>
        <div><button type="button" onClick={() => setPage(page - 1)} disabled={page === 1}>上一页</button>
          <button type="button" onClick={() => setPage(page + 1)} disabled={page * 20 >= rows.length}>下一页</button></div></div>
    </> : null}
  </section>;
}
