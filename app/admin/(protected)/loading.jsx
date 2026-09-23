export default function AdminLoading() {
  return (
    <section className="admin-panel admin-state-panel" aria-busy="true" aria-live="polite">
      <p className="eyebrow">正在加载</p>
      <h2>正在读取后台数据</h2>
      <p className="admin-muted">正在准备当前页面所需的真实数据。</p>
      <div className="admin-state-skeleton" aria-hidden="true"><i /><i /><i /></div>
    </section>
  );
}
