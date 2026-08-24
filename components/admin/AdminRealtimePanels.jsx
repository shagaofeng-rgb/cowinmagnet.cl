"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarList, CsvExportButton, MetricCard, TrendChart } from "@/components/admin/AdminWidgets";

const refreshMs = 30_000;
const rows = (value) => Array.isArray(value) ? value : [];

function dateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}

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
        const response = await fetch("/api/admin/analytics" + (query ? "?" + query : ""), { cache: "no-store" });
        if (!response.ok) throw new Error("analytics refresh");
        const next = await response.json();
        if (active) {
          setData(next.data || next);
          setState({ loading: false, error: "", syncedAt: dateTime(new Date().toISOString()) });
        }
      } catch {
        if (active) setState((current) => ({ ...current, loading: false, error: "实时读取失败，页面保留最近一次可用数据。" }));
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, refreshMs);
    return () => { active = false; window.clearInterval(timer); };
  }, [searchParams]);
  return { data, state };
}

function LiveNote({ state, timezone = "America/Santiago" }) {
  return <div className={"admin-live-note" + (state.error ? " error" : "")} role="status"><span>{state.loading ? "正在读取实时运营数据…" : "实时数据已启用"}</span><small>{state.error || ("每 30 秒更新 · " + timezone + (state.syncedAt ? " · 刷新于 " + state.syncedAt : ""))}</small></div>;
}

function DataQuality({ dataQuality = {} }) {
  const excluded = rows(dataQuality.excludedReasons);
  return <section className="admin-data-quality"><div><p className="eyebrow">数据质量</p><strong>真实经营流量</strong><span>测试、预览、自动化与采集流量已标记，不计入经营指标。</span></div><div className="admin-quality-metrics"><span><b>{Number(dataQuality.activeEvents || 0).toLocaleString()}</b> 有效事件</span><span><b>{Number(dataQuality.excludedEvents || 0).toLocaleString()}</b> 已排除</span></div><small>{excluded.length ? "排除原因：" + excluded.map((item) => item.label + " " + item.value).join(" · ") : "当前区间未发现已标记的无效流量。"}</small></section>;
}

function EmptyRow({ columns }) {
  return <tr><td colSpan={columns}><div className="admin-empty">当前筛选范围内没有数据。</div></td></tr>;
}

function VisitorFilters({ data }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  function update(values) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    params.set("page", "1");
    router.push(pathname + "?" + params.toString());
  }
  return <div className="admin-query-controls">
    <label className="admin-search-control">搜索<input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") update({ query }); }} placeholder="访客、页面、来源或 IP" /></label>
    <label>国家<select value={searchParams.get("country") || ""} onChange={(event) => update({ country: event.target.value })}><option value="">全部国家</option>{rows(data?.traffic?.countries).map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}</select></label>
    <label>渠道<select value={searchParams.get("channel") || ""} onChange={(event) => update({ channel: event.target.value })}><option value="">全部渠道</option>{rows(data?.traffic?.channels).map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}</select></label>
    <label>访客类型<select value={searchParams.get("visitorType") || ""} onChange={(event) => update({ visitorType: event.target.value })}><option value="">全部类型</option><option value="New">新访客</option><option value="Returning">回访</option><option value="High intent">高意向</option><option value="Lead">询盘客户</option></select></label>
    <label>每页<select value={searchParams.get("pageSize") || "25"} onChange={(event) => update({ pageSize: event.target.value })}><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label>
    <button type="button" onClick={() => update({ query: "", country: "", channel: "", visitorType: "", pageSize: "25" })}>清除</button>
  </div>;
}

function Pagination({ meta = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(meta.page || 1);
  const totalPages = Number(meta.totalPages || 1);
  function move(nextPage) { const params = new URLSearchParams(searchParams.toString()); params.set("page", String(nextPage)); router.push(pathname + "?" + params.toString()); }
  return <div className="admin-pagination"><span>共 {Number(meta.total || 0).toLocaleString()} 位访客 · 第 {page}/{totalPages} 页</span><div><button type="button" disabled={page <= 1} onClick={() => move(page - 1)}>上一页</button><button type="button" disabled={page >= totalPages} onClick={() => move(page + 1)}>下一页</button></div></div>;
}

export function AdminOverviewRealtime({ initialData, contentStats = {} }) {
  const { data, state } = useLiveAnalytics(initialData);
  const overview = data.overview || {}, traffic = data.traffic || {}, pages = rows(data.pages), searchConsole = data.searchConsole || {};
  return <><LiveNote state={state} timezone={data.timezone} /><DataQuality dataQuality={data.dataQuality} />
    <section className="admin-kpi-grid"><MetricCard label="页面浏览量" value={Number(overview.pageViews || 0).toLocaleString()} note="PV · 有效流量" /><MetricCard label="独立访客" value={Number(overview.uniqueVisitors || 0).toLocaleString()} note="UV · 第一方标识" /><MetricCard label="访问会话" value={Number(overview.sessions || 0).toLocaleString()} note="Session" /><MetricCard label="询盘提交" value={Number(overview.inquiries || 0).toLocaleString()} note="已保存到后台" /></section>
    <section className="admin-grid two"><article className="admin-panel"><p className="eyebrow">访问趋势</p><h2>每日 PV / UV</h2><TrendChart rows={rows(traffic.series)} /></article><article className="admin-panel"><p className="eyebrow">获取渠道</p><h2>客户从哪里来</h2><BarList rows={rows(traffic.channels)} /></article></section>
    <section className="admin-grid two"><article className="admin-panel"><p className="eyebrow">热门页面</p><h2>页面表现排名</h2><BarList rows={pages.slice(0, 8).map((page) => ({ label: page.title || page.page, value: page.views }))} /></article><article className="admin-panel"><p className="eyebrow">内容与 SEO</p><h2>运营状态</h2><div className="admin-mini-metrics"><MetricCard label="Google 点击" value={searchConsole.overview?.clicks || 0} note="GSC 有数据延迟" /><MetricCard label="产品内容" value={contentStats.cmsProducts ?? 0} note={"News " + (contentStats.newsPosts || 0) + " · Blog " + (contentStats.blogPosts || 0)} /><MetricCard label="存储" value={data.storageMode || "-"} note="真实数据源" /></div></article></section>
  </>;
}

export function AdminTrafficRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const overview = data.overview || {}, traffic = data.traffic || {}, acquisition = data.acquisition || {};
  return <><LiveNote state={state} timezone={data.timezone} /><DataQuality dataQuality={data.dataQuality} />
    <section className="admin-kpi-grid"><MetricCard label="平均停留" value={(overview.avgDuration || 0) + "s"} note="页面事件" /><MetricCard label="跳出率" value={(overview.bounceRate || 0) + "%"} note="单页会话" /><MetricCard label="覆盖国家" value={rows(traffic.countries).length} note="访问 IP 地理头" /><MetricCard label="设备类型" value={rows(traffic.devices).length} note="浏览器识别" /></section>
    <section className="admin-panel"><p className="eyebrow">每日趋势</p><h2>有效访问变化</h2><TrendChart rows={rows(traffic.series)} /></section>
    <section className="admin-grid four"><article className="admin-panel"><p className="eyebrow">渠道</p><h2>来源分布</h2><BarList rows={rows(traffic.channels)} /></article><article className="admin-panel"><p className="eyebrow">平台</p><h2>搜索、社媒与 AI</h2><BarList rows={rows(traffic.sourcePlatforms)} /></article><article className="admin-panel"><p className="eyebrow">区域</p><h2>国家地区</h2><BarList rows={rows(traffic.countries)} /></article><article className="admin-panel"><p className="eyebrow">设备</p><h2>访问环境</h2><BarList rows={rows(traffic.devices)} /></article></section>
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="eyebrow">归因明细</p><h2>会话来源</h2></div><CsvExportButton rows={rows(acquisition.session).slice(0, 100)} filename="cowin-acquisition.csv" /></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>来源</th><th>渠道</th><th>访客</th><th>会话</th><th>PV</th><th>询盘</th><th>转化率</th></tr></thead><tbody>{rows(acquisition.session).slice(0, 100).map((row, index) => <tr key={row.source + "-" + index}><td>{row.source}</td><td>{row.channel}</td><td>{row.visitors}</td><td>{row.sessions}</td><td>{row.pageViews}</td><td>{row.leads}</td><td>{row.conversionRate}%</td></tr>)}{!rows(acquisition.session).length ? <EmptyRow columns={7} /> : null}</tbody></table></div></section>
  </>;
}

export function AdminVisitorsRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const visitors = rows(data.visitors);
  const exported = useMemo(() => visitors.map((item) => ({ time: dateTime(item.lastSeen), customer: "C" + String(item.customerNumber || 0).padStart(5, "0"), type: item.customerType, visits: item.visitCount, country: item.country, source: item.source, page: item.lastPage, ip: item.ipMasked })), [visitors]);
  return <><LiveNote state={state} timezone={data.timezone} /><DataQuality dataQuality={data.dataQuality} />
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="eyebrow">访客中心</p><h2>真实访问记录</h2></div><CsvExportButton rows={exported} filename="cowin-visitors.csv" /></div><VisitorFilters data={data} /><div className="admin-table-wrap"><table className="admin-table admin-visitors-table"><thead><tr><th>最近访问</th><th>访客</th><th>类型</th><th>次数</th><th>国家</th><th>来源</th><th>最后页面</th><th>浏览页面</th><th>脱敏 IP</th></tr></thead><tbody>{visitors.map((item) => <tr key={item.visitorId}><td>{dateTime(item.lastSeen)}</td><td>C{String(item.customerNumber || 0).padStart(5, "0")}</td><td><span className={"admin-visitor-chip " + String(item.customerType).toLowerCase().replace(/\s+/g, "-")}>{item.customerType}</span></td><td>{item.visitCount}</td><td>{item.country}</td><td>{item.source}</td><td>{item.lastPage}</td><td title={item.pages?.join(" → ")}>{item.pageCount} 页</td><td>{item.ipMasked}</td></tr>)}{!visitors.length ? <EmptyRow columns={9} /> : null}</tbody></table></div><Pagination meta={data.visitorMeta} /></section>
  </>;
}

export function AdminPagesRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  const pages = rows(data.pages).slice(0, 100);
  return <><LiveNote state={state} timezone={data.timezone} /><section className="admin-panel"><p className="eyebrow">页面表现</p><h2>落地页与询盘转化</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>页面</th><th>URL</th><th>浏览</th><th>访客</th><th>平均停留</th><th>询盘率</th></tr></thead><tbody>{pages.map((page) => <tr key={page.page}><td>{page.title}</td><td>{page.page}</td><td>{page.views}</td><td>{page.visitors}</td><td>{page.avgDuration}s</td><td>{page.conversionRate}%</td></tr>)}{!pages.length ? <EmptyRow columns={6} /> : null}</tbody></table></div></section></>;
}

export function AdminJourneysRealtime({ initialData }) {
  const { data, state } = useLiveAnalytics(initialData);
  return <><LiveNote state={state} timezone={data.timezone} /><section className="admin-panel"><p className="eyebrow">访问路径</p><h2>页面流转路径</h2><BarList rows={rows(data.journeys).slice(0, 50).map((item) => ({ label: item.route, value: item.value }))} /></section></>;
}
