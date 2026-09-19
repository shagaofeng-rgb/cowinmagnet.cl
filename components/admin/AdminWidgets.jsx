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
  if (!rows.length) return <p className="admin-muted">当前范围暂无趋势数据。</p>;
  const values = rows.map((row) => Number(row.pv || row.value || 0));
  const max = Math.max(...values, 1);
  const width = Math.max(360, rows.length * 52);
  const height = 190;
  const points = values.map((value, index) => {
    const x = rows.length === 1 ? width / 2 : 24 + (index * (width - 48)) / (rows.length - 1);
    const y = 20 + (1 - value / max) * 126;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <div className="admin-line-chart" role="img" aria-label="每日访问趋势">
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <line x1="24" y1="146" x2={width - 24} y2="146" />
      <line x1="24" y1="83" x2={width - 24} y2="83" />
      <polyline points={points} />
      {values.map((value, index) => {
        const [x, y] = points.split(" ")[index].split(",");
        return <circle cx={x} cy={y} r="3.5" key={`${rows[index].date || index}-${value}`} />;
      })}
    </svg>
    <div className="admin-line-chart-labels">{rows.map((row) => <span key={row.date || row.label}>{String(row.date || row.label).slice(5)}</span>)}</div>
  </div>;
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
