const t = {
  eyebrow: "SEO \u6570\u636e",
  title: "\u641c\u7d22\u8868\u73b0",
  connected: "\u641c\u7d22\u8868\u73b0\u6570\u636e\u5df2\u66f4\u65b0\u3002",
  issue: "\u8fde\u63a5\u72b6\u6001",
  notConfigured: "\u6682\u672a\u83b7\u5f97\u641c\u7d22\u8868\u73b0\u6570\u636e\u3002",
  clicks: "\u70b9\u51fb",
  impressions: "\u5c55\u793a",
  ctr: "CTR",
  position: "\u5e73\u5747\u6392\u540d",
  queries: "\u641c\u7d22\u8bcd",
  topQueries: "\u70ed\u95e8\u641c\u7d22\u8bcd",
  landing: "\u7740\u9646\u9875",
  topPages: "\u70ed\u95e8\u7740\u9646\u9875",
  performance: "\u8868\u73b0",
  indexing: "\u6536\u5f55\u76d1\u63a7",
  inspection: "\u6838\u5fc3 URL \u68c0\u67e5\uff084 \u6761\uff0c\u4e0d\u4ee3\u8868\u5168\u7ad9\u6536\u5f55\u6570\uff09",
  sitemap: "\u5df2\u63d0\u4ea4 Sitemap",
  sitemapRead: "Google \u6700\u540e\u8bfb\u53d6",
  sitemapSubmitted: "Google \u6700\u540e\u63d0\u4ea4",
  sitemapDiscovered: "\u5df2\u53d1\u73b0 URL",
  sitemapIndexed: "Sitemap \u5df2\u6536\u5f55",
  sitemapStatus: "Sitemap \u72b6\u6001",
  verdict: "\u7ed3\u8bba",
  coverage: "\u8986\u76d6\u72b6\u6001",
  lastCrawl: "\u6700\u8fd1\u6293\u53d6",
  noQueries: "\u5f53\u524d\u65f6\u95f4\u8303\u56f4\u6682\u65e0\u641c\u7d22\u8bcd\u6570\u636e\u3002",
  noPages: "\u5f53\u524d\u65f6\u95f4\u8303\u56f4\u6682\u65e0\u7740\u9646\u9875\u6570\u636e\u3002",
  noInspection: "\u6682\u65e0 URL \u68c0\u67e5\u8fd4\u56de\u6570\u636e\u3002"
};

function metric(label, value, note) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function rowMetric(row) {
  return `\u70b9\u51fb ${row.clicks || 0} / \u5c55\u793a ${row.impressions || 0} / \u70b9\u51fb\u7387 ${row.ctr || 0}% / \u5e73\u5747\u6392\u540d ${row.position || "-"}`;
}

export default function AdminSearchConsoleLivePanel({ searchConsole }) {
  const configured = searchConsole.configured;
  const error = searchConsole.error;
  const overview = searchConsole.overview || {};
  const queries = searchConsole.queries || [];
  const pages = searchConsole.pages || [];
  const indexingStatus = searchConsole.indexingStatus || [];
  const sitemap = searchConsole.sitemap || {};
  const sitemapContents = sitemap.contents || [];
  const sitemapDiscovered = sitemapContents.reduce((sum, item) => sum + Number(item.submitted || 0), 0);
  const sitemapIndexed = sitemapContents.reduce((sum, item) => sum + Number(item.indexed || 0), 0);

  return (
    <section className="admin-panel">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2>{t.title}</h2>
      <div className={configured && !error ? "admin-alert good" : "admin-alert warning"}>
        {error ? "\u6570\u636e\u6682\u65f6\u65e0\u6cd5\u66f4\u65b0\uff0c\u8bf7\u7a0d\u540e\u5237\u65b0\u3002" : configured ? t.connected : t.notConfigured}
      </div>

      <section className="admin-stats">
        {metric(t.clicks, overview.clicks || 0, "\u9009\u5b9a\u65f6\u95f4\u8303\u56f4")}
        {metric(t.impressions, overview.impressions || 0, "\u9009\u5b9a\u65f6\u95f4\u8303\u56f4")}
        {metric(t.ctr, `${overview.ctr || 0}%`, "\u70b9\u51fb\u7387")}
        {metric(t.position, overview.position || "-", "\u5e73\u5747\u6392\u540d")}
      </section>

      <section className="admin-grid two">
        {metric(t.sitemapStatus, sitemap.success ? "\u6b63\u5e38" : "\u5f85\u5173\u6ce8", sitemap.error ? "\u8bf7\u7a0d\u540e\u5237\u65b0" : "")}
        {metric(t.sitemapDiscovered, sitemapDiscovered || "-", sitemapIndexed ? `${t.sitemapIndexed}: ${sitemapIndexed}` : "\u6682\u65e0\u7edf\u8ba1")}
        {metric(t.sitemapRead, sitemap.lastDownloaded || "-", t.sitemapSubmitted)}
        {metric(t.sitemapSubmitted, sitemap.lastSubmitted || "-", sitemap.isPending ? "\u5904\u7406\u4e2d" : "\u5df2\u66f4\u65b0")}
      </section>

      <section className="admin-grid two">
        <article className="admin-panel">
          <p className="eyebrow">{t.queries}</p>
          <h2>{t.topQueries}</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>{t.queries}</th><th>{t.performance}</th></tr></thead>
              <tbody>
                {queries.slice(0, 10).map((row) => <tr key={row.query}><td>{row.query}</td><td>{rowMetric(row)}</td></tr>)}
                {!queries.length ? <tr><td colSpan="2">{t.noQueries}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel">
          <p className="eyebrow">{t.landing}</p>
          <h2>{t.topPages}</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>URL</th><th>{t.performance}</th></tr></thead>
              <tbody>
                {pages.slice(0, 10).map((row) => <tr key={row.page}><td>{row.page}</td><td>{rowMetric(row)}</td></tr>)}
                {!pages.length ? <tr><td colSpan="2">{t.noPages}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="admin-panel">
        <p className="eyebrow">{t.indexing}</p>
        <h2>{t.inspection}</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>URL</th><th>{t.verdict}</th><th>{t.coverage}</th><th>{t.lastCrawl}</th></tr></thead>
            <tbody>
              {indexingStatus.map((row) => (
                <tr key={row.url}>
                  <td>{row.url}</td>
                  <td>{row.verdict}</td>
                  <td>{row.coverageState}</td>
                  <td>{row.lastCrawlTime || "-"}</td>
                </tr>
              ))}
              {!indexingStatus.length ? <tr><td colSpan="4">{t.noInspection}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
