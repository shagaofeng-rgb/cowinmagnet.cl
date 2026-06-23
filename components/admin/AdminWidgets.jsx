"use client";

export function MetricCard({ label, value, note }) {
  return (
    <article className="admin-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

export function BarList({ rows = [] }) {
  const max = Math.max(...rows.map((row) => Number(row.value || 0)), 1);
  return (
    <div className="admin-bar-list">
      {rows.length ? rows.map((row) => (
        <div className="admin-bar-row" key={row.label || row.displayLabel}>
          <span>{row.displayLabel || row.label}</span>
          <div><i style={{ width: `${(Number(row.value || 0) / max) * 100}%` }} /></div>
          <strong>{row.value}</strong>
        </div>
      )) : <p className="admin-muted">暂无数据</p>}
    </div>
  );
}

export function TrendChart({ rows = [] }) {
  const max = Math.max(...rows.map((row) => Number(row.pv || row.value || 0)), 1);
  return (
    <div className="admin-trend">
      {rows.length ? rows.map((row) => {
        const value = Number(row.pv || row.value || 0);
        return (
          <div className="admin-trend-bar" key={row.date || row.label} title={`${row.date || row.label}: ${value}`}>
            <i style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
            <span>{String(row.date || row.label).slice(5)}</span>
          </div>
        );
      }) : <p className="admin-muted">暂无趋势数据</p>}
    </div>
  );
}

export function CsvExportButton({ rows = [], filename = "export.csv" }) {
  function download() {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(","),
      ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <button type="button" onClick={download} disabled={!rows.length}>导出 CSV</button>;
}
