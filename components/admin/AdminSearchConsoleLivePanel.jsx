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
  return `${row.clicks || 0} clicks / ${row.impressions || 0} impressions / CTR ${row.ctr || 0}% / Pos. ${row.position || "-"}`;
}

export default function AdminSearchConsoleLivePanel({ searchConsole }) {
  const configured = searchConsole.configured;
  const error = searchConsole.error;
  const overview = searchConsole.overview || {};
  const queries = searchConsole.queries || [];
  const pages = searchConsole.pages || [];
  const indexingStatus = searchConsole.indexingStatus || [];

  return (
    <section className="admin-panel">
      <p className="eyebrow">SEO Data</p>
      <h2>Google Search Console</h2>
      <div className={configured && !error ? "admin-alert good" : "admin-alert warning"}>
        {error ? `Connection issue: ${error}` : configured ? "Connected to Google Search Console live data." : "Google Search Console is not configured yet."}
      </div>

      <section className="admin-stats">
        {metric("Clicks", overview.clicks || 0, "GSC")}
        {metric("Impressions", overview.impressions || 0, "GSC")}
        {metric("CTR", `${overview.ctr || 0}%`, "Click rate")}
        {metric("Avg. position", overview.position || "-", "Position")}
      </section>

      <section className="admin-grid two">
        <article className="admin-panel">
          <p className="eyebrow">Search Queries</p>
          <h2>Top Queries</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Query</th><th>Performance</th></tr></thead>
              <tbody>
                {queries.slice(0, 10).map((row) => <tr key={row.query}><td>{row.query}</td><td>{rowMetric(row)}</td></tr>)}
                {!queries.length ? <tr><td colSpan="2">No query data returned yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel">
          <p className="eyebrow">Landing Pages</p>
          <h2>Top Pages</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Page</th><th>Performance</th></tr></thead>
              <tbody>
                {pages.slice(0, 10).map((row) => <tr key={row.page}><td>{row.page}</td><td>{rowMetric(row)}</td></tr>)}
                {!pages.length ? <tr><td colSpan="2">No page data returned yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="admin-panel">
        <p className="eyebrow">Indexing</p>
        <h2>Core URL Inspection</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>URL</th><th>Verdict</th><th>Coverage</th><th>Last crawl</th></tr></thead>
            <tbody>
              {indexingStatus.map((row) => (
                <tr key={row.url}>
                  <td>{row.url}</td>
                  <td>{row.verdict}</td>
                  <td>{row.coverageState}</td>
                  <td>{row.lastCrawlTime || "-"}</td>
                </tr>
              ))}
              {!indexingStatus.length ? <tr><td colSpan="4">No URL inspection data returned yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
