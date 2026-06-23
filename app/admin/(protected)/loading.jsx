export default function AdminLoading() {
  return (
    <section className="admin-panel">
      <p className="eyebrow">Loading</p>
      <h2>正在读取后台数据...</h2>
      <p className="admin-muted">请稍等，系统正在连接 CMS、Analytics 和询盘数据。</p>
    </section>
  );
}
