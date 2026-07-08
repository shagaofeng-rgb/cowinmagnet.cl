"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarList, CsvExportButton, MetricCard, TrendChart } from "@/components/admin/AdminWidgets";

const refreshMs = 30 * 60 * 1000;
const text = {
  refreshFail: "\u5b9e\u65f6\u5237\u65b0\u5931\u8d25\uff0c\u9875\u9762\u663e\u793a\u6700\u8fd1\u4e00\u6b21\u6570\u636e\u3002",
  refreshing: "\u6b63\u5728\u8bfb\u53d6\u6700\u65b0\u540e\u53f0\u6570\u636e...",
  syncOn: "30 \u5206\u949f\u81ea\u52a8\u540c\u6b65\u5df2\u5f00\u542f",
  frontendRefresh: "\u524d\u7aef\u5237\u65b0",
  init: "\u521d\u59cb\u5316\u4e2d",
  databaseConnected: "Analytics \u6570\u636e\u5e93\u5df2\u8fde\u63a5",
  storageMode: "Analytics \u5b58\u50a8\u6a21\u5f0f",
  analyticsNote: "PV\u3001UV\u3001\u8bbf\u5ba2\u8bb0\u5f55\u3001\u6765\u6e90\u6e20\u9053\u548c\u9875\u9762\u8868\u73b0\u5747\u6765\u81ea analytics_events \u6570\u636e\u3002",
  pageViews: "\u9875\u9762\u6d4f\u89c8\u91cf",
  uniqueVisitors: "\u72ec\u7acb\u8bbf\u5ba2",
  sessions: "\u8bbf\u95ee\u4f1a\u8bdd",
  enquiries: "\u8be2\u76d8\u63d0\u4ea4",
  effectiveVisit: "\u6709\u6548\u8bbf\u95ee",
  formEvent: "\u8868\u5355\u4e8b\u4ef6",
  productContent: "\u4ea7\u54c1\u5185\u5bb9",
  news: "News \u65b0\u95fb",
  blog: "\u9759\u6001\u6587\u7ae0",
  cmsStorage: "CMS \u5b58\u50a8",
  currentMode: "\u5f53\u524d\u6a21\u5f0f",
  fromAdmin: "\u6765\u81ea\u540e\u53f0",
  contentLib: "Blog \u5185\u5bb9\u5e93",
  trafficTrend: "\u6d41\u91cf\u8d8b\u52bf",
  dailyPvUv: "\u6bcf\u65e5 PV / UV",
  sourceChannel: "\u6765\u6e90\u6e20\u9053",
  whereFrom: "\u5ba2\u6237\u4ece\u54ea\u91cc\u6765",
  hotPages: "\u70ed\u95e8\u9875\u9762",
  pageRank: "\u9875\u9762\u8868\u73b0\u6392\u884c",
  seoSnapshot: "SEO \u5feb\u7167",
  clicks: "\u70b9\u51fb",
  impressions: "\u5c55\u793a",
  avgDuration: "\u5e73\u5747\u505c\u7559",
  bounceRate: "\u8df3\u51fa\u7387",
  countries: "\u56fd\u5bb6\u5730\u533a",
  devices: "\u8bbe\u5907\u7c7b\u578b",
  dailyTrend: "\u6bcf\u65e5\u8d8b\u52bf",
  dailyChange: "\u6bcf\u65e5\u6d4f\u89c8\u91cf\u53d8\u5316",
  acquisition: "\u83b7\u5ba2\u6765\u6e90",
  channelDist: "\u6e20\u9053\u5206\u5e03",
  sourcePlatform: "\u6765\u6e90\u5e73\u53f0",
  market: "\u76ee\u6807\u5e02\u573a",
  deviceEnv: "\u8bbe\u5907\u73af\u5883",
  attribution: "\u8425\u9500\u5f52\u56e0",
  realtimeVisitors: "\u5b9e\u65f6\u8bbf\u5ba2",
  recentVisits: "\u6700\u8fd1\u8bbf\u95ee\u8bb0\u5f55",
  time: "\u65f6\u95f4",
  customerNo: "\u5ba2\u6237\u7f16\u53f7",
  country: "\u56fd\u5bb6",
  device: "\u8bbe\u5907",
  browser: "\u6d4f\u89c8\u5668",
  source: "\u6765\u6e90",
  page: "\u9875\u9762",
  pagePerformance: "\u9875\u9762\u8868\u73b0",
  landingData: "\u843d\u5730\u9875\u6570\u636e",
  views: "\u6d4f\u89c8",
  visitors: "\u8bbf\u5ba2",
  conversion: "\u8be2\u76d8\u7387",
  journeys: "\u8bbf\u95ee\u8def\u5f84",
  pageJourney: "\u9875\u9762\u8df3\u8f6c\u8def\u5f84"
};

function useLiveAnalytics(initialData) {
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData || {});
  const [state, setState] = useState({ loading: false, error: "", syncedAt: "" });

  useEffect(() => setData(initialData || {}), [initialData]);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        setState((current) => ({ ...current, loading: true, error: "" }));
        const query = searchParams.toString();
        const response = await fetch(`/api/admin/analytics${query ? `?${query}` : ""}`, { cache: "no-store" });
        if (!response.ok) throw new Error("refresh failed");
        const next = await response.json();
        if (!active) return;
        setData(next);
        setState({
          loading: false,
          error: "",
          syncedAt: new Date().toLocaleTimeString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          })
        });
      } catch {
        if (active) setState((current) => ({ ...current, loading: false, error: text.refreshFail }));
      }
    }
    const timer = window.setInterval(refresh, refreshMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [searchParams]);

  return { data, state };
}

function LiveNote({ state }) {
  return (
    <div className={`admin-live-note ${state.error ? "error" : ""}`}>
      <span>{state.loading ? text.refreshing : text.syncOn}</span>
      <small>{state.error || `${text.frontendRefresh}: ${state.syncedAt || text.init}`}</small>
    </div>
  );
}

function list(rows) {
  return Array.isArray(rows) ? rows : [];
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

export function AdminOverviewRealtime({ initialData, contentStats = {} }) {
  const { data, state } = useLiveAnalytics(initialData);
  const { overview = {}, traffic = {}, pages = [], searchConsole = {}, storageMode } = data;
  return (
    <>
      <LiveNote state={state} />
      <section className={`admin-alert ${storageMode === "database" ? "success" : "warning"}`}>
        <strong>{storageMode === "database" ? text.databaseConnected : `${text.storageMode}: ${storageMode || "-"}`}</strong>
        <span>{text.analyticsNote}</span>
      </section>
      <section className="admin-grid four">
        <MetricCard label={text.pageViews} value={Number(overview.pageViews || 0).toLocaleString()} note="PV" />
        <MetricCard label={text.uniqueVisitors} value={Number(overview.uniqueVisitors || 0).toLocaleString()} note="UV" />
        <MetricCard label={text.sessions} value={Number(overview.sessions || 0).toLocaleString()} note={text.effectiveVisit} />
        <MetricCard label={text.enquiries} value={Number(overview.inquiries || 0).toLocaleString()} note={text.formEvent} />
      </section>
      <section className="admin-grid four">
        <MetricCard label={text.productContent} value={contentStats.products || 0} note={`${contentStats.cmsProducts || 0} ${text.fromAdmin}`} />
        <MetricCard label={text.news} value={contentStats.newsPosts || 0} note={`${contentStats.cmsNews || 0} ${text.fromAdmin}`} />
        <MetricCard label={text.blog} value={contentStats.blogPosts || 0} note={text.contentLib} />
        <MetricCard label={text.cmsStorage} value={contentStats.cmsStorageMode || "-"} note={text.currentMode} />
      </section>
      <section className="admin-grid two">
        <article className="admin-panel"><p className="eyebrow">{text.trafficTrend}</p><h2>{text.dailyPvUv}</h2><TrendChart rows={list(traffic.series)} /></article>
        <article className="admin-panel"><p className="eyebrow">{text.sourceChannel}</p><h2>{text.whereFrom}</h2><BarList rows={list(traffic.channels)} /></article>
      </section>
      <section className="admin-grid two">
        <article className="admin-panel"><p className="eyebrow">{text.hotPages}</p><h2>{text.pageRank}</h2><BarList rows={list(pages).slice(0, 8).map((page) => ({ label: page.title || page.page, value: page.views }))} /></article>
        <article className="admin-panel"><p className="eyebrow">{text.seoSnapshot}</p><h2>Google Search Console</h2><div className="admin-mini-metrics"><MetricCard label={text.clicks} value={searchConsole.overview?.clicks || 0} note="GSC" /><MetricCard label={text.impressions} value={searchConsole.overview?.impressions || 0} note="GSC" /></div></article>
      </section>
    </>
  );
}

export function AdminTrafficRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const { overview = {}, traffic = {}, acquisition = {} } = data;
  return (
    <>
      <LiveNote state={state} />
      <section className="admin-grid four">
        <MetricCard label={text.avgDuration} value={`${overview.avgDuration || 0}s`} note={text.pagePerformance} />
        <MetricCard label={text.bounceRate} value={`${overview.bounceRate || 0}%`} note={text.currentMode} />
        <MetricCard label={text.countries} value={list(traffic.countries).length} note={text.market} />
        <MetricCard label={text.devices} value={list(traffic.devices).length} note={text.deviceEnv} />
      </section>
      <section className="admin-panel"><p className="eyebrow">{text.dailyTrend}</p><h2>{text.dailyChange}</h2><TrendChart rows={list(traffic.series)} /></section>
      <section className="admin-grid four">
        <article className="admin-panel"><p className="eyebrow">{text.acquisition}</p><h2>{text.channelDist}</h2><BarList rows={list(traffic.channels)} /></article>
        <article className="admin-panel"><p className="eyebrow">{text.sourcePlatform}</p><h2>Search / Social / AI / Direct</h2><BarList rows={list(traffic.sourcePlatforms)} /></article>
        <article className="admin-panel"><p className="eyebrow">{text.market}</p><h2>{text.countries}</h2><BarList rows={list(traffic.countries)} /></article>
        <article className="admin-panel"><p className="eyebrow">{text.deviceEnv}</p><h2>{text.devices}</h2><BarList rows={list(traffic.devices)} /></article>
      </section>
      <section className="admin-panel">
        <p className="eyebrow">{text.attribution}</p>
        <h2>Session Source Acquisition</h2>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>Source</th><th>Channel</th><th>Visitors</th><th>Sessions</th><th>PV</th><th>Leads</th><th>CVR</th></tr></thead><tbody>{list(acquisition.session).map((row, index) => <tr key={`${row.source}-${index}`}><td>{row.source}</td><td>{row.channel}</td><td>{row.visitors}</td><td>{row.sessions}</td><td>{row.pageViews}</td><td>{row.leads}</td><td>{row.conversionRate}%</td></tr>)}</tbody></table>
        </div>
      </section>
    </>
  );
}

export function AdminVisitorsRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const visitors = list(data.visitors);
  const rows = useMemo(() => visitors.map((item) => ({ time: formatDate(item.timestamp), customer: `C${String(item.customerNumber || 0).padStart(5, "0")}`, country: item.country, page: item.page, source: item.sourcePlatform, ip: item.ip })), [visitors]);
  return (
    <>
      <LiveNote state={state} />
      <section className="admin-panel">
        <div className="admin-panel-head"><div><p className="eyebrow">{text.realtimeVisitors}</p><h2>{text.recentVisits}</h2></div><CsvExportButton rows={rows} filename="cowin-visitors.csv" /></div>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>{text.time}</th><th>{text.customerNo}</th><th>{text.country}</th><th>{text.device}</th><th>{text.browser}</th><th>{text.source}</th><th>{text.page}</th><th>IP</th></tr></thead><tbody>{visitors.map((item, index) => <tr key={`${item.timestamp}-${index}`}><td>{formatDate(item.timestamp)}</td><td>C{String(item.customerNumber || 0).padStart(5, "0")}</td><td>{item.country}</td><td>{item.device}</td><td>{item.browser}</td><td>{item.sourcePlatform}</td><td>{item.page}</td><td>{item.ip}</td></tr>)}</tbody></table>
        </div>
      </section>
    </>
  );
}

export function AdminPagesRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const pages = list(data.pages);
  return (
    <>
      <LiveNote state={state} />
      <section className="admin-panel">
        <p className="eyebrow">{text.pagePerformance}</p>
        <h2>{text.landingData}</h2>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>{text.page}</th><th>URL</th><th>{text.views}</th><th>{text.visitors}</th><th>{text.avgDuration}</th><th>{text.conversion}</th></tr></thead><tbody>{pages.map((page) => <tr key={page.page}><td>{page.title}</td><td>{page.page}</td><td>{page.views}</td><td>{page.visitors}</td><td>{page.avgDuration}s</td><td>{page.conversionRate}%</td></tr>)}</tbody></table>
        </div>
      </section>
    </>
  );
}

export function AdminJourneysRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const journeys = list(data.journeys);
  return (
    <>
      <LiveNote state={state} />
      <section className="admin-panel">
        <p className="eyebrow">{text.journeys}</p>
        <h2>{text.pageJourney}</h2>
        <BarList rows={journeys.map((item) => ({ label: item.route, value: item.value }))} />
      </section>
    </>
  );
}
