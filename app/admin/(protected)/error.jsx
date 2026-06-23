"use client";

export default function AdminError({ error, reset }) {
  return (
    <section className="admin-panel">
      <p className="eyebrow">Error</p>
      <h2>后台数据读取失败</h2>
      <p className="admin-muted">{error?.message || "请稍后重试。"}</p>
      <button type="button" onClick={() => reset()}>重新加载</button>
    </section>
  );
}
