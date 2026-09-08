import Link from "next/link";
import { notFound } from "next/navigation";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getVisitorDetail } from "@/lib/analyticsStore";
import { getEnquiriesForVisitor } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "访客详情 | Cowinmagnet.cl Admin" };

function dateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).format(date);
}

export default async function AdminVisitorDetailPage({ params, searchParams }) {
  const { visitorId } = await params;
  const query = await searchParams;
  const range = getAdminDateRange(query);
  const [detail, enquiries] = await Promise.all([
    getVisitorDetail(decodeURIComponent(visitorId), range),
    getEnquiriesForVisitor(decodeURIComponent(visitorId))
  ]);
  if (!detail) notFound();
  const profile = detail.allTime.overview;
  const selected = detail.selectedRange;

  return <>
    <section className="admin-page-head">
      <div>
        <p className="eyebrow">访客详情</p>
        <h1>匿名客户的完整访问路径</h1>
        <p>同一第一方访客标识会归入同一客户档案。IP 仅以脱敏形式显示；测试、采集与自动化流量不进入该档案。</p>
        <Link className="admin-back-link" href="/admin/visitors">返回访客记录</Link>
      </div>
      <AdminDateRangeFilter range={range} />
    </section>

    <section className="admin-kpi-grid">
      <article><p>客户类型</p><strong>{profile.customerType}</strong><small>按访问深度与询盘行为分类</small></article>
      <article><p>首次识别</p><strong>{dateTime(profile.firstSeen)}</strong><small>全周期记录</small></article>
      <article><p>累计访问</p><strong>{profile.sessions}</strong><small>{profile.pageViews} 次页面浏览</small></article>
      <article><p>最近 IP</p><strong>{profile.latestIpMasked}</strong><small>仅用于归属辅助判断</small></article>
    </section>

    <section className="admin-panel admin-visitor-profile">
      <div className="admin-panel-head"><div><p className="eyebrow">客户归属</p><h2>来源与区域画像</h2></div></div>
      <dl className="admin-detail-facts">
        <div><dt>国家/地区</dt><dd>{profile.countries.join(" · ") || "Unknown"}</dd></div>
        <div><dt>主要渠道</dt><dd>{profile.sources.join(" · ") || "Direct"}</dd></div>
        <div><dt>最近访问</dt><dd>{dateTime(profile.lastSeen)}</dd></div>
        <div><dt>当前筛选范围</dt><dd>{selected.overview.sessions} 次会话 · {selected.overview.pageViews} 次浏览</dd></div>
      </dl>
    </section>

    <section className="admin-panel">
      <div className="admin-panel-head"><div><p className="eyebrow">访问路径</p><h2>所选时间范围内的完整会话</h2></div></div>
      <div className="admin-visitor-timeline">
        {selected.sessions.map((session) => <article key={session.sessionId}>
          <header><strong>{dateTime(session.startedAt)}</strong><span>{session.country} · {session.source} · {session.device}</span></header>
          <ol>{session.events.map((event, index) => <li key={`${event.timestamp}-${index}`}><time>{dateTime(event.timestamp)}</time><b>{event.type === "form_submit" ? "提交表单" : "访问页面"}</b><span>{event.pageTitle}</span><small>{event.page}</small></li>)}</ol>
        </article>)}
        {!selected.sessions.length ? <div className="admin-empty">当前筛选范围内没有该访客的访问记录。</div> : null}
      </div>
    </section>

    <section className="admin-panel">
      <div className="admin-panel-head"><div><p className="eyebrow">关联线索</p><h2>该客户提交的询盘</h2></div></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>姓名</th><th>公司</th><th>国家</th><th>产品</th><th>状态</th><th>提交时间</th></tr></thead><tbody>
        {enquiries.map((item) => <tr key={item.id}><td>{item.name || "-"}</td><td>{item.company || "-"}</td><td>{item.country || "-"}</td><td>{item.product || item.productRequirement || "-"}</td><td>{item.status || "New"}</td><td>{dateTime(item.createdAt || item.submittedAt)}</td></tr>)}
        {!enquiries.length ? <tr><td colSpan="6"><div className="admin-empty">尚未关联到已提交询盘。</div></td></tr> : null}
      </tbody></table></div>
    </section>
  </>;
}
