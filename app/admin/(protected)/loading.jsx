export default function AdminLoading() {
  return (
    <section className="admin-panel admin-state-panel" aria-busy="true" aria-live="polite">
      <h2>正在加载…</h2>
      <div className="admin-state-skeleton" aria-hidden="true"><i /><i /><i /></div>
    </section>
  );
}
