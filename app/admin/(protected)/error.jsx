"use client";

export default function AdminError({ reset }) {
  return (
    <section className="admin-panel">
      <p className="eyebrow">Error</p>
      <h2>后台数据读取失败</h2>
      <p className="admin-muted">暂时无法完成本次读取，请稍后重试。</p>
      <button type="button" onClick={() => reset()}>重新加载</button>
    </section>
  );
}
