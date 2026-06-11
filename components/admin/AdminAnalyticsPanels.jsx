"use client";

import { useMemo, useState } from "react";

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "short",
    timeStyle: "medium",
    hour12: false
  }).format(new Date(value));
}

function metric(label, value, note) {
  return (
    <article>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{note}</small>
    </article>
  );
}

function barList(rows = []) {
  const max = Math.max(1, ...rows.map((row) => row.value || 0));
  return (
    <div className="admin-bars">
      {rows.map((row) => (
        <div key={row.label}>
          <span>{row.displayLabel || row.label}</span>
          <b style={{ width: `${Math.max(8, ((row.value || 0) / max) * 100)}%` }}>{row.value}</b>
        </div>
      ))}
      {!rows.length ? <p className="admin-empty">暂无数据</p> : null}
    </div>
  );
}

function exportCsv(rows, filename) {
  const header = Object.keys(rows[0] || {});
  const body = [
    header.join(","),
    ...rows.map((row) => header.map((key) => JSON.stringify(row[key] ?? "")).join(","))
  ].join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminOverviewPanel({ data, contentStats }) {
  return (
    <>
      <section className="admin-live-note">
        <span>30 分钟自动同步已配置</span>
        <small>当前存储：{data.storageMode}；页面、访客和询盘数据来自 analytics 事件表。</small>
      </section>
      <section className="admin-stats">
        {metric("页面浏览量", data.overview.pageViews, "PV")}
        {metric("独立访客", data.overview.uniqueVisitors, "UV")}
        {metric("访问会话", data.overview.sessions, "Sessions")}
        {metric("询盘提交", data.overview.inquiries, "Forms")}
      </section>
      <section className="admin-stats">
        {metric("产品", contentStats.products, "主站同步产品")}
        {metric("分类", contentStats.categories, "主站分类")}
        {metric("CMS 产品", contentStats.cmsProducts, "后台上传")}
        {metric("询盘", contentStats.enquiries, "销售线索")}
      </section>
      <section className="admin-grid">
        <article><h3>来源渠道</h3>{barList(data.traffic.channels)}</article>
        <article><h3>热门页面</h3>{barList(data.pages.slice(0, 8).map((page) => ({ label: page.page, value: page.views })))}</article>
      </section>
    </>
  );
}

export function AdminTrafficPanel({ data }) {
  return (
    <>
      <section className="admin-stats">
        {metric("平均停留", `${data.overview.avgDuration}s`, "参与度")}
        {metric("跳出率", `${data.overview.bounceRate}%`, "估算")}
        {metric("国家地区", data.traffic.countries.length, "市场")}
        {metric("设备类型", data.traffic.devices.length, "设备")}
      </section>
      <section className="admin-grid">
        <article><h3>渠道分布</h3>{barList(data.traffic.channels)}</article>
        <article><h3>来源平台</h3>{barList(data.traffic.sourcePlatforms)}</article>
        <article><h3>国家 / 地区</h3>{barList(data.traffic.countries)}</article>
        <article><h3>设备类型</h3>{barList(data.traffic.devices)}</article>
        <article><h3>浏览器</h3>{barList(data.traffic.browsers)}</article>
        <article><h3>操作系统</h3>{barList(data.traffic.operatingSystems)}</article>
      </section>
    </>
  );
}

export function AdminVisitorsPanel({ data }) {
  const [keyword, setKeyword] = useState("");
  const rows = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    if (!lower) return data.visitors;
    return data.visitors.filter((item) => JSON.stringify(item).toLowerCase().includes(lower));
  }, [data.visitors, keyword]);

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <p className="eyebrow">实时访客</p>
          <h2>最近访问记录</h2>
        </div>
        <button type="button" onClick={() => exportCsv(rows, "cowin-latam-visitors.csv")}>导出 CSV</button>
      </div>
      <div className="admin-filter-bar">
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索客户编号、页面、IP、来源" />
        <button type="button" onClick={() => setKeyword("")}>清空</button>
      </div>
      <small className="admin-result-count">当前显示 {rows.length} 条记录</small>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>时间</th><th>客户编号</th><th>国家</th><th>设备</th><th>浏览器</th><th>来源</th><th>来源平台</th><th>页面</th><th>客户标签</th><th>访问日</th><th>IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={`${item.id}-${index}`}>
                <td>{formatTime(item.timestamp)}</td>
                <td>C{String(item.customerNumber).padStart(5, "0")}</td>
                <td>{item.country}</td>
                <td>{item.device}</td>
                <td>{item.browser}</td>
                <td>{item.channel}</td>
                <td>{item.sourcePlatform}</td>
                <td>{item.page}</td>
                <td><span className={`admin-customer-tag ${item.visitDayNumber === 1 ? "new" : "returning"}`}>{item.visitDayNumber === 1 ? "新客户" : "老客户"}</span></td>
                <td>第 {item.visitDayNumber} 次访问日</td>
                <td>{item.ip || "-"}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan="11">没有匹配记录。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminPagesPanel({ data }) {
  return (
    <section className="admin-panel">
      <p className="eyebrow">页面表现</p>
      <h2>落地页数据表现</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>页面</th><th>URL</th><th>浏览</th><th>访客</th><th>平均停留</th><th>询盘率</th></tr></thead>
          <tbody>
            {data.pages.map((page) => (
              <tr key={page.page}>
                <td>{page.title}</td><td>{page.page}</td><td>{page.views}</td><td>{page.visitors}</td><td>{page.avgDuration}s</td><td>{page.conversionRate}%</td>
              </tr>
            ))}
            {!data.pages.length ? <tr><td colSpan="6">暂无页面数据。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminJourneysPanel({ data }) {
  return (
    <section className="admin-panel">
      <p className="eyebrow">访问路径</p>
      <h2>客户浏览路径</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>来源页面</th><th>目标页面</th><th>次数</th></tr></thead>
          <tbody>
            {data.journeys.map((item) => {
              const [from, to] = item.route.split(" -> ");
              return <tr key={item.route}><td>{from}</td><td>{to}</td><td>{item.value}</td></tr>;
            })}
            {!data.journeys.length ? <tr><td colSpan="3">暂无路径数据。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminSearchConsolePanel({ data }) {
  const configured = data.searchConsole.configured;
  return (
    <section className="admin-panel">
      <p className="eyebrow">SEO 数据</p>
      <h2>Google Search Console 概览</h2>
      <div className={configured ? "admin-alert good" : "admin-alert"}>
        {configured ? "Search Console 站点已配置，部署后可接入正式搜索表现数据。" : "本地预览未配置 GOOGLE_SEARCH_CONSOLE_SITE_URL，当前展示接入占位。"}
      </div>
      <section className="admin-stats">
        {metric("点击", data.searchConsole.overview.clicks, "Clicks")}
        {metric("展示", data.searchConsole.overview.impressions, "Impressions")}
        {metric("CTR", `${data.searchConsole.overview.ctr}%`, "Click rate")}
        {metric("平均排名", data.searchConsole.overview.position || "-", "Position")}
      </section>
    </section>
  );
}
