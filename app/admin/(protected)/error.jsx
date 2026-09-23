"use client";

export default function AdminError({ reset }) {
  return (
    <section className="admin-panel admin-state-panel" role="alert">
      <p className="eyebrow">暂时不可用</p>
      <h2>此页数据暂时无法加载</h2>
      <p className="admin-muted">数据未被修改或删除。请重新加载；若问题持续，系统会自动记录本次异常。</p>
      <button type="button" onClick={() => reset()}>重新加载</button>
    </section>
  );
}
