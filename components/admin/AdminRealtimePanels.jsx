"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarList, CsvExportButton, MetricCard, TrendChart } from "@/components/admin/AdminWidgets";

const refreshMs = 30 * 60 * 1000;

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
        if (active) setState((current) => ({ ...current, loading: false, error: "实时刷新失败，页面显示最近一次数据。" }));
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
      <span>{state.loading ? "正在读取最新后台数据..." : "30 分钟自动同步已开启"}</span>
      <small>{state.error || `前端刷新：${state.syncedAt || "初始化中"}，后台数据按当前时间范围读取。`}</small>
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
        <strong>{storageMode === "database" ? "Analytics 数据库已连接" : "Analytics 当前为本地存储"}</strong>
        <span>PV、UV、访客记录、来源渠道和页面表现从 analytics_events 数据读取。</span>
      </section>
      <section className="admin-grid four">
        <MetricCard label="页面浏览量" value={Number(overview.pageViews || 0).toLocaleString()} note="PV" />
        <MetricCard label="独立访客" value={Number(overview.uniqueVisitors || 0).toLocaleString()} note="UV" />
        <MetricCard label="访问会话" value={Number(overview.sessions || 0).toLocaleString()} note="有效访问" />
        <MetricCard label="询盘提交" value={Number(overview.inquiries || 0).toLocaleString()} note="表单事件" />
      </section>
      <section className="admin-grid four">
        <MetricCard label="产品内容" value={contentStats.products || 0} note={`${contentStats.cmsProducts || 0} 个来自后台`} />
        <MetricCard label="News 新闻" value={contentStats.newsPosts || 0} note={`${contentStats.cmsNews || 0} 个来自后台`} />
        <MetricCard label="静态文章" value={contentStats.blogPosts || 0} note="Blog 内容库" />
        <MetricCard label="CMS 存储" value={contentStats.cmsStorageMode || "unknown"} note="当前模式" />
      </section>
      <section className="admin-grid two">
        <article className="admin-panel"><p className="eyebrow">流量趋势</p><h2>每日 PV / UV</h2><TrendChart rows={list(traffic.series)} /></article>
        <article className="admin-panel"><p className="eyebrow">来源渠道</p><h2>客户从哪里来</h2><BarList rows={list(traffic.channels)} /></article>
      </section>
      <section className="admin-grid two">
        <article className="admin-panel"><p className="eyebrow">热门页面</p><h2>页面表现排行</h2><BarList rows={list(pages).slice(0, 8).map((page) => ({ label: page.title || page.page, value: page.views }))} /></article>
        <article className="admin-panel"><p className="eyebrow">SEO 快照</p><h2>Google Search Console</h2><div className="admin-mini-metrics"><MetricCard label="点击" value={searchConsole.overview?.clicks || 0} note="GSC" /><MetricCard label="展示" value={searchConsole.overview?.impressions || 0} note="GSC" /></div></article>
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
        <MetricCard label="平均停留" value={`${overview.avgDuration || 0}s`} note="页面参与度" />
        <MetricCard label="跳出率" value={`${overview.bounceRate || 0}%`} note="估算值" />
        <MetricCard label="国家地区" value={list(traffic.countries).length} note="活跃市场" />
        <MetricCard label="设备类型" value={list(traffic.devices).length} note="访问设备" />
      </section>
      <section className="admin-panel"><p className="eyebrow">每日趋势</p><h2>每日浏览量变化</h2><TrendChart rows={list(traffic.series)} /></section>
      <section className="admin-grid four">
        <article className="admin-panel"><p className="eyebrow">获客来源</p><h2>渠道分布</h2><BarList rows={list(traffic.channels)} /></article>
        <article className="admin-panel"><p className="eyebrow">来源平台</p><h2>搜索 / 社媒 / AI / 直接访问</h2><BarList rows={list(traffic.sourcePlatforms)} /></article>
        <article className="admin-panel"><p className="eyebrow">目标市场</p><h2>国家 / 地区</h2><BarList rows={list(traffic.countries)} /></article>
        <article className="admin-panel"><p className="eyebrow">设备环境</p><h2>设备类型</h2><BarList rows={list(traffic.devices)} /></article>
      </section>
      <section className="admin-panel">
        <p className="eyebrow">营销归因</p>
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
        <div className="admin-panel-head"><div><p className="eyebrow">实时访客</p><h2>最近访问记录</h2></div><CsvExportButton rows={rows} filename="cowin-visitors.csv" /></div>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>时间</th><th>客户编号</th><th>国家</th><th>设备</th><th>浏览器</th><th>来源</th><th>页面</th><th>IP</th></tr></thead><tbody>{visitors.map((item, index) => <tr key={`${item.timestamp}-${index}`}><td>{formatDate(item.timestamp)}</td><td>C{String(item.customerNumber || 0).padStart(5, "0")}</td><td>{item.country}</td><td>{item.device}</td><td>{item.browser}</td><td>{item.sourcePlatform}</td><td>{item.page}</td><td>{item.ip}</td></tr>)}</tbody></table>
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
        <p className="eyebrow">页面表现</p>
        <h2>落地页数据</h2>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>页面</th><th>URL</th><th>浏览</th><th>访客</th><th>平均停留</th><th>询盘率</th></tr></thead><tbody>{pages.map((page) => <tr key={page.page}><td>{page.title}</td><td>{page.page}</td><td>{page.views}</td><td>{page.visitors}</td><td>{page.avgDuration}s</td><td>{page.conversionRate}%</td></tr>)}</tbody></table>
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
        <p className="eyebrow">访问路径</p>
        <h2>页面跳转路径</h2>
        <BarList rows={journeys.map((item) => ({ label: item.route, value: item.value }))} />
      </section>
    </>
  );
}
